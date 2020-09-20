/* eslint-disable no-restricted-syntax */
import path from 'path';
import open from 'better-opn';
import axios from 'axios';
import ip from 'ip';
import { fsExistsSync, readObjectSync, writeCleanFile, fsWriteFileSync, mkdirSync } from '../core/systemManager/fileutils';
import { executeAsync } from '../core/systemManager/exec';
import {
    // getAppFolder,
    // getAppSubFolder,
    getPlatformProjectDir,
    getPlatformBuildDir,
    // getTemplateProjectDir,
    // getTemplateDir,
    getAppVersion,
    // getAppTemplateFolder,
    checkPortInUse,
    getConfigProp,
    getBuildFilePath,
    getAppTitle,
    // getSourceExts,
    sanitizeColor,
    confirmActiveBundler,
    getTimestampPathsConfig,
    waitForUrl,
    addSystemInjects
} from '../core/common';
import { isPlatformActive } from '../core/platformManager';
import {
    chalk,
    logTask,
    logInfo,
    logDebug,
    logSuccess,
    logWarning,
    logRaw,
    logError,
    logSummary
} from '../core/systemManager/logger';
import {
    copyBuildsFolder,
    copyAssetsFolder
} from '../core/projectManager/projectParser';
import { getPlatformExtensions } from '../core/engineManager';
import { parsePlugins } from '../core/pluginManager';
import {
    selectWebToolAndDeploy,
    selectWebToolAndExport
} from '../core/deployManager/webTools';
import { getValidLocalhost } from '../core/utils';
import { doResolvePath } from '../core/resolve';
import { WEINRE_PORT, RNV_NODE_MODULES_DIR, RNV_PROJECT_DIR_NAME, RNV_SERVER_DIR_NAME } from '../core/constants';

const WEBPACK = path.join(RNV_NODE_MODULES_DIR, 'webpack/bin/webpack.js');
const WEBPACK_DEV_SERVER = path.join(RNV_NODE_MODULES_DIR, 'webpack-dev-server/bin/webpack-dev-server.js');

export const waitForWebpack = async (c, suffix = 'assets/bundle.js') => {
    logTask('waitForWebpack', `port:${c.runtime.port}`);
    let attempts = 0;
    const maxAttempts = 10;
    const CHECK_INTEVAL = 2000;
    // const spinner = ora('Waiting for webpack to finish...').start();

    const extendConfig = getConfigProp(c, c.platform, 'webpackConfig', {});
    const devServerHost = getValidLocalhost(extendConfig.devServerHost, c.runtime.localhost);
    const url = `http://${devServerHost}:${c.runtime.port}/${suffix}`;

    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            axios
                .get(url)
                .then((res) => {
                    if (res.status === 200) {
                        clearInterval(interval);
                        // spinner.succeed();
                        return resolve(true);
                    }
                    attempts++;
                    if (attempts === maxAttempts) {
                        clearInterval(interval);
                        // spinner.fail('Can\'t connect to webpack. Try restarting it.');
                        return reject(
                            "Can't connect to webpack. Try restarting it."
                        );
                    }
                })
                .catch(() => {
                    attempts++;
                    if (attempts > maxAttempts) {
                        clearInterval(interval);
                        // spinner.fail('Can\'t connect to webpack. Try restarting it.');
                        return reject(
                            "Can't connect to webpack. Try restarting it."
                        );
                    }
                });
        }, CHECK_INTEVAL);
    });
};

const _generateWebpackConfigs = (c, subFolderName) => {
    logTask('_generateWebpackConfigs');
    const { platform } = c;
    const appFolder = getPlatformBuildDir(c);
    const appFolderServer = path.join(appFolder, subFolderName);
    // const templateFolder = getAppTemplateFolder(c, platform);

    let modulePaths = [];
    const doNotResolveModulePaths = [];
    let moduleAliases = {};

    const modulePath = path.join(appFolder, 'modules.json');
    let externalModulePaths = [];
    let localModulePaths = [];
    if (fsExistsSync(modulePath)) {
        const modules = readObjectSync(modulePath);
        externalModulePaths = modules.externalPaths;
        localModulePaths = modules.localPaths;
        moduleAliases = modules.aliases;
    }

    // PLUGINS
    parsePlugins(c, platform, (plugin, pluginPlat, key) => {
        const webpackConfig = plugin.webpack || plugin.webpackConfig;

        if (webpackConfig) {
            if (webpackConfig.modulePaths) {
                if (webpackConfig.modulePaths === false) {
                    // ignore
                } else if (webpackConfig.modulePaths === true) {
                    modulePaths.push(`node_modules/${key}`);
                } else {
                    webpackConfig.modulePaths.forEach((v) => {
                        if (typeof v === 'string') {
                            modulePaths.push(v);
                        } else if (v?.projectPath) {
                            doNotResolveModulePaths.push(path.join(c.paths.project.dir, v.projectPath));
                        }
                    });
                }
            }
            if (webpackConfig.moduleAliases) {
                if (webpackConfig.moduleAliases === true) {
                    moduleAliases[key] = doResolvePath(key, true, {}, c.paths.project.nodeModulesDir);
                } else {
                    Object.keys(webpackConfig.moduleAliases).forEach((aKey) => {
                        const mAlias = webpackConfig.moduleAliases[aKey];
                        if (typeof mAlias === 'string') {
                            moduleAliases[key] = doResolvePath(mAlias, true, {}, c.paths.project.nodeModulesDir);
                        } else if (mAlias.path) {
                            moduleAliases[key] = path.join(c.paths.project.dir, mAlias.path);
                        } else if (mAlias.projectPath) {
                            moduleAliases[key] = path.join(c.paths.project.dir, mAlias.projectPath);
                        }
                    });
                }
            }
        }
    }, true);

    modulePaths = modulePaths
        .map(v => doResolvePath(v, true, {}, c.paths.project.dir))
        .concat(externalModulePaths.map(v => doResolvePath(v, true, {}, c.paths.project.nodeModulesDir)))
        .concat(localModulePaths.map(v => path.join(c.paths.project.dir, v)))
        .concat(doNotResolveModulePaths)
        .concat([c.paths.project.assets.dir])
        .filter(Boolean);

    // const env = getConfigProp(c, platform, 'environment');
    const extendConfig = getConfigProp(c, platform, 'webpackConfig', {});
    const entryFile = getConfigProp(c, platform, 'entryFile', 'index.web');
    const title = getAppTitle(c, platform);
    const analyzer = getConfigProp(c, platform, 'analyzer') || c.program.analyzer;

    if (!fsExistsSync(appFolderServer)) {
        mkdirSync(appFolderServer);
    }

    // copyFileSync(
    //     path.join(
    //         templateFolder,
    //         '_privateConfig',
    //         env === 'production' ? 'webpack.config.js' : 'webpack.config.dev.js'
    //     ),
    //     path.join(appFolderServer, 'webpack.config.js')
    // );

    // const externalModulesResolved = externalModules.map(v => doResolve(v))
    let assetVersion = '';
    const versionedAssets = getConfigProp(c, platform, 'versionedAssets', false);
    if (versionedAssets) {
        assetVersion = `-${getAppVersion(c, platform)}`;
    }
    const timestampAssets = getConfigProp(c, platform, 'timestampAssets', false);
    if (timestampAssets) {
        assetVersion = `-${c.runtime.timestamp}`;
    }

    const bundleAssets = getConfigProp(c, c.platform, 'bundleAssets', false);

    const obj = {
        modulePaths,
        moduleAliases,
        analyzer,
        entryFile,
        title,
        assetVersion,
        // devServer: c.runtime.devServer,
        buildFolder: bundleAssets ? RNV_PROJECT_DIR_NAME : RNV_SERVER_DIR_NAME,
        extensions: getPlatformExtensions(c, true),
        // extensions: getSourceExts(c, platform, false),
        ...extendConfig
    };

    const extendJs = `
    module.exports = ${JSON.stringify(obj, null, 2)}`;

    fsWriteFileSync(path.join(appFolder, 'webpack.extend.js'), extendJs);
};

const buildWeb = async (c) => {
    const { debug, debugIp } = c.program;
    const { platform } = c;
    logTask('buildWeb');

    let debugVariables = '';

    if (debug) {
        logInfo(
            `Starting a remote debugger build with ip ${debugIp
                    || ip.address()}. If this IP is not correct, you can always override it with --debugIp`
        );
        debugVariables += `DEBUG=true DEBUG_IP=${debugIp || ip.address()}`;
    }

    await executeAsync(c, `npx cross-env PLATFORM=${platform} NODE_ENV=production ${
        debugVariables
    } node ${WEBPACK} -p --config ./platformBuilds/${c.runtime.appId}_${platform}/webpack.config.prod.js`, {
        // env: {
        //     RNV_EXTENSIONS: getPlatformExtensions(c)
        // }
    });
    logSuccess(
        `Your Build is located in ${chalk().cyan(
            path.join(getPlatformProjectDir(c))
        )} .`
    );
    return true;
};

const configureWebProject = async (c) => {
    logTask('configureWebProject');

    const { platform } = c;

    c.runtime.platformBuildsProjectPath = getPlatformProjectDir(c);

    if (!isPlatformActive(c, platform)) return;

    await copyAssetsFolder(c, platform);

    const bundleAssets = getConfigProp(c, platform, 'bundleAssets') === true;

    await configureCoreWebProject(c, bundleAssets ? RNV_PROJECT_DIR_NAME : RNV_SERVER_DIR_NAME);

    return copyBuildsFolder(c, platform);
};

export const configureCoreWebProject = async (c, subFolderName = '') => {
    logTask('configureCoreWebProject');
    _generateWebpackConfigs(c, subFolderName);
    _parseCssSync(c, subFolderName);
};

const _parseCssSync = (c, subFolderName) => {
    const appFolder = getPlatformBuildDir(c);
    const timestampPathsConfig = getTimestampPathsConfig(c, c.platform);
    const backgroundColor = getConfigProp(c, c.platform, 'backgroundColor');

    const injects = [
        {
            pattern: '{{PLUGIN_COLORS_BG}}',
            override: sanitizeColor(
                backgroundColor,
                'backgroundColor'
            ).hex
        }
    ];

    addSystemInjects(c, injects);

    writeCleanFile(
        getBuildFilePath(c, c.platform, 'project/app.css'),
        path.join(appFolder, subFolderName, 'app.css'),
        injects,
        timestampPathsConfig, c
    );
};


export const runWebpackServer = async (c, enableRemoteDebugger) => {
    const { port } = c.runtime;
    const { platform } = c;
    logTask('runWeb', `port:${port} debugger:${!!enableRemoteDebugger}`);

    let devServerHost = c.runtime.localhost;

    const extendConfig = getConfigProp(c, c.platform, 'webpackConfig', {});
    devServerHost = getValidLocalhost(
        extendConfig.devServerHost,
        c.runtime.localhost
    );

    const isPortActive = await checkPortInUse(c, platform, port);
    const bundleAssets = getConfigProp(c, c.platform, 'bundleAssets', false);

    if (!isPortActive) {
        logInfo(
            `Looks like your ${chalk().white(
                platform
            )} devServerHost ${chalk().white(
                devServerHost
            )} at port ${chalk().white(
                port
            )} is not running. Starting it up for you...`
        );
        await _runWebBrowser(c, platform, devServerHost, port, false);
        if (!bundleAssets) {
            logSummary('BUNDLER STARTED');
        }
        await runWebDevServer(c, enableRemoteDebugger);
    } else {
        await confirmActiveBundler(c);
        await _runWebBrowser(c, platform, devServerHost, port, true);
        if (!bundleAssets) {
            logSummary('BUNDLER STARTED');
        }
    }
};

const _runWebBrowser = (c, platform, devServerHost, port, alreadyStarted) => new Promise((resolve) => {
    logTask(
        '_runWebBrowser', `ip:${devServerHost} port:${port} openBrowser:${!!c.runtime.shouldOpenBrowser}`
    );
    if (!c.runtime.shouldOpenBrowser) return resolve();
    const wait = waitForWebpack(c)
        .then(() => {
            open(`http://${devServerHost}:${port}/`);
        })
        .catch((e) => {
            logWarning(e);
        });
    if (alreadyStarted) return wait; // if it's already started, return the promise so it rnv will wait, otherwise it will exit before opening the browser
    return resolve();
});

const runWebDevServer = async (c, enableRemoteDebugger) => {
    logTask('runWebDevServer');
    const { debug, debugIp } = c.program;

    const appFolder = getPlatformBuildDir(c);
    const wpPublic = path.join(appFolder, 'server');
    const wpConfig = path.join(appFolder, 'webpack.config.dev.js');

    let debugVariables = '';
    let lineBreaks = '\n\n\n';
    if (debug || enableRemoteDebugger) {
        const resolvedDebugIp = debugIp
                || ip.address();
        logInfo(
            `Starting a remote debugger build with ip ${
                resolvedDebugIp}. If this IP is not correct, you can always override it with --debugIp`
        );
        debugVariables += `DEBUG=true DEBUG_IP=${resolvedDebugIp}`;
        lineBreaks = '\n';
        const debugUrl = chalk().cyan(`http://${resolvedDebugIp}:${WEINRE_PORT}/client/#${c.platform}`);


        const command = `weinre --boundHost -all- --httpPort ${WEINRE_PORT}`;
        try {
            executeAsync(c, command, { stdio: 'inherit', silent: true });
            await waitForUrl(`http://${resolvedDebugIp}:${WEINRE_PORT}`);
            logRaw(`

Debugger running at: ${debugUrl}`);
            open(`http://${resolvedDebugIp}:${WEINRE_PORT}/client/#${c.platform}`);
        } catch (e) {
            logError(e);
        }
    }

    const devServerHost = getValidLocalhost(getConfigProp(c, c.platform, 'webpackConfig', {}).devServerHost, c.runtime.localhost);

    const url = chalk().cyan(`http://${devServerHost}:${c.runtime.port}`);
    logRaw(`${lineBreaks}Dev server running at: ${url}

`);

    const command = `npx cross-env PLATFORM=${c.platform} ${
        debugVariables
    } ${WEBPACK_DEV_SERVER} -d --devtool source-map --config ${
        wpConfig
    }  --inline --hot --colors --content-base ${
        wpPublic
    } --history-api-fallback --port ${c.runtime.port} --mode=development`;
    try {
        await executeAsync(c, command, {
            stdio: 'inherit',
            silent: true,
            // env: {
            //     RNV_EXTENSIONS: getPlatformExtensions(c)
            // }
        });

        logDebug('runWebDevServer: running');
    } catch (e) {
        logDebug(e);
        return true;
    }
};

const deployWeb = (c) => {
    logTask('deployWeb');
    const { platform } = c;

    return selectWebToolAndDeploy(c, platform);
};

const exportWeb = (c) => {
    logTask('exportWeb');
    const { platform } = c;

    return selectWebToolAndExport(c, platform);
};

export { buildWeb, configureWebProject, deployWeb, exportWeb };