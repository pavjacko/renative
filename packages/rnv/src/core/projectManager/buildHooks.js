import inquirer from 'inquirer';
import path from 'path';
import { build } from 'esbuild';
import { logDebug, logHook, logInfo, logWarning } from '../systemManager/logger';
import { executeAsync } from '../systemManager/exec';
import { fsExistsSync, copyFolderContentsRecursiveSync } from '../systemManager/fileutils';
import { getConfigProp } from '../common';
import { doResolve } from '../systemManager/resolve';

export const executePipe = async (c, key) => {
    logHook('executePipe', `('${key}')`);

    await buildHooks(c);

    const pipe = c.buildPipes ? c.buildPipes[key] : null;

    if (Array.isArray(pipe)) {
        await pipe.reduce(
            (accumulatorPromise, next) => {
                logHook(`buildHook.${next?.name}`, '(EXECUTING)');
                return accumulatorPromise.then(() => next(c));
            },
            Promise.resolve()
        );
    } else if (pipe) {
        logHook(`buildHook.${pipe?.name}`, '(EXECUTING)');
        await pipe(c);
    }
};

/* eslint-disable import/no-dynamic-require, global-require */
export const buildHooks = async (c) => {
    logDebug('buildHooks');

    const enableHookRebuild = getConfigProp(c, c.platform, 'enableHookRebuild');

    const shouldBuildHook = c.program.reset || c.program.resetHard || c.program.resetAssets
    || c.program.hooks || !fsExistsSync(c.paths.buildHooks.dist.dir) || enableHookRebuild === true
    || c.runtime.forceBuildHookRebuild;

    if ((!fsExistsSync(c.paths.buildHooks.index) && c.program.ci) || c.runtime.skipBuildHooks) {
        logInfo('No buld hooks found and in --ci mode. SKIPPING');
        return true;
    }


    if (!fsExistsSync(c.paths.buildHooks.index)) {
        const { confirm } = await inquirer.prompt({
            type: 'confirm',
            name: 'confirm',
            message: 'Build hooks not configured in this project. Configure?'
        });
        if (confirm) {
            copyFolderContentsRecursiveSync(
                path.join(c.paths.rnv.dir, 'coreTemplateFiles/buildHooks/src'),
                c.paths.buildHooks.dir
            );
        } else {
            c.runtime.skipBuildHooks = true;
            return;
        }
    }

    if (!c.runtime.isFirstRunAfterNew && !c.files.project.config?.isNew) {
        if (shouldBuildHook && !c.isBuildHooksReady) {
            try {
                logHook('buildHooks', 'Build hooks not complied. BUILDING...');
                await build({
                    entryPoints: [`${c.paths.buildHooks.dir}/index.js`],
                    bundle: true,
                    platform: 'node',
                    external: [...Object.keys(c.files.project.package.dependencies || {}), ...Object.keys(c.files.project.package.devDependencies || {})], // exclude everything that's present in node_modules
                    outfile: `${c.paths.buildHooks.dist.dir}/index.js`,
                });
            } catch (e) {
                // Fail Builds instead of warn when hook fails
                return Promise.reject(`BUILD_HOOK Failed with error: ${e}`);
            }
            c.isBuildHooksReady = true;
        }

        let h = require(c.paths.buildHooks.dist.index);

        c.buildHooks = h.hooks;
        c.buildPipes = h.pipes;
        h = require(c.paths.buildHooks.dist.index);
    }

    return true;
};
