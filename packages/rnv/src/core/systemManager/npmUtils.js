// import semver from 'semver';
import path from 'path';
import inquirer from 'inquirer';
import { executeAsync, commandExistsSync } from './exec';
import { fsExistsSync, invalidatePodsChecksum, removeDirs, writeFileSync, fsWriteFileSync, loadFile } from './fileutils';
import { logTask, logWarning, logError, logInfo, logDebug } from './logger';
import { ANDROID, ANDROID_TV, FIRE_TV, ANDROID_WEAR } from '../constants';
import { doResolve } from './resolve';

import { inquirerPrompt } from '../../cli/prompt';

export const checkAndCreateProjectPackage = c => new Promise((resolve) => {
    logTask('checkAndCreateProjectPackage');

    if (!fsExistsSync(c.paths.project.package)) {
        logInfo(
            `Your ${c.paths.project.package} is missing. CREATING...DONE`
        );

        const packageName = c.files.project.config.projectName
                || c.paths.project.dir.split('/').pop();
        const version = c.files.project.config.defaults?.package?.version || '0.1.0';
        const templateName = c.files.project.config.defaults?.template
                || 'renative-template-hello-world';
        const rnvVersion = c.files.rnv.package.version;

        const pkgJson = {};
        pkgJson.name = packageName;
        pkgJson.version = version;
        pkgJson.dependencies = {
            renative: rnvVersion
        };
        pkgJson.devDependencies = {
            rnv: rnvVersion
        };
        pkgJson.devDependencies[templateName] = rnvVersion;
        const pkgJsonStringClean = JSON.stringify(pkgJson, null, 2);
        fsWriteFileSync(c.paths.project.package, pkgJsonStringClean);
    }

    loadFile(c.files.project, c.paths.project, 'package');

    resolve();
});

export const areNodeModulesInstalled = () => !!doResolve('resolve', false);

export const listAndSelectNpmVersion = async (c, npmPackage, rnvTemplates) => {
    const templateVersionsStr = await executeAsync(
        c,
        `npm view ${npmPackage} versions`
    );
    const versionArr = templateVersionsStr
        .replace(/\r?\n|\r|\s|'|\[|\]/g, '')
        .split(',');

    const templateTagsStr = await executeAsync(
        c,
        `npm dist-tag ls ${npmPackage}`
    );
    const tagArr = [];
    templateTagsStr.split('\n').forEach((tString) => {
        const tArr = tString.split(': ');
        tagArr.push({
            name: tArr[0],
            version: tArr[1]
        });
    });

    const { rnvVersion } = c;
    const validVersions = versionArr.map(v => ({ name: v, value: v }));

    let recommendedVersion;
    validVersions.forEach((item) => {
        let matchStr = '';
        const matchArr = [];
        tagArr.forEach((tag) => {
            if (tag.version === item.value) {
                matchArr.push(tag.name);
            }
        });
        if (matchArr.length) {
            matchStr = ` (HEAD: ${matchArr.join(', ')})`;
            item.name = `${item.value}${matchStr}`;
        }
        if (rnvTemplates?.includes && rnvTemplates.includes(npmPackage)) {
            if (item.value === rnvVersion) {
                item.name = `${item.name} <= RECOMMENDED`;
                recommendedVersion = item;
            }
        }
    });
    if (!recommendedVersion) recommendedVersion = validVersions[0];


    validVersions.sort((a, b) => {
        if (a.name > b.name) return 1;

        return (b.name > a.name) ? -1 : 0;
    }).reverse();

    validVersions.unshift(validVersions.splice(validVersions.indexOf(recommendedVersion), 1)[0]);


    const { inputTemplateVersion } = await inquirer.prompt({
        name: 'inputTemplateVersion',
        type: 'list',
        message: `What ${npmPackage} version to use?`,
        default: recommendedVersion.name,
        choices: validVersions
    });

    return inputTemplateVersion;
};

export const checkIfProjectAndNodeModulesExists = async (c) => {
    logTask('checkIfProjectAndNodeModulesExists');

    if (c.paths.project.configExists && !fsExistsSync(c.paths.project.nodeModulesDir)) {
        c._requiresNpmInstall = false;
        logInfo(
            'node_modules folder is missing. INSTALLING...'
        );
        await installPackageDependencies(c);
    }
};

const _getInstallScript = (c) => {
    const tasks = c.buildConfig?.tasks;
    if (!tasks) return null;
    if (Array.isArray(tasks)) {
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].name === 'install') {
                return tasks[i].script;
            }
        }
    } else {
        return tasks.install?.script;
    }
};

export const installPackageDependencies = async (c, failOnError = false) => {
    c.runtime.forceBuildHookRebuild = true;
    const customScript = _getInstallScript(c);

    if (customScript) {
        logTask('installPackageDependencies');
        logInfo(`Found custom task for install: ${customScript}.`);
        await executeAsync(customScript);
        return true;
    }

    const isYarnInstalled = commandExistsSync('yarn') || doResolve('yarn', false);
    const yarnLockPath = path.join(c.paths.project.dir, 'yarn.lock');
    const npmLockPath = path.join(c.paths.project.dir, 'package-lock.json');
    let command = 'npm install';


    const yarnLockExists = fsExistsSync(yarnLockPath);
    const packageLockExists = fsExistsSync(npmLockPath);

    if (yarnLockExists || packageLockExists) {
        // a lock file exists, defaulting to whichever is present
        if (yarnLockExists && !isYarnInstalled) throw new Error('You have a yarn.lock file but you don\'t have yarn installed. Install it or delete yarn.lock');
        command = yarnLockExists ? 'yarn' : 'npm install';
    } else if (c.program.packageManager) {
        // no lock file check cli option
        if (['yarn', 'npm'].includes(c.program.packageManager)) {
            command = c.program.packageManager === 'yarn' ? 'yarn' : 'npm install';
            if (command === 'yarn' && !isYarnInstalled) throw new Error('You specified yarn as packageManager but it\'s not installed');
        } else {
            throw new Error(`Unsupported package manager ${c.program.packageManager}. Only yarn and npm are supported at the moment.`);
        }
    } else {
        // no cli option either, asking
        const { packageManager } = await inquirerPrompt({
            type: 'list',
            name: 'packageManager',
            message: 'What package manager would you like to use?',
            choices: ['yarn', 'npm'],
            default: 'npm'
        });
        if (packageManager === 'yarn') command = 'yarn';
    }

    logTask('installPackageDependencies', `packageManager:(${command})`);

    try {
        await executeAsync(command);
        await invalidatePodsChecksum(c);
    } catch (e) {
        if (failOnError) {
            logError(e);
            return false;
        }
        logWarning(
            `${e}\n Seems like your node_modules is corrupted by other libs. ReNative will try to fix it for you`
        );
        try {
            await cleanNodeModules(c);
            await installPackageDependencies(c, true);
        } catch (npmErr) {
            logError(npmErr);
            return false;
        }
    }
    try {
        const plats = c.files.project.config?.defaults?.supportedPlatforms;
        if (
            Array.isArray(plats) && (plats.includes(ANDROID)
            || plats.includes(ANDROID_TV)
            || plats.includes(FIRE_TV)
            || plats.includes(ANDROID_WEAR))
        ) {
            if (!c.files.project.configLocal) {
                c.files.project.configLocal = {};
            }
            if (!c.files.project.configLocal?._meta) {
                c.files.project.configLocal._meta = {};
            }
            c.files.project.configLocal._meta.requiresJetify = true;
            writeFileSync(c.paths.project.configLocal, c.files.project.configLocal);
        }
        return true;
    } catch (jetErr) {
        logError(jetErr);
        return false;
    }
};

export const jetifyIfRequired = async (c) => {
    logTask('jetifyIfRequired');
    if (c.files.project.configLocal?._meta?.requiresJetify) {
        if (doResolve('jetifier')) {
            await executeAsync('npx jetify');
            c.files.project.configLocal._meta.requiresJetify = false;
            writeFileSync(c.paths.project.configLocal, c.files.project.configLocal);
        }
    }
    return true;
};

export const cleanNodeModules = () => new Promise((resolve, reject) => {
    logTask('cleanNodeModules');
    const dirs = [
        'react-native-safe-area-view/.git',
        '@react-navigation/native/node_modules/react-native-safe-area-view/.git',
        'react-navigation/node_modules/react-native-safe-area-view/.git',
        'react-native-safe-area-view/.git',
        '@react-navigation/native/node_modules/react-native-safe-area-view/.git',
        'react-navigation/node_modules/react-native-safe-area-view/.git'
    ].reduce((acc, dir) => {
        const [_all, aPackage, aPath] = dir.match(/([^/]+)\/(.*)/);
        logDebug(`Cleaning: ${_all}`);
        const resolved = doResolve(aPackage, false);
        if (resolved) {
            acc.push(`${resolved}/${aPath}`);
        }
        return acc;
    }, []);
    removeDirs(dirs)
        .then(() => resolve())
        .catch(e => reject(e));
    // removeDirs([
    //     path.join(c.paths.project.nodeModulesDir, 'react-native-safe-area-view/.git'),
    //     path.join(c.paths.project.nodeModulesDir, '@react-navigation/native/node_modules/react-native-safe-area-view/.git'),
    //     path.join(c.paths.project.nodeModulesDir, 'react-navigation/node_modules/react-native-safe-area-view/.git'),
    //     path.join(c.paths.rnv.nodeModulesDir, 'react-native-safe-area-view/.git'),
    //     path.join(c.paths.rnv.nodeModulesDir, '@react-navigation/native/node_modules/react-native-safe-area-view/.git'),
    //     path.join(c.paths.rnv.nodeModulesDir, 'react-navigation/node_modules/react-native-safe-area-view/.git')
    // ]).then(() => resolve()).catch(e => reject(e));
});
