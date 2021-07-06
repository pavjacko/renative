

const SENSITIVE = '> WARNING. this prop is sensitive and should not be stored in standard `renative.json` configs. use `renative.private.json` files instead!\n\n';

// ==================================================
//  PROPS
// ==================================================

const propExt = {
    ext: {
        additionalProperties: true,
        type: 'object',
        description: 'Object ysed to extend your renative with custom props. This allows renative json schema to be validated',
        examples: [
            {
                myCustomRenativeProp: 'foo'
            }
        ]
    }
};

const propWebpackConfig = {
    webpackConfig: {
        additionalProperties: true,
        type: 'object',
        properties: {
            devServerHost: {
                type: 'string'
            },
            metaTags: {
                additionalProperties: true,
                type: 'object',
            },
            customScripts: {
                type: 'array'
            },
            extend: {
                additionalProperties: true,
                type: 'object',
                description: 'Allows you to directly extend/override webpack config of your current platform',
                examples: [
                    {
                        devtool: 'source-map'
                    },
                    {
                        module: {
                            rules: [
                                {
                                    test: /\.js$/,
                                    use: ['source-map-loader'],
                                    enforce: 'pre'
                                }
                            ]
                        }
                    }
                ]
            }
        }
    },
};


// ==================================================
// ENGINE PROPS
// ==================================================

const engineRnConfig = {

};


const engineRnWebConfig = {
    ...propWebpackConfig,
    devServerHost: {
        type: 'string'
    }
};

const engineRnElectronConfig = {
    ...propWebpackConfig,
    electronConfig: {
        additionalProperties: true,
        type: 'object',
        description: 'Allows you to configure electron app as per https://www.electron.build/',
        examples: [
            {
                mac: {
                    target: [
                        'dmg',
                        'mas',
                        'mas-dev'
                    ],
                    hardenedRuntime: true
                },
                dmg: {
                    sign: false
                },
                mas: {
                    type: 'distribution',
                    hardenedRuntime: false
                }
            }
        ]
    },
    BrowserWindow: {
        type: 'object',
        additionalProperties: false,
        description: 'Allows you to configure electron wrapper app window',
        examples: [
            {
                width: 1310,
                height: 800,
                webPreferences: {
                    devTools: true
                }
            }
        ],
        properties: {
            width: {
                type: 'integer',
                description: 'Default width of electron app',
            },
            height: {
                type: 'integer',
                description: 'Default height of electron app',
            },
            webPreferences: {
                additionalProperties: true,
                type: 'object',
                description: 'Extra web preferences of electron app',
                examples: [
                    {
                        devTools: true
                    }
                ]
            }
        }
    }
};

// ==================================================
// COMMON PROPS
// ==================================================

const commonRuntimeProps = {
    runtime: {
        additionalProperties: true,
        type: 'object',
        description: 'This object will be automatically injected into `./platfromAssets/renative.runtime.json` making it possible to inject the values directly to JS source code',
        examples: [
            {
                someRuntimeProperty: 'foo'
            }
        ]
    },
};

const commonProps = {
    ...commonRuntimeProps,
    excludedPlugins: {
        type: 'array',
        items: { type: 'string' },
        description: 'Defines an array of all excluded plugins for specific config or buildScheme. only full keys as defined in `plugin` should be used.\n\nNOTE: excludedPlugins is evaluated after includedPlugins',
        examples: [
            ['*'],
            ['react-native-google-cast', 'react-navigation-tabs']
        ]
    },
    includedPlugins: {
        type: 'array',
        items: { type: 'string' },
        description: 'Defines an array of all included plugins for specific config or buildScheme. only full keys as defined in `plugin` should be used.\n\nNOTE: includedPlugins is evaluated before excludedPlugins',
        examples: [
            ['*'],
            ['react-native-google-cast', 'react-navigation-tabs']
        ]
    },
    includedPermissions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Allows you to include specific permissions by their KEY defined in `permissions` object',
        examples: [
            ['*'],
            [
                'INTERNET',
                'CAMERA',
                'SYSTEM_ALERT_WINDOW',
                'RECORD_AUDIO',
                'RECORD_VIDEO',
                'READ_EXTERNAL_STORAGE',
                'WRITE_EXTERNAL_STORAGE',
                'ACCESS_FINE_LOCATION',
                'ACCESS_COARSE_LOCATION',
                'VIBRATE',
                'ACCESS_NETWORK_STATE',
                'ACCESS_WIFI_STATE',
                'RECEIVE_BOOT_COMPLETED',
                'WRITE_CONTACTS',
                'READ_CONTACTS'
            ]
        ]
    },
    permissions: {
        description: '> DEPRECATED in favor of includedPermissions',
        type: 'array',
        items: { type: 'string' }
    },
    id: {
        type: 'string'
    },
    title: {
        type: 'string',
        description: 'Title of your app will be used to create title of the binary. ie App title of installed app iOS/Android app or Tab title of the website',
        examples: [
            'Awesome App'
        ]
    },
    description: {
        type: 'string',
        description: 'General description of your app. This prop will be injected to actual projects where description field is applicable',
        examples: [
            'This app does awesome things'
        ]
    },
    author: {
        additionalProperties: true,
        type: ['object', 'string']
    },
    includedFonts: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of fonts you want to include in specific app or scheme. Should use exact font file (without the extension) located in `./appConfigs/base/fonts` or `*` to mark all',
        examples: [
            ['*'],
            [
                'TimeBurner',
                'Entypo'
            ]
        ]
    },
    backgroundColor: {
        type: 'string',
        description: 'Defines root view backgroundColor for all platforms in HEX format',
        examples: [
            '#FFFFFF',
            '#222222'
        ]
    },
    splashScreen: {
        type: 'boolean'
    },
    ignoreWarnings: {
        type: 'boolean'
    },
    ignoreLogs: {
        type: 'boolean'
    },
    license: {
        type: 'string'
    },
    timestampAssets: {
        type: 'boolean',
        description: 'If set to `true` generated js (bundle.js) files will be timestamped and named (bundle-12345678.js) every new build. This is useful if you want to enforce invalidate cache agains standard CDN cache policies every new build you deploy',
        examples: [
            true,
            false
        ]
    },
    versionedAssets: {
        type: 'boolean',
        description: 'If set to `true` generated js (bundle.js) files will be timestamped and named (bundle-1.0.0.js) every new version. This is useful if you want to enforce invalidate cache agains standard CDN cache policies every new version you deploy',
        examples: [
            true,
            false
        ]
    },
    ...propExt
};

const platformCommonProps = {
    ...commonProps,
    engine: {
        type: 'string'
    },
    entryFile: {
        type: 'string'
    },
    bundleAssets: {
        type: 'boolean',
        description: 'If set to `true` compiled js bundle file will generated. this is needed if you want to make production like builds'
    },
    enableSourceMaps: {
        type: 'boolean',
        description: 'If set to `true` dedicated source map file will be generated alongside of compiled js bundle'
    },
    bundleIsDev: {
        type: 'boolean'
    },
    deploy: {
        additionalProperties: true,
        type: 'object',
        properties: {
            type: {
                type: 'string',
            }
        }
    }
};

const commonIosProps = {
    Podfile: {
        additionalProperties: true,
        type: 'object'
    },
    xcodeproj: {
        additionalProperties: true,
        type: 'object'
    },
    plist: {
        additionalProperties: true,
        type: 'object'
    },
    appDelegateApplicationMethods: {
        type: 'object',
        properties: {
            didFinishLaunchingWithOptions: {
                type: 'array',
            },
            open: {
                type: 'array',
            },
            supportedInterfaceOrientationsFor: {
                type: 'array',
            },
            didReceiveRemoteNotification: {
                type: 'array',
            },
            didFailToRegisterForRemoteNotificationsWithError: {
                type: 'array',
            },
            didReceive: {
                type: 'array',
            },
            didRegister: {
                type: 'array',
            },
            didRegisterForRemoteNotificationsWithDeviceToken: {
                type: 'array',
            }
        }
    },
    appDelegateMethods: {
        additionalProperties: true,
        type: 'object'
    },
    appDelegateImports: {
        type: 'array'
    },
};

const commonAndroidProps = {
    'gradle.properties': {
        additionalProperties: true,
        type: 'object',
        description: 'Overrides values in `gradle.properties` file of generated android based project',
        examples: [
            {
                'gradle.properties': {
                    'android.debug.obsoleteApi': true,
                    'debug.keystore': 'debug.keystore',
                    'org.gradle.daemon': true,
                    'org.gradle.parallel': true,
                    'org.gradle.configureondemand': true
                }
            }
        ]
    },
    'build.gradle': {
        additionalProperties: true,
        type: 'object',
        description: 'Overrides values in `build.gradle` file of generated android based project',
        examples: [
            {
                allprojects: {
                    repositories: {
                        'maven { url "https://dl.bintray.com/onfido/maven" }': true
                    }
                }
            }
        ]
    },
    'app/build.gradle': {
        additionalProperties: true,
        type: 'object',
        description: 'Overrides values in `app/build.gradle` file of generated android based project',
        examples: [
            {
                apply: [
                    "plugin: 'io.fabric'"
                ]
            }
        ]
    },
    AndroidManifest: {
        additionalProperties: true,
        type: 'object',
        description: `Allows you to directly manipulate \`AndroidManifest.xml\` via json override mechanism

Injects / Overrides values in AndroidManifest.xml file of generated android based project

> IMPORTANT: always ensure that your object contains \`tag\` and \`android:name\` to target correct tag to merge into

`,
        examples: [
            {
                children: [
                    {
                        tag: 'application',
                        'android:name': '.MainApplication',
                        children: [
                            {
                                tag: 'activity',
                                'android:name': 'com.ahmedadeltito.photoeditor.PhotoEditorActivity'
                            }
                        ]
                    }
                ]
            },
            {
                children: [
                    {
                        tag: 'application',
                        'android:name': '.MainApplication',
                        'android:allowBackup': true,
                        'android:largeHeap': true,
                        'android:usesCleartextTraffic': true,
                        'tools:targetApi': 28
                    }
                ]
            }
        ]
    },
    applyPlugin: {
        type: 'array'
    },
    BuildGradle: {
        type: 'object',
        description: 'Allows you to customize `build.gradle` file',
        properties: {
            allprojects: {
                type: 'object',
                properties: {
                    repositories: {
                        type: 'object',
                        description: 'Customize repositories section of build.gradle',
                        additionalProperties: true,
                        examples: [
                            {
                                "flatDir { dirs 'libs'}": true
                            }
                        ]
                    }
                }
            }
        }
    },
    implementation: {
        type: 'object'
    }
};


// ==================================================
// PLATFORM PROPS
// ==================================================

const platformAndroidProps = {
    ...engineRnConfig,
    ...commonAndroidProps,
    enableAndroidX: {
        type: 'boolean',
        default: true,
        examples: [
            true,
            false
        ]
    },
    enableHermes: {
        type: 'boolean',
        default: false,
        description: '> DEPRECATED in favour of `reactNativeEngine`',
        examples: [
            true,
            false
        ]
    },
    reactNativeEngine: {
        type: 'string',
        default: 'default',
        description: 'Allows you to define specific native render engine to be used',
        examples: [
            true,
            false
        ]
    },
    signingConfig: {
        type: 'string',
        default: 'Debug',
        description: 'Equivalent to running `./gradlew/assembleDebug` or `./gradlew/assembleRelease`',
        examples: [
            'default',
            'v8-android',
            'v8-android-nointl',
            'v8-android-jit',
            'v8-android-jit-nointl',
            'hermes',
        ]
    },
    minSdkVersion: {
        type: 'integer',
        default: 21,
        examples: [
            21,
            22
        ]
    },
    multipleAPKs: {
        type: 'boolean',
        default: false,
        description: 'If set to `true`, apk will be split into multiple ones for each architecture: "armeabi-v7a", "x86", "arm64-v8a", "x86_64"',
        examples: [
            true,
            false
        ]
    },
    aab: {
        type: 'boolean',
        description: 'If set to true, android project will generate app.aab instead of apk',
        default: false,
        examples: [
            false,
            true
        ]
    },
    minifyEnabled: {
        type: 'boolean',
        description: 'Sets minifyEnabled buildType property in app/build.gradle',
        default: false,
        examples: [
            false,
            true
        ]
    },
    targetSdkVersion: {
        type: 'integer',
        description: 'Allows you define custom targetSdkVersion equivalent to: `targetSdkVersion = [VERSION]` ',
        examples: [
            28,
            29
        ]
    },
    compileSdkVersion: {
        type: 'integer',
        description: 'Allows you define custom compileSdkVersion equivalent to: `compileSdkVersion = [VERSION]` ',
        examples: [
            28,
            29
        ]
    },
    gradleBuildToolsVersion: {
        type: 'integer',
        description: 'Allows you define custom gradle build tools version equivalent to:  `classpath \'com.android.tools.build:gradle:[VERSION]\'`',
        default: '3.3.1',
        examples: [
            '3.3.1',
            '4.1.0'
        ]
    },
    gradleWrapperVersion: {
        type: 'integer',
        description: 'Allows you define custom gradle wrapper version equivalent to: `distributionUrl=https\\://services.gradle.org/distributions/gradle-[VERSION]-all.zip`',
        default: '5.5',
        examples: [
            '5.5',
            '6.7.1'
        ]
    },
    mainActivity: {
        type: 'object',
        description: 'Allows you to configure behaviour of MainActivity.kt',
        default: '{}',
        properties: {
            onCreate: {
                type: 'string',
                description: 'Overrides super.onCreate method handler of MainActivity.kt',
                default: 'super.onCreate(savedInstanceState)',
                examples: [
                    'super.onCreate(null)',
                    'super.onCreate(savedInstanceState)'
                ]
            }
        },
    },
    storeFile: {
        type: 'string'
    },
    storePassword: {
        type: 'string',
        description: `${SENSITIVE}storePassword for keystore file`
    },
    keyAlias: {
        type: 'string'
    },
    keyPassword: {
        type: 'string',
        description: `${SENSITIVE}keyPassword for keystore file`
    },
    excludedFeatures: {
        type: 'array'
    },
    includedFeatures: {
        type: 'array'
    }
};

const platformIosProps = {
    ...engineRnConfig,
    ...commonIosProps,
    deploymentTarget: {
        type: 'string'
    },
    teamID: {
        type: 'string'
    },
    excludedArchs: {
        type: 'array',
        description: 'Defines excluded architectures. This transforms to xcodeproj: `EXCLUDED_ARCHS="<VAL VAL ...>"`',
        default: null,
        examples: [
            ['arm64']
        ]
    },
    teamIdentifier: {
        type: 'string'
    },
    scheme: {
        type: 'string'
    },

    appleId: {
        type: 'string'
    },
    orientationSupport: {
        type: 'object',
        properties: {
            phone: {
                type: 'array',
            },
            tab: {
                type: 'array',
            }
        },
        examples: [
            {
                phone: [
                    'UIInterfaceOrientationPortrait',
                    'UIInterfaceOrientationPortraitUpsideDown',
                    'UIInterfaceOrientationLandscapeLeft',
                    'UIInterfaceOrientationLandscapeRight'
                ],
                tab: [
                    'UIInterfaceOrientationPortrait',
                    'UIInterfaceOrientationPortraitUpsideDown',
                    'UIInterfaceOrientationLandscapeLeft',
                    'UIInterfaceOrientationLandscapeRight'
                ]
            }
        ],
    },

    provisioningStyle: {
        type: 'string'
    },
    codeSignIdentity: {
        type: 'string',
        description: 'Special property which tells Xcode how to build your project',
        examples: [
            'iPhone Developer',
            'iPhone Distribution'
        ]
    },
    commandLineArguments: {
        type: 'array',
        description: 'Allows you to pass launch arguments to active scheme',
        examples: [
            [
                '-FIRAnalyticsDebugEnabled',
                'MyCustomLaunchArgument'
            ]
        ]
    },
    provisionProfileSpecifier: {
        type: 'string'
    },
    provisioningProfiles: {
        additionalProperties: true,
        type: 'object',
    },
    systemCapabilities: {
        additionalProperties: true,
        type: 'object',
        examples: [
            {
                'com.apple.SafariKeychain': false,
                'com.apple.Wallet': false,
                'com.apple.HealthKit': false,
                'com.apple.ApplicationGroups.iOS': false,
                'com.apple.iCloud': true,
                'com.apple.DataProtection': false,
                'com.apple.HomeKit': false,
                'com.apple.ClassKit': false,
                'com.apple.VPNLite': false,
                'com.apple.AutoFillCredentialProvider': false,
                'com.apple.AccessWiFi': false,
                'com.apple.InAppPurchase': false,
                'com.apple.HotspotConfiguration': false,
                'com.apple.Multipath': false,
                'com.apple.GameCenter.iOS': false,
                'com.apple.BackgroundModes': false,
                'com.apple.InterAppAudio': false,
                'com.apple.WAC': false,
                'com.apple.Push': true,
                'com.apple.NearFieldCommunicationTagReading': false,
                'com.apple.ApplePay': false,
                'com.apple.Keychain': false,
                'com.apple.Maps.iOS': false,
                'com.apple.Siri': false,
                'com.apple.NetworkExtensions.iOS': false
            }
        ]
    },
    entitlements: {
        additionalProperties: true,
        type: 'object'
    },
    runScheme: {
        type: 'string'
    },
    sdk: {
        type: 'string'
    },
    testFlightId: {
        type: 'string'
    },
    firebaseId: {
        type: 'string'
    },
    exportOptions: {
        type: 'object',
        additionalProperties: false,
        properties: {
            method: {
                type: 'string',
            },
            teamID: {
                type: 'string',
            },
            uploadBitcode: {
                type: 'boolean',
            },
            compileBitcode: {
                type: 'boolean',
            },
            uploadSymbols: {
                type: 'boolean',
            },
            signingStyle: {
                type: 'string',
            },
            signingCertificate: {
                type: 'string',
            },
            provisioningProfiles: {
                additionalProperties: true,
                type: 'object',
            }
        }
    }
};

const platformWebProps = {
    ...engineRnWebConfig,
    pagesDir: {
        type: 'string',
        description: 'Custom pages directory used by nextjs. Use relative paths',
        examples: [
            'src/customFolder/pages'
        ]
    },
    outputDir: {
        type: 'string',
        description: 'Custom output directory used by nextjs equivalent to "npx next build" with custom outputDir. Use relative paths',
        examples: [
            '.next',
            'custom/location'
        ]
    },
    exportDir: {
        type: 'string',
        description: 'Custom export directory used by nextjs equivalent to "npx next export --outdir <exportDir>". Use relative paths',
        examples: [
            'output',
            'custom/location'
        ]
    },
    environment: {
        type: 'string'
    }
};

const platformWebtvProps = {
    ...engineRnWebConfig,
    pagesDir: {
        type: 'string'
    },
    environment: {
        type: 'string'
    }
};

const platformTizenProps = {
    ...engineRnWebConfig,
    package: {
        type: 'string'
    },
    certificateProfile: {
        type: 'string'
    },
    appName: {
        type: 'string'
    }
};

const platformWebosProps = {
    ...engineRnWebConfig
};

const platformFirefoxProps = {
    ...engineRnWebConfig
};

const platformMacosProps = {
    ...engineRnElectronConfig,
    appleId: {
        type: 'string'
    },
    environment: {
        type: 'string'
    }
};

const platformWindowsProps = {
    ...engineRnElectronConfig
};

const platformChromecastProps = {
    ...engineRnWebConfig
};

// ==================================================
// BUILD SCHEME PROPS
// ==================================================


const generateBuildSchemeProps = obj => ({
    buildSchemes: {
        additionalProperties: {
            type: 'object',
            additionalProperties: false,
            properties: {
                enabled: {
                    type: 'boolean'
                },
                description: {
                    type: 'string',
                    description: 'Custom description of the buildScheme will be displayed directly in cli if you run rnv with an empty paramener `-s`',
                    examples: [
                        'This is some build scheme'
                    ]
                },
                ...platformCommonProps,
                ...obj,
            }
        },
        type: 'object'
    },
});


// ==================================================
// PLUGIN PROPS
// ==================================================

const pluginAndroidProps = {
    package: {
        type: 'string'
    },
    projectName: {
        type: 'string'
    },
    skipImplementation: {
        type: 'boolean'
    },
    afterEvaluate: {
        type: 'array'
    }
};

const pluginIosProps = {
    podName: {
        type: 'string'
    },
    podNames: {
        type: 'array'
    },
    isStatic: {
        type: 'boolean'
    },
    staticPods: {
        type: 'array',
        description: 'Allows to define extra logic to cover multiple pods subspecs which need to be marked as static',
        examples: [
            [
                '::startsWith::Permission-'
            ]
        ]
    }
};

const commonPluginPlatformProps = {
    webpackConfig: {
        additionalProperties: true,
        type: 'object'
    },
    enabled: {
        type: 'boolean'
    },
    path: {
        type: 'string',
        description: 'Enables you to pass custom path to plugin. If undefined, the default `node_modules/[plugin-name]` will be used.',
        examples: [
            'node_modules/react-native-video/android-exoplayer'
        ]
    }
};


const pluginProps = {
    enabled: {
        type: 'boolean'
    },
    props: {
        additionalProperties: true,
        type: 'object'
    },
    version: {
        type: 'string'
    },
    source: {
        type: 'string',
        description: 'Will define custom scope for your plugin config to extend from.\n\nNOTE: custom scopes can be defined via paths.pluginTemplates.[CUSTOM_SCOPE].{}',
        examples: [
            'rnv',
            'myCustomScope'
        ]
    },
    'no-npm': {
        type: 'boolean'
    },
    skipMerge: {
        type: 'boolean',
        description: 'Will not attempt to merge with existing plugin configuration (ie. coming form renative pluginTemplates)\n\nNOTE: if set to `true` you need to configure your plugin object fully',
        examples: [
            true,
            false
        ]
    },
    npm: {
        additionalProperties: true,
        type: 'object',
    },
    pluginDependencies: {
        type: ['array', 'null'],
    },
    // DEPRECATED
    webpack: {
        additionalProperties: true,
        type: 'object',
        description: '> DEPRECATED in favour of `webpackConfig`'
    },
    webpackConfig: {
        additionalProperties: false,
        type: 'object',
        description: 'Allows you to configure webpack bahaviour per each individual plugin',
        properties: {
            modulePaths: {
                type: ['boolean', 'object'],
                additionalProperties: true,
            },
            moduleAliases: {
                type: ['boolean', 'object'],
                additionalProperties: true,
            }
        }
    },
    android: {
        additionalProperties: false,
        type: 'object',
        properties: {
            ...commonPluginPlatformProps,
            ...commonAndroidProps,
            ...pluginAndroidProps
        }
    },
    androidtv: {
        additionalProperties: false,
        type: 'object',
        properties: {
            ...commonPluginPlatformProps,
            ...commonAndroidProps,
            ...pluginAndroidProps
        }
    },
    firetv: {
        additionalProperties: false,
        type: 'object',
        properties: {
            ...commonPluginPlatformProps,
            ...commonAndroidProps,
            ...pluginAndroidProps
        }
    },
    androidwear: {
        additionalProperties: false,
        type: 'object',
        properties: {
            ...commonPluginPlatformProps,
            ...commonAndroidProps,
            ...pluginAndroidProps
        }
    },
    ios: {
        additionalProperties: false,
        type: 'object',
        properties: {
            ...commonPluginPlatformProps,
            ...commonIosProps,
            ...pluginIosProps,
        }
    },
    tvos: {
        additionalProperties: false,
        type: 'object',
        properties: {
            ...commonPluginPlatformProps,
            ...commonIosProps,
            ...pluginIosProps,
        }
    },
    tizen: {
        additionalProperties: false,
        type: 'object',
        properties: {
            ...commonPluginPlatformProps,
        }
    },
    webos: {
        additionalProperties: false,
        type: 'object',
        properties: {
            ...commonPluginPlatformProps,
        }
    },
    web: {
        additionalProperties: false,
        type: 'object',
        properties: {
            ...commonPluginPlatformProps,
        }
    },
    webtv: {
        additionalProperties: false,
        type: 'object',
        properties: {
            ...commonPluginPlatformProps,
        }
    },
    chromecast: {
        additionalProperties: false,
        type: 'object',
        properties: {
            ...commonPluginPlatformProps,
        }
    },
    firefox: {
        additionalProperties: false,
        type: 'object',
        properties: {
            ...commonPluginPlatformProps,
        }
    },
    macos: {
        additionalProperties: false,
        type: 'object',
        properties: {
            ...commonPluginPlatformProps,
        }
    },
    windows: {
        additionalProperties: false,
        type: 'object',
        properties: {
            ...commonPluginPlatformProps,
        }
    }
};

// ==================================================
// SCHEMA
// ==================================================

export const schemaPlatforms = {
    $id: 'http://renative.org/schemas/platforms.json',
    // required: [
    //     'id'
    // ],
    definitions: {
        android: {
            additionalProperties: false,
            type: 'object',
            properties: {
                ...platformCommonProps,
                ...generateBuildSchemeProps(platformAndroidProps),
                ...platformAndroidProps
            }
        },
        ios: {
            additionalProperties: false,
            type: 'object',
            properties: {
                ...platformCommonProps,
                ...generateBuildSchemeProps(platformIosProps),
                ...platformIosProps
            }
        },
        tvos: {
            additionalProperties: false,
            type: 'object',
            properties: {
                ...platformCommonProps,
                ...generateBuildSchemeProps(platformIosProps),
                ...platformIosProps
            }
        },
        tizen: {
            additionalProperties: false,
            type: 'object',
            properties: {
                ...platformCommonProps,
                ...generateBuildSchemeProps(platformTizenProps),
                ...platformTizenProps
            }
        },
        webos: {
            additionalProperties: false,
            type: 'object',
            properties: {
                ...platformCommonProps,
                ...generateBuildSchemeProps(platformWebosProps),
                ...platformWebosProps
            }
        },
        web: {
            additionalProperties: false,
            type: 'object',
            properties: {
                ...platformCommonProps,
                ...generateBuildSchemeProps(platformWebProps),
                ...platformWebProps
            }
        },
        webtv: {
            additionalProperties: false,
            type: 'object',
            properties: {
                ...platformCommonProps,
                ...generateBuildSchemeProps(platformWebtvProps),
                ...platformWebtvProps
            }
        },
        chromecast: {
            additionalProperties: false,
            type: 'object',
            properties: {
                ...platformCommonProps,
                ...generateBuildSchemeProps(platformChromecastProps),
                ...platformChromecastProps
            }
        },
        firefox: {
            additionalProperties: false,
            type: 'object',
            properties: {
                ...platformCommonProps,
                ...generateBuildSchemeProps(platformFirefoxProps),
                ...platformFirefoxProps,
            }
        },
        macos: {
            additionalProperties: false,
            type: 'object',
            properties: {
                ...platformCommonProps,
                ...generateBuildSchemeProps(platformMacosProps),
                ...platformMacosProps
            }
        },
        windows: {
            additionalProperties: false,
            type: 'object',
            properties: {
                ...platformCommonProps,
                ...generateBuildSchemeProps(platformWindowsProps),
                ...platformWindowsProps
            }
        }
    }

};

export const schemaRoot = {
    $id: 'http://renative.org/schemas/renative.json',
    type: 'object',
    additionalProperties: false,
    properties: {
        common: {
            additionalProperties: false,
            type: 'object',
            description: 'Common config props used as default props for all available buildSchemes',
            examples: [
                {
                    author: {
                        name: 'Pavel Jacko',
                        email: 'Pavel Jacko <pavel.jacko@gmail.com>',
                        url: 'https://github.com/pavjacko'
                    },
                    license: 'MIT',
                    includedPlugins: ['*'],
                    includedFonts: ['*'],
                    backgroundColor: '#111111',
                    runtime: {
                        welcomeMessage: 'Hello ReNative!'
                    }
                }
            ],
            properties: {
                ...commonProps,
                ...generateBuildSchemeProps({}),
            }
        },
        ...commonRuntimeProps,
        engines: {
            additionalProperties: true,
            type: 'object',
            description: 'List of engines available in this project',
            examples: [
                {
                    '@rnv/engine-rn': 'source:rnv',
                    '@rnv/engine-rn-tvos': 'source:rnv',
                    '@rnv/engine-rn-web': 'source:rnv',
                    '@rnv/engine-rn-next': 'source:rnv',
                    '@rnv/engine-rn-electron': 'source:rnv'
                },
                {
                    '@rnv/engine-rn': 'source:rnv',
                    'custom-engine': {
                        version: '1.0.0'
                    }
                }
            ]
        },
        platforms: {
            additionalProperties: false,
            type: 'object',
            properties: {
                ios: {
                    // $ref: 'platforms.json#/definitions/ios'
                    ...schemaPlatforms.definitions.ios
                },
                android: {
                    // $ref: 'platforms.json#/definitions/android'
                    ...schemaPlatforms.definitions.android
                },
                web: {
                    // $ref: 'platforms.json#/definitions/web'
                    ...schemaPlatforms.definitions.web
                },
                webtv: {
                    // $ref: 'platforms.json#/definitions/webtv'
                    ...schemaPlatforms.definitions.webtv
                },
                chromecast: {
                    // $ref: 'platforms.json#/definitions/chromecast'
                    ...schemaPlatforms.definitions.chromecast
                },
                tvos: {
                    // $ref: 'platforms.json#/definitions/ios'
                    ...schemaPlatforms.definitions.ios
                },
                androidtv: {
                    // $ref: 'platforms.json#/definitions/android'
                    ...schemaPlatforms.definitions.android
                },
                firetv: {
                    // $ref: 'platforms.json#/definitions/android'
                    ...schemaPlatforms.definitions.android
                },
                webos: {
                    // $ref: 'platforms.json#/definitions/webos'
                    ...schemaPlatforms.definitions.webos
                },
                macos: {
                    // $ref: 'platforms.json#/definitions/macos'
                    ...schemaPlatforms.definitions.macos
                },
                tizen: {
                    // $ref: 'platforms.json#/definitions/tizen'
                    ...schemaPlatforms.definitions.tizen
                },
                windows: {
                    // $ref: 'platforms.json#/definitions/macos'
                    ...schemaPlatforms.definitions.macos
                },
                firefoxtv: {
                    // $ref: 'platforms.json#/definitions/firefox'
                    ...schemaPlatforms.definitions.firefox
                },
                firefoxos: {
                    // $ref: 'platforms.json#/definitions/firefox'
                    ...schemaPlatforms.definitions.firefox
                },
                tizenmobile: {
                    // $ref: 'platforms.json#/definitions/tizen'
                    ...schemaPlatforms.definitions.tizen
                },
                tizenwatch: {
                    // $ref: 'platforms.json#/definitions/tizen'
                    ...schemaPlatforms.definitions.tizen
                },
                androidwear: {
                    // $ref: 'platforms.json#/definitions/android'
                    ...schemaPlatforms.definitions.android
                },
                kaios: {
                    // $ref: 'platforms.json#/definitions/firefox'
                    ...schemaPlatforms.definitions.firefox
                }
            }
        },
        sdks: {
            additionalProperties: true,
            type: 'object',
            description: 'List of SDK locations used by RNV. This property is usually located in your `WORKSPACE/renative.json`',
            examples: [
                {
                    ANDROID_SDK: '/Users/paveljacko/Library/Android/sdk',
                    ANDROID_NDK: '/Users/paveljacko/Library/Android/sdk/ndk-bundle',
                    TIZEN_SDK: '/Users/paveljacko/tizen-studio',
                    WEBOS_SDK: '/opt/webOS_TV_SDK',
                    KAIOS_SDK: '/Applications/Kaiosrt.app'
                }
            ]
        },
        env: {
            additionalProperties: true,
            type: 'object'
        },
        defaultTargets: {
            additionalProperties: true,
            type: 'object',
            description: 'List of default target simulators and emulators',
            examples: [
                {
                    android: 'Nexus_5X_API_26',
                    androidtv: 'Android_TV_1080p_API_22',
                    androidwear: 'Android_Wear_Round_API_28',
                    ios: 'iPhone 8',
                    tvos: 'Apple TV 4K',
                    tizen: 'T-samsung-5.5-x86',
                    tizenwatch: 'W-5.5-circle-x86',
                    tizenmobile: 'M-5.5-x86',
                    webos: 'emulator'
                }
            ]
        },
        plugins: {
            type: 'object',
            description: 'Define all plugins available in your project. you can then use `includedPlugins` and `excludedPlugins` props to define active and inactive plugins per each app config',
            examples: [
                {
                    renative: 'source:rnv',
                    react: 'source:rnv',
                    'react-native-cached-image': 'source:rnv',
                    'react-native-web-image-loader': 'source:rnv',
                    'react-native-gesture-handler': {
                        version: '1.0.0'
                    },
                }
            ],
            additionalProperties: {
                type: ['object', 'string'],
                additionalProperties: false,
                properties: {
                    ...pluginProps
                }
                // if: {
                //     type: 'object'
                // },
                // then: {
                //     additionalProperties: false,
                //     properties: {
                //         ...pluginProps
                //     }
                // },
                // else: {
                //     additionalProperties: false,
                // }
                // anyOf: [
                //     {
                //         type: 'object',
                //         additionalProperties: false,
                //         properties: {
                //             ...pluginProps
                //         }
                //     },
                //     { type: 'string' }
                // ]
            }
        },
        projectName: {
            type: 'string',
            description: 'Name of the project which will be used in workspace as folder name. this will also be used as part of the KEY in crypto env var generator',
            examples: [
                'my-project',
                'myProject'
            ]
        },
        // name: {
        //     type: 'string'
        // },
        extend: {
            type: 'string'
        },
        projectTemplates: {
            additionalProperties: true,
            type: 'object',
            description: 'Custom list of renative templates (NPM package names) which will be displayed during `rnv new` project bootstrap. This prop usually resides in workspace config.',
            examples: [
                {
                    'my-custom-template': {}
                }
            ]
        },
        permissions: {
            additionalProperties: false,
            type: 'object',
            description: 'Permission definititions which can be used by app configs via `includedPermissions` and `excludedPermissions` to customize permissions for each app',
            examples: [
                {
                    ios: {},
                    android: {}
                }
            ],
            properties: {
                android: {
                    additionalProperties: true,
                    type: 'object',
                    description: 'Android SDK specific permissions',
                    examples: [
                        {
                            INTERNET: {
                                key: 'android.permission.INTERNET',
                                security: 'normal'
                            },
                            SYSTEM_ALERT_WINDOW: {
                                key: 'android.permission.SYSTEM_ALERT_WINDOW',
                                security: 'signature'
                            }
                        }
                    ]
                },
                ios: {
                    additionalProperties: true,
                    type: 'object',
                    description: 'iOS SDK specific permissions',
                    examples: [
                        {
                            NSAppleMusicUsageDescription: {
                                desc: 'Get favorite music'
                            },
                            NSBluetoothPeripheralUsageDescription: {
                                desc: 'Allow you to use your bluetooth to play music'
                            },
                            NSCalendarsUsageDescription: {
                                desc: 'Calendar for add events'
                            },
                            NSCameraUsageDescription: {
                                desc: 'Need camera to scan QR Codes'
                            },
                            NSLocationWhenInUseUsageDescription: {
                                desc: 'Geolocation tags for photos'
                            },
                            NSMicrophoneUsageDescription: {
                                desc: 'Need microphone for videos'
                            },
                            NSMotionUsageDescription: {
                                desc: 'To know when device is moving'
                            },
                            NSPhotoLibraryAddUsageDescription: {
                                desc: 'Need library to save images'
                            },
                            NSPhotoLibraryUsageDescription: {
                                desc: 'Allows to upload images from photo library'
                            },
                            NSSpeechRecognitionUsageDescription: {
                                desc: 'Speech Recognition to run in app commands'
                            },
                            NSContactsUsageDescription: {
                                desc: 'Get contacts list'
                            },
                            NSFaceIDUsageDescription: {
                                desc: 'Requires FaceID access to allows you quick and secure access.'
                            },
                            NSLocationAlwaysUsageDescription: {
                                desc: 'Geolocation tags for photos'
                            },
                            NSBluetoothAlwaysUsageDescription: {
                                desc: 'Allow you to use your bluetooth to play music'
                            },
                            NSLocationAlwaysAndWhenInUseUsageDescription: {
                                desc: 'Geolocation tags for photos'
                            }
                        }
                    ]
                }
            }
        },
        workspaceID: {
            type: 'string',
            description: 'Workspace ID your project belongs to. This will mach same folder name in the root of your user directory. ie `~/` on macOS',
            examples: [
                'rnv',
                'myCustomWorkspace',
            ],
        },
        version: {
            type: 'string',
            description: 'Semver style version of your app.',
            examples: [
                '0.1.0',
                '1.0.0',
                '1.0.0-alpha.1',
                '1.0.0-RC.7',
                '1.0.0-feature-x.0',
            ],
        },
        versionCode: {
            description: 'Manual verride of generated version code',
            type: 'string',
            examples: [
                '1000',
                '10023'
            ],
        },
        versionFormat: {
            description: `Allows you to fine-tune app version defined in package.json or renative.json.

If you do not define versionFormat, no formatting will apply to version.

"versionFormat" : "0.0.0"

IN: 1.2.3-rc.4+build.56 OUT: 1.2.3

IN: 1.2.3 OUT: 1.2.3



"versionFormat" : "0.0.0.0.0"

IN: 1.2.3-rc.4+build.56 OUT: 1.2.3.4.56

IN: 1.2.3 OUT: 1.2.3

"versionFormat" : "0.0.0.x.x.x.x"

IN: 1.2.3-rc.4+build.56 OUT: 1.2.3.rc.4.build.56

IN: 1.2.3 OUT: 1.2.3

`,
            examples: [
                '0.0.0',
                '0.0.0.0.0',
                '0.0.0.x.x.x.x'
            ],
            type: 'string'
        },
        versionCodeFormat: {
            description: `Allows you to fine-tune auto generated version codes.

Version code is autogenerated from app version defined in package.json or renative.json.

NOTE: If you define versionCode manually this formatting will not apply.

EXAMPLE 1:

default value: 00.00.00

IN: 1.2.3-rc.4+build.56 OUT: 102030456

IN: 1.2.3 OUT: 10203

EXAMPLE 2:

"versionCodeFormat" : "00.00.00.00.00"

IN: 1.2.3-rc.4+build.56 OUT: 102030456

IN: 1.2.3 OUT: 102030000

EXAMPLE 3:

"versionCodeFormat" : "00.00.00.0000"

IN: 1.0.23-rc.15 OUT: 100230015

IN: 1.0.23 OUT: 100230000

`,
            examples: [
                '00.00.00',
                '00.00.00.00.00',
                '00.00.00.0000'
            ],
            type: 'string'
        },
        description: {
            type: 'string'
        },
        id: {
            type: 'string',
            description: 'ID of the app in `./appConfigs/[APP_ID]/renative.json`. MUST match APP_ID name of the folder',
            examples: [
                'helloworld',
                'someapp'
            ]
        },
        isWrapper: {
            type: 'boolean'
        },
        isMonorepo: {
            type: 'boolean'
        },
        enableAnalytics: {
            type: 'boolean',
            description: 'Enable or disable sending analytics to improve ReNative',
            examples: [
                true,
                false
            ]
        },
        paths: {
            additionalProperties: false,
            type: 'object',
            description: 'Define custom paths for RNV to look into',
            properties: {
                appConfigsDir: {
                    type: 'string',
                    description: 'Custom path to appConfigs. defaults to `./appConfigs`',
                    examples: [
                        './appConfigs'
                    ]
                },
                platformAssetsDir: {
                    type: 'string',
                    description: 'Custom path to platformAssets folder. defaults to `./platformAssets`',
                    examples: [
                        './platformAssets'
                    ]
                },
                platformBuildsDir: {
                    type: 'string',
                    description: 'Custom path to platformBuilds folder. defaults to `./platformBuilds`',
                    examples: [
                        './platformBuilds'
                    ]
                },
                pluginTemplates: {
                    additionalProperties: true,
                    type: 'object',
                    description: `
Allows you to define custom plugin template scopes. default scope for all plugins is \`rnv\`.
this custom scope can then be used by plugin via \`"source:myCustomScope"\` value

those will allow you to use direct pointer to preconfigured plugin:

\`\`\`
"plugin-name": "source:myCustomScope"
\`\`\`

NOTE: by default every plugin you define with scope will also merge any
files defined in overrides automatically to your project.
To skip file overrides coming from source plugin you need to detach it from the scope:

\`\`\`
{
    "plugins": {
        "plugin-name": {
            "source": ""
        }
    }
}
\`\`\`
`,
                    examples: [
                        {
                            myCustomScope: {
                                npm: 'some-renative-template-package',
                                path: './pluginTemplates'
                            }
                        }
                    ]
                },
            }
        },
        tasks: {
            additionalProperties: true,
            type: 'object',
            description: 'Allows to override specific task within renative toolchain. (currently only `install` supported). this is useful if you want to change specific behaviour of built-in task. ie install task triggers yarn/npm install by default. but that might not be desirable installation trigger',
            examples: [
                {
                    install: {
                        script: 'yarn bootstrap'
                    }
                }
            ]
        },
        pipes: {
            type: 'array',
            description: 'To avoid rnv building `buildHooks/src` every time you can specify which specific pipes should trigger recompile of buildHooks',
            examples: [
                [
                    'configure:after',
                    'start:before',
                    'deploy:after',
                    'export:before',
                    'export:after'
                ]
            ]
        },
        defaults: {
            additionalProperties: false,
            type: 'object',
            description: 'Default system config for this project',
            properties: {
                supportedPlatforms: {
                    type: 'array',
                    description: 'Array list of all supported platforms in current project',
                    examples: [
                        [
                            'ios',
                            'android',
                            'androidtv',
                            'web',
                            'macos',
                            'tvos',
                            'androidwear'
                        ]
                    ]
                },
                schemes: {
                    type: 'object',
                    description: 'List of default schemes for each platform. This is useful if you want to avoid specifying `-s ...` every time your run rnv command. bu default rnv uses `-s debug`. NOTE: you can only use schemes you defined in `buildSchemes`',
                    examples: [
                        {
                            ios: 'myCustomScheme',
                            android: 'otherCustomScheme'
                        }
                    ]
                },
                targets: {
                    type: 'object',
                    description: 'Override of default targets specific to this project',
                    examples: [
                        {
                            ios: 'iPhone 8',
                            tvos: 'Apple TV 4K'
                        }
                    ]
                },
                ports: {
                    type: 'object',
                    description: 'Allows you to assign custom port per each supported platform specific to this project. this is useful if you foten switch between multiple projects and do not want to experience constant port conflicts',
                    examples: [
                        {
                            ios: 8182,
                            android: 8183,
                            androidtv: 8184,
                            tvos: 8185,
                            macos: 8186,
                            web: 8180,
                            tizen: 8187,
                            webos: 8188,
                            androidwear: 8189,
                            tizenwatch: 8190,
                            tizenmobile: 8191,
                            windows: 8192,
                            kaios: 8193,
                            firefoxos: 8194,
                            firefoxtv: 8114,
                            webtv: 8195
                        }
                    ]
                }
            }
        },
        pluginTemplates: {
            additionalProperties: true,
            type: 'object'
        },
        templates: {
            additionalProperties: true,
            type: 'object',
            description: 'Stores installed templates info in your project.\n\nNOTE: This prop will be updated by rnv if you run `rnv template install`',
            examples: [
                {
                    'renative-template-hello-world': {
                        version: '0.31.0'
                    }
                }
            ]
        },
        currentTemplate: {
            type: 'string',
            description: 'Currently active template used in this project. this allows you to re-bootstrap whole project by running `rnv template apply`',
            examples: [
                'renative-template-hello-world'
            ]
        },
        crypto: {
            additionalProperties: false,
            type: 'object',
            description: 'This prop enables automatic encrypt and decrypt of sensitive information in your project',
            properties: {
                encrypt: {
                    additionalProperties: false,
                    type: 'object',
                    properties: {
                        dest: {
                            type: 'string',
                            description: 'Location of encrypted file in your project used as destination of encryption from your workspace',
                            examples: [
                                'PROJECT_HOME/ci/privateConfigs.enc'
                            ]
                        }
                    }
                },
                decrypt: {
                    additionalProperties: false,
                    type: 'object',
                    properties: {
                        source: {
                            type: 'string',
                            description: 'Location of encrypted file in your project used as source of decryption into your workspace',
                            examples: [
                                'PROJECT_HOME/ci/privateConfigs.enc'
                            ]
                        }
                    }
                },
                optional: {
                    type: 'boolean'
                },
            }
        },
        integrations: {
            additionalProperties: true,
            type: 'object'
        },
        publish: {
            additionalProperties: true,
            type: 'object'
        },
        private: {
            additionalProperties: true,
            type: 'object',
            description: 'Special object which contains private info. this object should be used only in `renative.private.json` files and never commited to your repository. Private files usually reside in your workspace and are subject to crypto encryption if enabled. RNV will warn you if it finds private key in your regular `renative.json` file',
            examples: [
                {
                    myPrivateKy: '6568347563858739'
                }
            ]
        },
        hidden: {
            type: 'boolean',
            description: 'If set to true in `./appConfigs/[APP_ID]/renative.json` the APP_ID will be hidden from list of appConfigs `-c`',
            examples: [
                true,
                false
            ]
        },
        templateConfig: {
            description: 'Used in `renative.template.json` allows you to define template behaviour.',
            type: 'object',
            additionalProperties: false,
            properties: {
                includedPaths: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Defines list of all file/dir paths you want to include in template',
                    examples: [
                        ['next.config.js', 'babel.config.js', 'appConfigs', 'public', 'src'],
                    ]
                },
                bootstrapQuestions: {
                    type: 'array',
                    items: { type: 'object' },
                    description: 'Defines list of custom bootstrap questions',
                    examples: [
                        [

                            {
                                title: 'Which service to use?',
                                type: 'list',
                                configProp: {
                                    key: 'runtime.myServiceConfig',
                                    file: 'renative.json'
                                },
                                options: [
                                    {
                                        title: 'Service 1',
                                        value: {
                                            id: 'xxx1',
                                        }
                                    },
                                    {
                                        title: 'Service 2',
                                        value: {
                                            id: 'xxx2',
                                        }
                                    },
                                ]
                            }
                        ]
                    ]
                }
            }
        },
        enableHookRebuild: {
            type: 'boolean',
            description: 'If set to true in `./renative.json` build hooks will be compiled at each rnv command run. If set to `false` (default) rebuild will be triggered only if `dist` folder is missing, `-r` has been passed or you run `rnv hooks run` directly making your rnv commands faster',
            examples: [
                true,
                false
            ]
        },
        ...propExt
    }
};

export const SCHEMAS_RENATIVE_JSON = [schemaRoot, schemaPlatforms];
