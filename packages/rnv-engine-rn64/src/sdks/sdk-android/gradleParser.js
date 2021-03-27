import path from 'path';
import { FileUtils, Logger, Resolver, Common } from 'rnv';

const {
    getAppFolder,
    getAppVersion,
    getAppVersionCode,
    getAppId,
    getBuildFilePath,
    getConfigProp,
    addSystemInjects
} = Common;
const { fsExistsSync, writeCleanFile, fsWriteFileSync } = FileUtils;
const { doResolve, doResolvePath } = Resolver;
const { chalk, logTask, logWarning, logDebug } = Logger;


export const parseBuildGradleSync = (c) => {
    const appFolder = getAppFolder(c);
    const { platform } = c;

    let dexOptions = '';

    if (c.pluginConfigAndroid.buildGradleBuildScriptDexOptions) {
        dexOptions = `dexOptions() {
            ${c.pluginConfigAndroid.buildGradleBuildScriptDexOptions}
        }`;
    }
    const injects = [
        {
            pattern: '{{COMPILE_SDK_VERSION}}',
            override: c.pluginConfigAndroid.compileSdkVersion
        },
        {
            pattern: '{{INJECT_BUILD_TOOLS_VERSION}}',
            override: c.pluginConfigAndroid.gradleBuildToolsVersion
        },
        {
            pattern: '{{SUPPORT_LIB_VERSION}}',
            override: c.pluginConfigAndroid.supportLibVersion
        },
        {
            pattern: '{{BUILD_TOOLS_VERSION}}',
            override: c.pluginConfigAndroid.buildToolsVersion
        },
        {
            pattern: '{{PLUGIN_INJECT_ALLPROJECTS_REPOSITORIES}}',
            override:
                c.pluginConfigAndroid.buildGradleAllProjectsRepositories
        },
        {
            pattern: '{{PLUGIN_INJECT_BUILDSCRIPT_REPOSITORIES}}',
            override:
                c.pluginConfigAndroid.buildGradleBuildScriptRepositories
        },
        {
            pattern: '{{INJECT_PLUGINS}}',
            override:
                c.pluginConfigAndroid.buildGradlePlugins
        },
        {
            pattern: '{{INJECT_AFTER_ALL}}',
            override:
                c.pluginConfigAndroid.buildGradleAfterAll
        },
        {
            pattern: '{{PLUGIN_INJECT_BUILDSCRIPT_DEPENDENCIES}}',
            override:
                c.pluginConfigAndroid.buildGradleBuildScriptDependencies
        },
        {
            pattern: '{{PLUGIN_INJECT_DEXOPTIONS}}',
            override: dexOptions
        },
        {
            pattern: '{{INJECT_REACT_NATIVE_ENGINE}}',
            override: c.pluginConfigAndroid.injectReactNativeEngine
        }
    ];
    addSystemInjects(c, injects);

    writeCleanFile(
        getBuildFilePath(c, platform, 'build.gradle'),
        path.join(appFolder, 'build.gradle'),
        injects, null, c
    );
};

const setReactNativeEngineDefault = (c) => {
    c.pluginConfigAndroid.injectReactNativeEngine = `
maven { url "${doResolve('react-native', true, { forceForwardPaths: true })}/android" }
maven { url("${doResolve('jsc-android', true, { forceForwardPaths: true })}/dist") }
`;

    c.pluginConfigAndroid.appBuildGradleImplementations
+= "    implementation 'org.webkit:android-jsc:+'\n";

    c.pluginConfigAndroid.injectHermes = '    enableHermes: false,';
};

const setReactNativeEngineHermes = (c) => {
    c.pluginConfigAndroid.injectReactNativeEngine = `
  maven { url "${doResolve('react-native', true, { forceForwardPaths: true })}/android" }
  maven { url("${doResolve('jsc-android', true, { forceForwardPaths: true })}/dist") }
  `;


    c.pluginConfigAndroid.appBuildGradleImplementations += `    debugImplementation files("${doResolve(
        'hermes-engine', true, { forceForwardPaths: true }
    )}/android/hermes-debug.aar")\n`;
    c.pluginConfigAndroid.appBuildGradleImplementations += `    releaseImplementation files("${doResolve(
        'hermes-engine', true, { forceForwardPaths: true }
    )}/android/hermes-release.aar")\n`;


    c.pluginConfigAndroid.injectHermes = `    enableHermes: true,
hermesCommand: "{{PATH_HERMES_ENGINE}}/%OS-BIN%/hermes",
    `;
};

const setReactNativeEngineV8 = (c, engine) => {
    c.pluginConfigAndroid.injectReactNativeEngine = `
maven { url("${doResolve('react-native-v8', true, { forceForwardPaths: true })}/dist") }
maven { url("${doResolve(engine, true, { forceForwardPaths: true })}/dist") }
`;

    c.pluginConfigAndroid.appBuildGradleImplementations
+= `    implementation 'org.chromium:${engine}:+'\n`;

    c.pluginConfigAndroid.injectHermes = '    enableHermes: false,';

    c.pluginConfigAndroid.packagingOptions += `
    exclude '**/libjsc.so'`;
};

export const parseAppBuildGradleSync = (c) => {
    logTask('parseAppBuildGradleSync');
    const appFolder = getAppFolder(c);
    const { platform } = c;

    // ANDROID PROPS
    c.pluginConfigAndroid.minSdkVersion = getConfigProp(
        c,
        platform,
        'minSdkVersion',
        21
    );
    c.pluginConfigAndroid.targetSdkVersion = getConfigProp(
        c,
        platform,
        'targetSdkVersion',
        28
    );
    c.pluginConfigAndroid.compileSdkVersion = getConfigProp(
        c,
        platform,
        'compileSdkVersion',
        28
    );
    c.pluginConfigAndroid.gradleBuildToolsVersion = getConfigProp(
        c,
        platform,
        'gradleBuildToolsVersion',
        '3.3.1'
    );
    c.pluginConfigAndroid.supportLibVersion = getConfigProp(
        c,
        platform,
        'supportLibVersion',
        '28.0.0'
    );
    c.pluginConfigAndroid.buildToolsVersion = getConfigProp(
        c,
        platform,
        'buildToolsVersion',
        '28.0.0'
    );

    // REACT NATIVE ENGINE
    const enableHermes = getConfigProp(c, platform, 'enableHermes');
    if (enableHermes === true) {
        logWarning('enableHermes is DEPRECATED. use "reactNativeEngine": "hermes" instead.');
    }

    const reactNativeEngine = getConfigProp(c, c.platform, 'reactNativeEngine', 'default');

    switch (reactNativeEngine) {
        case 'default': {
            setReactNativeEngineDefault(c);
            break;
        }
        case 'v8-android': {
            setReactNativeEngineV8(c, reactNativeEngine);
            break;
        }
        case 'v8-android-nointl': {
            setReactNativeEngineV8(c, reactNativeEngine);
            break;
        }
        case 'v8-android-jit': {
            setReactNativeEngineV8(c, reactNativeEngine);
            break;
        }
        case 'v8-android-jit-nointl': {
            setReactNativeEngineV8(c, reactNativeEngine);
            break;
        }
        case 'hermes': {
            setReactNativeEngineHermes(c, reactNativeEngine);
            break;
        }
        default: {
            logWarning(`Unsupported react native engine ${reactNativeEngine}. Will use default instead`);
            setReactNativeEngineDefault(c);
        }
    }


    // SIGNING CONFIGS
    const debugSigning = `
    debug {
        storeFile file('debug.keystore')
        storePassword "android"
        keyAlias "androiddebugkey"
        keyPassword "android"
    }`;

    c.pluginConfigAndroid.appBuildGradleSigningConfigs = `${debugSigning}
    release`;
    c.pluginConfigAndroid.localProperties = '';

    const obj = c.files.workspace?.appConfig?.configPrivate?.[platform];
    if (obj) {
        logWarning(`DEPRECATED structure in ${chalk().white(c.paths.workspace.appConfig.configPrivate)}.
Your ${chalk().red(platform)} object needs to be located under ${chalk().green('platforms')} object.`);
    }


    const storeFile = getConfigProp(c, c.platform, 'storeFile') || obj?.storeFile;
    const keyAlias = getConfigProp(c, c.platform, 'keyAlias') || obj?.keyAlias;
    const storePassword = getConfigProp(c, c.platform, 'storePassword') || obj?.storePassword;
    const keyPassword = getConfigProp(c, c.platform, 'keyPassword') || obj?.keyPassword;

    c.pluginConfigAndroid.store = {
        storeFile,
        keyAlias,
        storePassword,
        keyPassword
    };

    if (!!storeFile && !!keyAlias && !!storePassword && !!keyPassword) {
        const keystorePath = storeFile;
        let keystorePathFull = keystorePath;
        if (keystorePath) {
            if (keystorePath.startsWith('.')) {
                keystorePathFull = path.join(
                    c.paths.workspace.appConfig.dir,
                    keystorePath
                );
            } else if (!fsExistsSync(keystorePath)) {
                keystorePathFull = path.join(
                    c.paths.workspace.appConfig.dir,
                    keystorePath
                );
            }
        }
        if (fsExistsSync(keystorePathFull)) {
            const genPropsPath = path.join(appFolder, 'keystore.properties');
            fsWriteFileSync(
                genPropsPath,
                `# auto generated by ReNative
storeFile=${keystorePathFull}
keyAlias=${keyAlias}
storePassword=${storePassword}
keyPassword=${keyPassword}`
            );

            c.pluginConfigAndroid.appBuildGradleSigningConfigs = `${debugSigning}
          release {
              storeFile file(keystoreProps['storeFile'])
              storePassword keystoreProps['storePassword']
              keyAlias keystoreProps['keyAlias']
              keyPassword keystoreProps['keyPassword']
          }`;

            c.pluginConfigAndroid.localProperties = `
        def keystorePropsFile = rootProject.file("keystore.properties")
        def keystoreProps = new Properties()
        keystoreProps.load(new FileInputStream(keystorePropsFile))`;
        } else {
            logWarning(
                `Your ${chalk().white(
                    keystorePathFull
                )} does not exist. You won't be able to make production releases without it!`
            );
        }
    } else if (storeFile) {
        const missingKeys = [];
        if (!keyAlias) missingKeys.push('keyAlias');
        if (!storePassword) missingKeys.push('storePassword');
        if (!keyPassword) missingKeys.push('keyPassword');
        logWarning(`You defined store file ${chalk().white(storeFile)}, but you are missing following keys: ${chalk().red(missingKeys.join(', '))}
Check your private files at:
${chalk().white(c.paths.workspace?.appConfig?.configsPrivate?.join('\n'))}`);
    }


    // BUILD_TYPES
    const pluginConfig = c.buildConfig ?? {};
    const debugBuildTypes = pluginConfig?.platforms[platform]?.gradle?.buildTypes?.debug ?? [];
    const releaseBuildTypes = pluginConfig?.platforms[platform]?.gradle?.buildTypes?.release ?? [];
    c.pluginConfigAndroid.buildTypes = `
    debug {
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        ${debugBuildTypes.join('\n        ')}
    }
    release {
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        signingConfig signingConfigs.release
        ${releaseBuildTypes.join('\n        ')}
    }`;

    // MULTI APK
    const versionCodeOffset = getConfigProp(
        c,
        platform,
        'versionCodeOffset',
        0
    );
    const isMultiApk = getConfigProp(c, platform, 'multipleAPKs', false) === true;
    c.pluginConfigAndroid.multiAPKs = '';
    if (isMultiApk) {
        const multiSet = 'Integer.parseInt(Integer.toString(variant.versionCode) + Integer.toString(bavc))';
        c.pluginConfigAndroid.multiAPKs = `
      ext.abiCodes = ["armeabi-v7a": 1, "x86": 2, "arm64-v8a": 3, "x86_64": 4]
      import com.android.build.OutputFile

      android.applicationVariants.all { variant ->
        variant.outputs.each { output ->
          def bavc = project.ext.abiCodes.get(output.getFilter(OutputFile.ABI))
          if (bavc != null) {
            output.versionCodeOverride = ${multiSet} + ${
    versionCodeOffset
}
          }
        }
      }`;
    }

    // SPLITS
    c.pluginConfigAndroid.splits = '';
    if (isMultiApk) {
        c.pluginConfigAndroid.splits = `
    splits {
      abi {
          reset()
          enable true
          include "armeabi-v7a", "x86", "arm64-v8a", "x86_64"
          universalApk false
      }
    }
`;
    }

    // PACKAGING OPTIONS
    c.pluginConfigAndroid.packagingOptions += `
    exclude 'META-INF/DEPENDENCIES.txt'
    exclude 'META-INF/DEPENDENCIES'
    exclude 'META-INF/dependencies.txt'
    exclude 'META-INF/LICENSE.txt'
    exclude 'META-INF/LICENSE'
    exclude 'META-INF/license.txt'
    exclude 'META-INF/LGPL2.1'
    exclude 'META-INF/NOTICE.txt'
    exclude 'META-INF/NOTICE'
    exclude 'META-INF/notice.txt'
    pickFirst 'lib/armeabi-v7a/libc++_shared.so'
    pickFirst 'lib/x86_64/libc++_shared.so'
    pickFirst 'lib/x86/libc++_shared.so'
    pickFirst 'lib/arm64-v8a/libc++_shared.so'
    pickFirst 'lib/arm64-v8a/libjsc.so'
    pickFirst 'lib/x86_64/libjsc.so'`;

    // COMPILE OPTIONS
    c.pluginConfigAndroid.compileOptions = `
    sourceCompatibility 1.8
    targetCompatibility 1.8`;

    // TODO This is temporary ANDROIDX support. whole gradle parser will be refactored in the near future
    let enableAndroidX = getConfigProp(
        c,
        platform,
        'enableAndroidX',
        'androidx.appcompat:appcompat:1.1.0'
    );
    if (enableAndroidX === true) {
        enableAndroidX = 'androidx.appcompat:appcompat:1.1.0';
    }

    if (enableAndroidX !== false) {
        c.pluginConfigAndroid.appBuildGradleImplementations += `    implementation "${enableAndroidX}"\n`;
    } else {
        c.pluginConfigAndroid.appBuildGradleImplementations
            += "    implementation 'com.android.support:appcompat-v7:27.0.2'\n";
    }

    c.pluginConfigAndroid.appBuildGradleImplementations
        += '    implementation "androidx.swiperefreshlayout:swiperefreshlayout:1.1.0-alpha02"\n';

    const injects = [
        {
            pattern: '{{PLUGIN_APPLY}}',
            override: c.pluginConfigAndroid.applyPlugin
        },
        { pattern: '{{APPLICATION_ID}}', override: getAppId(c, platform) },
        {
            pattern: '{{VERSION_CODE}}',
            override: getAppVersionCode(c, platform)
        },
        {
            pattern: '{{VERSION_NAME}}',
            override: getAppVersion(c, platform)
        },
        {
            pattern: '{{PLUGIN_IMPLEMENTATIONS}}',
            override: c.pluginConfigAndroid.appBuildGradleImplementations
        },
        {
            pattern: '{{PLUGIN_AFTER_EVALUATE}}',
            override: c.pluginConfigAndroid.appBuildGradleAfterEvaluate
        },
        {
            pattern: '{{PLUGIN_SIGNING_CONFIGS}}',
            override: c.pluginConfigAndroid.appBuildGradleSigningConfigs
        },
        {
            pattern: '{{PLUGIN_SPLITS}}',
            override: c.pluginConfigAndroid.splits
        },
        {
            pattern: '{{PLUGIN_ANDROID_DEFAULT_CONFIG}}',
            override: c.pluginConfigAndroid.defaultConfig
        },
        {
            pattern: '{{PLUGIN_PACKAGING_OPTIONS}}',
            override: c.pluginConfigAndroid.packagingOptions
        },
        {
            pattern: '{{PLUGIN_BUILD_TYPES}}',
            override: c.pluginConfigAndroid.buildTypes
        },
        {
            pattern: '{{PLUGIN_MULTI_APKS}}',
            override: c.pluginConfigAndroid.multiAPKs
        },
        {
            pattern: '{{MIN_SDK_VERSION}}',
            override: c.pluginConfigAndroid.minSdkVersion
        },
        {
            pattern: '{{TARGET_SDK_VERSION}}',
            override: c.pluginConfigAndroid.targetSdkVersion
        },
        {
            pattern: '{{COMPILE_SDK_VERSION}}',
            override: c.pluginConfigAndroid.compileSdkVersion
        },
        {
            pattern: '{{PLUGIN_COMPILE_OPTIONS}}',
            override: c.pluginConfigAndroid.compileOptions
        },
        {
            pattern: '{{PLUGIN_LOCAL_PROPERTIES}}',
            override: c.pluginConfigAndroid.localProperties
        },
        {
            pattern: '{{INJECT_HERMES}}',
            override: c.pluginConfigAndroid.injectHermes
        },
        {
            pattern: '{{PATH_REACT_NATIVE}}',
            override: doResolve('react-native', true, { forceForwardPaths: true })
        },
        {
            pattern: '{{PATH_HERMES_ENGINE}}',
            override: doResolve('hermes-engine', true, { forceForwardPaths: true })
        }
    ];

    addSystemInjects(c, injects);

    writeCleanFile(
        getBuildFilePath(c, platform, 'app/build.gradle'),
        path.join(appFolder, 'app/build.gradle'),
        injects, null, c
    );
};

export const parseSettingsGradleSync = (c) => {
    const appFolder = getAppFolder(c);
    const { platform } = c;
    const injects = [
        {
            pattern: '{{PLUGIN_INCLUDES}}',
            override: c.pluginConfigAndroid.pluginIncludes
        },
        {
            pattern: '{{PLUGIN_PATHS}}',
            override: c.pluginConfigAndroid.pluginPaths
        }
    ];

    addSystemInjects(c, injects);

    writeCleanFile(
        getBuildFilePath(c, platform, 'settings.gradle'),
        path.join(appFolder, 'settings.gradle'),
        injects, null, c
    );
};

export const parseGradlePropertiesSync = (c) => {
    const appFolder = getAppFolder(c);
    const { platform } = c;
    // GRADLE.PROPERTIES
    let pluginGradleProperties = '';
    const pluginConfigAndroid = c.buildConfig?.platforms?.[platform] || {};

    const gradleProps = pluginConfigAndroid['gradle.properties'];

    if (gradleProps) {
        const enableAndroidX = getConfigProp(
            c,
            platform,
            'enableAndroidX',
            true
        );
        if (enableAndroidX === true) {
            gradleProps['android.useAndroidX'] = true;
            gradleProps['android.enableJetifier'] = true;
        }

        Object.keys(gradleProps).forEach((key) => {
            pluginGradleProperties += `${key}=${gradleProps[key]}\n`;
        });
    }

    const gradleProperties = 'gradle.properties';


    const injects = [
        {
            pattern: '{{PLUGIN_GRADLE_PROPERTIES}}',
            override: pluginGradleProperties
        }
    ];

    addSystemInjects(c, injects);

    writeCleanFile(
        getBuildFilePath(c, platform, gradleProperties),
        path.join(appFolder, gradleProperties),
        injects, null, c
    );
};

export const injectPluginGradleSync = (c, plugin, key, pkg, pluginRoot) => {
    // const keyFixed = key.replace(/\//g, '-').replace(/@/g, '');
    // const packagePath = plugin.path ?? `${key}/android`;
    // let pathAbsolute;
    // try {
    //     pathAbsolute = plugin.path
    //         ? doResolvePath(packagePath, true, { keepSuffix: true })
    //         : doResolvePath(packagePath, true, { keepSuffix: true });
    // } catch (err) {
    //     logWarning(
    //         `GradleParser: plugin ${packagePath} not resolvable and has been skipped`
    //     );
    //     return;
    // }
    // const modulePath = `../../${pathFixed}`;

    // let packageParams = '';
    // if (plugin.packageParams) {
    //     packageParams = plugin.packageParams.join(',');
    // }
    const keyFixed = key.replace(/\//g, '-').replace(/@/g, '');
    const pathFixed = plugin.path ? `${plugin.path}` : `${key}/android`;
    const skipPathResolutions = pluginRoot['no-npm'];
    let pathAbsolute;

    if (!skipPathResolutions) {
        pathAbsolute = doResolvePath(pathFixed, true, { forceForwardPaths: true });
    }

    // APP/BUILD.GRADLE
    if (plugin.projectName) {
        if (!plugin.skipLinking && !skipPathResolutions) {
            c.pluginConfigAndroid.pluginIncludes += `, ':${plugin.projectName}'`;
            // }').projectDir = new File(rootProject.projectDir, '${modulePath}')\n`;
            c.pluginConfigAndroid.pluginPaths += `project(':${
                plugin.projectName
            }').projectDir = new File('${pathAbsolute}')\n`;
        }
        if (!plugin.skipImplementation) {
            if (plugin.implementation) {
                c.pluginConfigAndroid.appBuildGradleImplementations += `${plugin.implementation}\n`;
            } else {
                c.pluginConfigAndroid.appBuildGradleImplementations += `    implementation project(':${
                    plugin.projectName
                }')\n`;
            }
        }
    } else {
        if (!plugin.skipLinking && !skipPathResolutions) {
            c.pluginConfigAndroid.pluginIncludes += `, ':${keyFixed}'`;
            c.pluginConfigAndroid.pluginPaths += `project(':${keyFixed}').projectDir = new File('${pathAbsolute}')\n`;
        }
        if (!plugin.skipImplementation) {
            if (plugin.implementation) {
                c.pluginConfigAndroid.appBuildGradleImplementations += `${plugin.implementation}\n`;
            } else {
                c.pluginConfigAndroid.appBuildGradleImplementations += `    implementation project(':${keyFixed}')\n`;
            }
        }
    }

    parseAndroidConfigObject(c, plugin);

    if (!skipPathResolutions) {
        _fixAndroidLegacy(c, pathAbsolute);
    }
};

const getObj = (c, obj, keys) => {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const val = obj ? obj[key] : getConfigProp(c, c.platform, key);
        if (val) return val;
    }
};

export const parseAndroidConfigObject = (c, obj) => {
    const implementations = getObj(c, obj, ['implementations']);
    if (implementations) {
        implementations.forEach((v) => {
            c.pluginConfigAndroid.appBuildGradleImplementations += `    implementation ${v}\n`;
        });
    }

    // APP/BUILD.GRADLE
    const appBuildGradle = getObj(c, obj, ['app/build.gradle']);
    if (appBuildGradle) {
        if (appBuildGradle.apply) {
            appBuildGradle.apply.forEach((v) => {
                c.pluginConfigAndroid.applyPlugin += `apply ${v}\n`;
            });
        }

        if (appBuildGradle.defaultConfig) {
            appBuildGradle.defaultConfig.forEach((v) => {
                c.pluginConfigAndroid.defaultConfig += `${v}\n`;
            });
        }
    }

    const afterEvaluate = getObj(c, obj, ['afterEvaluate']);
    if (afterEvaluate) {
        afterEvaluate.forEach((v) => {
            c.pluginConfigAndroid.appBuildGradleAfterEvaluate += ` ${v}\n`;
        });
    }

    // BUILD.GRADLE
    const buildGradle = getObj(c, obj, ['BuildGradle', 'build.gradle']);

    const allProjRepos = buildGradle?.allprojects?.repositories;
    if (allProjRepos) {
        Object.keys(allProjRepos).forEach((k) => {
            if (allProjRepos[k] === true) {
                c.pluginConfigAndroid.buildGradleAllProjectsRepositories += `${k}\n`;
            }
        });
    }

    const plugins = buildGradle?.plugins;
    if (plugins?.forEach) {
        plugins.forEach((k) => {
            c.pluginConfigAndroid.buildGradlePlugins += `${k}\n`;
        });
    }
    const buildscriptRepos = buildGradle?.buildscript?.repositories;
    if (buildscriptRepos) {
        Object.keys(buildscriptRepos).forEach((k) => {
            if (buildscriptRepos[k] === true) {
                c.pluginConfigAndroid.buildGradleBuildScriptRepositories += `${k}\n`;
            }
        });
    }

    const buildscriptDeps = buildGradle?.buildscript?.dependencies;
    if (buildscriptDeps) {
        Object.keys(buildscriptDeps).forEach((k) => {
            if (buildscriptDeps[k] === true) {
                c.pluginConfigAndroid.buildGradleBuildScriptDependencies += `${k}\n`;
            }
        });
    }

    const buildscriptDexOptions = buildGradle?.dexOptions;
    if (buildscriptDexOptions) {
        Object.keys(buildscriptDexOptions).forEach((k) => {
            if (buildscriptDexOptions[k] === true) {
                c.pluginConfigAndroid.buildGradleBuildScriptDexOptions += `${k}\n`;
            }
        });
    }

    const injectAfterAll = buildGradle?.injectAfterAll;
    if (injectAfterAll?.forEach) {
        injectAfterAll.forEach((k) => {
            c.pluginConfigAndroid.buildGradleAfterAll += `${k}\n`;
        });
    }
};

const _fixAndroidLegacy = (c, modulePath) => {
    const buildGradle = path.join(
        c.paths.project.dir,
        modulePath,
        'build.gradle'
    );

    if (fsExistsSync(buildGradle)) {
        logDebug('FIX:', buildGradle);
        writeCleanFile(buildGradle, buildGradle, [
            { pattern: " compile '", override: "  implementation '" },
            { pattern: ' compile "', override: '  implementation "' },
            { pattern: ' testCompile "', override: '  testImplementation "' },
            { pattern: " provided '", override: "  compileOnly '" },
            { pattern: ' provided "', override: '  compileOnly "' },
            {
                pattern: ' compile fileTree',
                override: '  implementation fileTree'
            }
        ], null, c);
    }
};

// const _getPrivateConfig = (c, platform) => {
//     let privateConfigFolder = path.join(c.paths.workspace.dir, c.files.project.package.name, c.buildConfig.id);
//     if (!fsExistsSync(privateConfigFolder)) {
//         privateConfigFolder = path.join(c.paths.workspace.dir, c.files.project.package.name, 'appConfigs', c.buildConfig.id);
//     }
//     const appConfigSPP = c.buildConfig.platforms[platform] ? c.buildConfig.platforms[platform].signingPropertiesPath : null;
//     const appConfigSPPClean = appConfigSPP ? appConfigSPP.replace('{globalConfigDir}', c.paths.workspace.dir) : null;
//     const privateConfigPath = appConfigSPPClean || path.join(privateConfigFolder, 'config.private.json');
//     c.paths.workspaceConfigPath = privateConfigPath;
//     c.paths.workspace.appConfig.dir = privateConfigPath.replace('/config.private.json', '');
//     if (fsExistsSync(privateConfigPath)) {
//         try {
//             const output = JSON.parse(fsReadFileSync(privateConfigPath));
//             output.parentFolder = c.paths.workspace.appConfig.dir;
//             output.path = privateConfigPath;
//             logInfo(
//                 `Found ${chalk().white(privateConfigPath)}. Will use it for production releases!`,
//             );
//             return output;
//         } catch (e) {
//             logError(e);
//             return null;
//         }
//     } else {
//         logWarning(
//             `You're missing ${chalk().white(privateConfigPath)} for this app: . You won't be able to make production releases without it!`,
//         );
//         return null;
//     }
// };
