import path from 'path';
import net from 'net';
import shell from 'shelljs';
import inquirer from 'inquirer';
import execa from 'execa';
import { FileUtils, Exec, Utils, Logger, Constants, EngineManager,
    PluginManager, ProjectManager, Common,
    PlatformManager, Prompt, SDKManager, RuntimeManager } from 'rnv';
import {
    parseAndroidManifestSync,
    injectPluginManifestSync
} from './manifestParser';
import {
    parseMainActivitySync,
    parseSplashActivitySync,
    parseMainApplicationSync,
    injectPluginKotlinSync
} from './kotlinParser';
import {
    parseAppBuildGradleSync,
    parseBuildGradleSync,
    parseSettingsGradleSync,
    parseGradlePropertiesSync,
    injectPluginGradleSync,
    parseAndroidConfigObject
} from './gradleParser';
import {
    parseGradleWrapperSync
} from './gradleWrapperParser';
import {
    parseValuesStringsSync,
    injectPluginXmlValuesSync,
    parseValuesColorsSync
} from './xmlValuesParser';

const {
    resetAdb,
    getAndroidTargets,
    composeDevicesString,
    launchAndroidSimulator,
    checkForActiveEmulator,
    askForNewEmulator,
    connectToWifiDevice
} = SDKManager.Android;
const {
    copyAssetsFolder,
    copyBuildsFolder,
    parseFonts
} = ProjectManager;
const { parsePlugins } = PluginManager;

const {
    fsExistsSync,
    copyFileSync,
    mkdirSync,
    getRealPath,
    updateObjectSync,
    fsWriteFileSync,
    fsChmodSync
} = FileUtils;
const { executeAsync, execCLI } = Exec;
const {
    getAppFolder,
    getConfigProp,
    getAppId
} = Common;
const { isPlatformActive, createPlatformBuild } = PlatformManager;
const { generateEnvVars } = EngineManager;
const { isSystemWin } = Utils;
const { inquirerPrompt } = Prompt;
const { updateRenativeConfigs } = RuntimeManager;
const {
    chalk,
    logTask,
    logWarning,
    logDebug,
    logInfo,
    logSuccess,
    logRaw
} = Logger;
const {
    ANDROID_WEAR,
    ANDROID,
    ANDROID_TV,
    FIRE_TV,
    CLI_ANDROID_ADB
} = Constants;

const _getEntryOutputName = (c) => {
    // CRAPPY BUT Android Wear does not support webview required for connecting to packager. this is hack to prevent RN connectiing to running bundler
    const { entryFile } = c.buildConfig.platforms[c.platform];
    // TODO Android PROD Crashes if not using this hardcoded one
    let outputFile;
    if (c.platform === ANDROID_WEAR) {
        outputFile = entryFile;
    } else {
        outputFile = 'index.android';
    }
    return outputFile;
};

export const packageAndroid = async (c) => {
    logTask('packageAndroid');
    const { platform } = c;

    const bundleAssets = getConfigProp(c, platform, 'bundleAssets', false) === true;

    if (!bundleAssets && platform !== ANDROID_WEAR) {
        logInfo(`bundleAssets in scheme ${chalk().white(c.runtime.scheme)} marked false. SKIPPING PACKAGING...`);
        return true;
    }

    const outputFile = _getEntryOutputName(c);

    const appFolder = getAppFolder(c);
    let reactNative = 'react-native';

    if (isSystemWin) {
        reactNative = path.normalize(
            `${process.cwd()}/node_modules/.bin/react-native.cmd`
        );
    }

    logInfo('ANDROID PACKAGE STARTING...');

    try {
        let cmd = `${reactNative} bundle --platform android --dev false --assets-dest ${
            appFolder
        }/app/src/main/res --entry-file ${
        c.buildConfig.platforms[c.platform]?.entryFile
        }.js --bundle-output ${appFolder}/app/src/main/assets/${
            outputFile
        }.bundle --config=metro.config.js`;

        if (getConfigProp(c, c.platform, 'enableSourceMaps', false)) {
            cmd += ` --sourcemap-output ${appFolder}/app/src/main/assets/${
                outputFile
            }.bundle.map`;
        }
        await executeAsync(c, cmd, { env: { ...generateEnvVars(c) } });

        logInfo('ANDROID PACKAGE FINISHED');
        return true;
    } catch (e) {
        logInfo('ANDROID PACKAGE FAILED');
        return Promise.reject(e);
    }
};

export const runAndroid = async (c, defaultTarget) => {
    const { target } = c.program;
    const { platform } = c;
    logTask('runAndroid', `target:${target} default:${defaultTarget}`);

    const outputAab = getConfigProp(c, platform, 'aab', false);
    // shortcircuit devices logic since aabs can't be installed on a device
    if (outputAab) return _runGradleApp(c, platform, {});

    await resetAdb(c);

    if (target && net.isIP(target)) {
        await connectToWifiDevice(c, target);
    }

    let devicesAndEmulators;
    try {
        devicesAndEmulators = await getAndroidTargets(
            c,
            false,
            false,
            c.program.device !== undefined
        );
    } catch (e) {
        return Promise.reject(e);
    }

    const activeDevices = devicesAndEmulators.filter(d => d.isActive);
    const inactiveDevices = devicesAndEmulators.filter(d => !d.isActive);

    const askWhereToRun = async () => {
        if (activeDevices.length === 0 && inactiveDevices.length > 0) {
            // No device active, but there are emulators created
            const devicesString = composeDevicesString(inactiveDevices, true);
            const choices = devicesString;
            const response = await inquirer.prompt([
                {
                    name: 'chosenEmulator',
                    type: 'list',
                    message: 'What emulator would you like to start?',
                    choices
                }
            ]);
            if (response.chosenEmulator) {
                await launchAndroidSimulator(c, response.chosenEmulator, true);
                const devices = await checkForActiveEmulator(c);
                await _runGradleApp(c, platform, devices);
            }
        } else if (activeDevices.length > 1) {
            const devicesString = composeDevicesString(activeDevices, true);
            const choices = devicesString;
            const response = await inquirer.prompt([
                {
                    name: 'chosenEmulator',
                    type: 'list',
                    message: 'Where would you like to run your app?',
                    choices
                }
            ]);
            if (response.chosenEmulator) {
                const dev = activeDevices.find(
                    d => d.name === response.chosenEmulator
                );
                await _runGradleApp(c, platform, dev);
            }
        } else {
            await askForNewEmulator(c, platform);
            const devices = await checkForActiveEmulator(c);
            await _runGradleApp(c, platform, devices);
        }
    };

    if (target) {
        // a target is provided
        logDebug('Target provided', target);
        const foundDevice = devicesAndEmulators.find(
            d => d.udid.includes(target) || d.name.includes(target)
        );
        if (foundDevice) {
            if (foundDevice.isActive) {
                await _runGradleApp(c, platform, foundDevice);
            } else {
                await launchAndroidSimulator(c, foundDevice, true);
                const device = await checkForActiveEmulator(c);
                await _runGradleApp(c, platform, device);
            }
        } else {
            await askWhereToRun();
        }
    } else if (activeDevices.length === 1) {
        // Only one that is active, running on that one
        const dv = activeDevices[0];
        logInfo(`Found device ${dv.name}:${dv.udid}!`);
        await _runGradleApp(c, platform, dv);
    } else if (defaultTarget) {
        // neither a target nor an active device is found, revert to default target if available
        logDebug('Default target used', defaultTarget);
        const foundDevice = devicesAndEmulators.find(
            d => d.udid.includes(defaultTarget) || d.name.includes(defaultTarget)
        );
        if (!foundDevice) {
            logDebug('Target not provided, asking where to run');
            await askWhereToRun();
        } else {
            await launchAndroidSimulator(c, foundDevice, true);
            const device = await checkForActiveEmulator(c);
            await _runGradleApp(c, platform, device);
        }
    } else {
        // we don't know what to do, ask the user
        logDebug('Target not provided, asking where to run');
        await askWhereToRun();
    }
};

const _checkSigningCerts = async (c) => {
    logTask('_checkSigningCerts');
    const signingConfig = getConfigProp(
        c,
        c.platform,
        'signingConfig',
        'Debug'
    );
    const isRelease = signingConfig === 'Release';

    if (isRelease && !c.pluginConfigAndroid?.store?.storeFile) {
        const msg = `You're attempting to ${
            c.command
        } app in release mode but you have't configured your ${chalk().white(
            c.paths.workspace.appConfig.configPrivate
        )} for ${chalk().white(c.platform)} platform yet.`;
        if (c.program.ci === true) {
            return Promise.reject(msg);
        }
        logWarning(msg);

        const { confirm } = await inquirer.prompt({
            type: 'confirm',
            name: 'confirm',
            message: 'Do you want to configure it now?'
        });

        if (confirm) {
            let confirmCopy = false;
            let platCandidate;
            const { confirmNewKeystore } = await inquirerPrompt({
                type: 'confirm',
                name: 'confirmNewKeystore',
                message: 'Do you want to generate new keystore as well?'
            });

            if (c.files.workspace.appConfig.configPrivate) {
                const platCandidates = [ANDROID_WEAR, ANDROID_TV, ANDROID, FIRE_TV];

                platCandidates.forEach((v) => {
                    if (c.files.workspace.appConfig.configPrivate[v]) {
                        platCandidate = v;
                    }
                });
                if (platCandidate) {
                    const resultCopy = await inquirerPrompt({
                        type: 'confirm',
                        name: 'confirmCopy',
                        message: `Found existing keystore configuration for ${platCandidate}. do you want to reuse it?`
                    });
                    confirmCopy = resultCopy?.confirmCopy;
                }
            }

            if (confirmCopy) {
                c.files.workspace.appConfig
                    .configPrivate[c.platform] = c.files.workspace
                        .appConfig.configPrivate[platCandidate];
            } else {
                let storeFile;

                if (!confirmNewKeystore) {
                    const result = await inquirerPrompt({
                        type: 'input',
                        name: 'storeFile',
                        default: './release.keystore',
                        message: `Paste relative path to ${chalk().white(
                            c.paths.workspace.appConfig.dir
                        )} of your existing ${chalk().white(
                            'release.keystore'
                        )} file`
                    });
                    storeFile = result?.storeFile;
                }

                const {
                    storePassword,
                    keyAlias,
                    keyPassword
                } = await inquirer.prompt([
                    {
                        type: 'password',
                        name: 'storePassword',
                        message: 'storePassword'
                    },
                    {
                        type: 'input',
                        name: 'keyAlias',
                        message: 'keyAlias'
                    },
                    {
                        type: 'password',
                        name: 'keyPassword',
                        message: 'keyPassword'
                    }
                ]);

                if (confirmNewKeystore) {
                    const keystorePath = `${c.paths.workspace.appConfig.dir}/release.keystore`;
                    mkdirSync(c.paths.workspace.appConfig.dir);
                    const keytoolCmd = `keytool -genkey -v -keystore ${
                        keystorePath
                    } -alias ${keyAlias} -keypass ${keyPassword} -storepass ${
                        storePassword
                    } -keyalg RSA -keysize 2048 -validity 10000`;
                    await executeAsync(c, keytoolCmd, {
                        env: process.env,
                        shell: true,
                        stdio: 'inherit',
                        silent: true
                    });
                    storeFile = './release.keystore';
                }

                if (c.paths.workspace.appConfig.dir) {
                    mkdirSync(c.paths.workspace.appConfig.dir);
                    c.files.workspace.appConfig.configPrivate = {
                        platforms: {}
                    };
                    c.files.workspace.appConfig.configPrivate.platforms[c.platform] = {
                        storeFile,
                        storePassword,
                        keyAlias,
                        keyPassword
                    };
                }
            }

            updateObjectSync(
                c.paths.workspace.appConfig.configPrivate,
                c.files.workspace.appConfig.configPrivate
            );
            logSuccess(
                `Successfully updated private config file at ${chalk().white(
                    c.paths.workspace.appConfig.dir
                )}.`
            );
            // await configureProject(c);
            await updateRenativeConfigs(c);
            await parseAppBuildGradleSync(c);
            // await configureGradleProject(c);
        } else {
            return Promise.reject("You selected no. Can't proceed");
        }
    }
};

const _runGradleApp = async (c, platform, device) => {
    logTask('_runGradleApp');

    const signingConfig = getConfigProp(c, platform, 'signingConfig', 'Debug');
    const appFolder = getAppFolder(c);
    const bundleId = getAppId(c, platform);
    const outputAab = getConfigProp(c, platform, 'aab', false);
    const outputFolder = signingConfig === 'Debug' ? 'debug' : 'release';
    const { arch, name } = device;
    const stacktrace = c.program.info ? ' --debug' : '';

    shell.cd(`${appFolder}`);

    // await _checkSigningCerts(c);
    await executeAsync(
        c,
        `${isSystemWin ? 'gradlew.bat' : './gradlew'} ${
            outputAab ? 'bundle' : 'assemble'
        }${signingConfig}${stacktrace} -x bundleReleaseJsAndAssets`,
        // { interactive: true }
    );
    if (outputAab) {
        const aabPath = path.join(
            appFolder,
            `app/build/outputs/bundle/${outputFolder}/app.aab`
        );
        logInfo(`App built. Path ${aabPath}`);
        return true;
    }
    let apkPath = path.join(
        appFolder,
        `app/build/outputs/apk/${outputFolder}/app-${outputFolder}.apk`
    );
    if (!fsExistsSync(apkPath)) {
        apkPath = path.join(
            appFolder,
            `app/build/outputs/apk/${outputFolder}/app-${outputFolder}-unsigned.apk`
        );
    }
    if (!fsExistsSync(apkPath)) {
        apkPath = path.join(
            appFolder,
            `app/build/outputs/apk/${outputFolder}/app-${arch}-${outputFolder}.apk`
        );
    }
    logInfo(`Installing ${apkPath} on ${name}`);
    try {
        await execCLI(
            c,
            CLI_ANDROID_ADB,
            `-s ${device.udid} install -r -d -f ${apkPath}`
        );
    } catch (e) {
        if (
            e?.includes('INSTALL_FAILED')
            || e?.message?.includes('INSTALL_FAILED')
        ) {
            const { confirm } = await inquirerPrompt({
                type: 'confirm',
                message:
                    "It seems you already have the app installed but RNV can't update it. Uninstall that one and try again?"
            });

            if (!confirm) throw new Error('User canceled');
            await execCLI(
                c,
                CLI_ANDROID_ADB,
                `-s ${device.udid} uninstall ${bundleId}`
            );
            await execCLI(
                c,
                CLI_ANDROID_ADB,
                `-s ${device.udid} install -r -d -f ${apkPath}`
            );
        } else {
            throw new Error(e);
        }
    }

    if (!outputAab) {
        await execCLI(
            c,
            CLI_ANDROID_ADB,
            `-s ${device.udid} shell am start -n ${bundleId}/.MainActivity`
        );
    }
};

export const buildAndroid = async (c) => {
    logTask('buildAndroid');
    const { platform } = c;

    const appFolder = getAppFolder(c);
    const signingConfig = getConfigProp(
        c,
        platform,
        'signingConfig',
        'Debug'
    );

    shell.cd(`${appFolder}`);

    // await _checkSigningCerts(c);
    await executeAsync(c, `${isSystemWin ? 'gradlew.bat' : './gradlew'} assemble${signingConfig} -x bundleReleaseJsAndAssets`);

    logSuccess(
        `Your APK is located in ${chalk().cyan(
            path.join(
                appFolder,
                `app/build/outputs/apk/${signingConfig.toLowerCase()}`
            )
        )} .`
    );
    return true;
};

export const configureAndroidProperties = async (c) => {
    logTask('configureAndroidProperties');

    const appFolder = getAppFolder(c);

    c.runtime.platformBuildsProjectPath = appFolder;


    const addNDK = c.buildConfig?.sdks?.ANDROID_NDK
            && !c.buildConfig.sdks.ANDROID_NDK.includes('<USER>');
    const ndkString = `ndk.dir=${getRealPath(
        c,
        c.buildConfig?.sdks?.ANDROID_NDK
    )}`;
    let sdkDir = getRealPath(c, c.buildConfig?.sdks?.ANDROID_SDK);

    if (isSystemWin) {
        sdkDir = sdkDir.replace(/\\/g, '/');
    }

    fsWriteFileSync(
        path.join(appFolder, 'local.properties'),
        `#Generated by ReNative (https://renative.org)
${addNDK ? ndkString : ''}
sdk.dir=${sdkDir}`
    );

    return true;
};

export const configureGradleProject = async (c) => {
    const { platform } = c;
    logTask('configureGradleProject');

    if (!isPlatformActive(c, platform)) return;
    await copyAssetsFolder(c, platform, 'app/src/main');
    await configureAndroidProperties(c);
    await configureProject(c);
    await copyBuildsFolder(c, platform);
    return true;
};

export const configureProject = async (c) => {
    logTask('configureProject');
    const { platform } = c;

    const appFolder = getAppFolder(c);

    const gradlew = path.join(appFolder, 'gradlew');

    if (!fsExistsSync(gradlew)) {
        logWarning(
            `Your ${chalk().white(
                platform
            )} platformBuild is misconfigured!. let's repair it.`
        );
        await createPlatformBuild(c, platform);
        await configureGradleProject(c, platform);

        return true;
    }

    const outputFile = _getEntryOutputName(c);

    mkdirSync(path.join(appFolder, 'app/src/main/assets'));
    fsWriteFileSync(
        path.join(appFolder, `app/src/main/assets/${outputFile}.bundle`),
        '{}'
    );
    fsChmodSync(gradlew, '755');

    // INJECTORS
    c.pluginConfigAndroid = {
        pluginIncludes: "include ':app'",
        pluginPaths: '',
        pluginImports: '',
        pluginPackages: 'MainReactPackage(),\n',
        pluginActivityImports: '',
        pluginActivityMethods: '',
        pluginApplicationImports: '',
        pluginApplicationMethods: '',
        pluginApplicationCreateMethods: '',
        pluginApplicationDebugServer: '',
        applyPlugin: '',
        defaultConfig: '',
        pluginActivityCreateMethods: '',
        pluginActivityResultMethods: '',
        pluginSplashActivityImports: '',
        manifestApplication: '',
        buildGradleAllProjectsRepositories: '',
        buildGradleBuildScriptRepositories: '',
        buildGradlePlugins: '',
        buildGradleAfterAll: '',
        buildGradleBuildScriptDependencies: '',
        injectReactNativeEngine: '',
        buildGradleBuildScriptDexOptions: '',
        appBuildGradleSigningConfigs: '',
        packagingOptions: '',
        appBuildGradleImplementations: '',
        resourceStrings: [],
        appBuildGradleAfterEvaluate: '',
        injectHermes: ''
    };

    // PLUGINS
    parsePlugins(c, platform, (plugin, pluginPlat, key) => {
        injectPluginGradleSync(c, pluginPlat, key, pluginPlat.package, plugin);
        injectPluginKotlinSync(c, pluginPlat, key, pluginPlat.package, plugin);
        injectPluginManifestSync(c, pluginPlat, key, pluginPlat.package, plugin);
        injectPluginXmlValuesSync(c, pluginPlat, key, pluginPlat.package, plugin);
    });

    c.pluginConfigAndroid.pluginPackages = c.pluginConfigAndroid.pluginPackages.substring(
        0,
        c.pluginConfigAndroid.pluginPackages.length - 2
    );

    // FONTS
    parseFonts(c, (font, dir) => {
        if (font.includes('.ttf') || font.includes('.otf')) {
            const key = font.split('.')[0];
            const { includedFonts } = c.buildConfig.common;
            if (includedFonts) {
                if (
                    includedFonts.includes('*')
                        || includedFonts.includes(key)
                ) {
                    if (font) {
                        const fontSource = path.join(dir, font);
                        if (fsExistsSync(fontSource)) {
                            const fontFolder = path.join(
                                appFolder,
                                'app/src/main/assets/fonts'
                            );
                            mkdirSync(fontFolder);
                            const fontDest = path.join(fontFolder, font);
                            copyFileSync(fontSource, fontDest);
                        } else {
                            logWarning(
                                `Font ${chalk().white(
                                    fontSource
                                )} doesn't exist! Skipping.`
                            );
                        }
                    }
                }
            }
        }
    });
    parseAndroidConfigObject(c);
    parseSettingsGradleSync(c);
    parseAppBuildGradleSync(c);
    parseBuildGradleSync(c);
    parseGradleWrapperSync(c);
    parseMainActivitySync(c);
    parseMainApplicationSync(c);
    parseSplashActivitySync(c);
    parseValuesStringsSync(c);
    parseValuesColorsSync(c);
    parseAndroidManifestSync(c);
    parseGradlePropertiesSync(c);
    await _checkSigningCerts(c);

    return true;
};

// Resolve or reject will not be called so this will keep running
export const runAndroidLog = async (c) => {
    logTask('runAndroidLog');
    const filter = c.program.filter || '';
    const child = execa.command(`${c.cli[CLI_ANDROID_ADB]} logcat`);
    // use event hooks to provide a callback to execute when data are available:
    child.stdout.on('data', (data) => {
        const d = data.toString().split('\n');
        d.forEach((v) => {
            if (v.includes(' E ') && v.includes(filter)) {
                logRaw(chalk().red(v));
            } else if (v.includes(' W ') && v.includes(filter)) {
                logRaw(chalk().yellow(v));
            } else if (v.includes(filter)) {
                logRaw(v);
            }
        });
    });
    return child
        .then(res => res.stdout)
        .catch(err => Promise.reject(`Error: ${err}`));
};
