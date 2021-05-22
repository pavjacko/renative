// PLATFORM
import { homedir } from 'os';
import path from 'path';

export const USER_HOME_DIR = homedir();
export const RNV_HOME_DIR = path.join(__dirname, '../..');
// Self check: if in packages => linked, if node_modules => installed
export const IS_LINKED = path.dirname(RNV_HOME_DIR).split(path.sep).pop() === 'packages';
export const CURRENT_DIR = path.resolve('.');
export const RNV_NODE_MODULES_DIR = path.join(RNV_HOME_DIR, 'node_modules');

export const ANDROID = 'android';
export const ANDROID_AUTO = 'androidauto';
export const ANDROID_TV = 'androidtv';
export const ANDROID_WEAR = 'androidwear';
export const ALEXA = 'alexa';
export const APPLE_AUTO = 'appleauto';
export const ASTIAN = 'astian';
export const BLACKBERRY = 'blackberry';
export const CHROMECAST = 'chromecast';
export const CHROME_OS = 'chromeos';
export const FIREFOX_OS = 'firefoxos';
export const FIREFOX_TV = 'firefoxtv';
export const FIRE_OS = 'fireos';
export const FIRE_TV = 'firetv';
export const HBBTV = 'hbbtv';
export const IOS = 'ios';
export const KAIOS = 'kaios';
export const MACOS = 'macos';
export const MEEGO = 'meego';
export const NETCAST = 'netcast';
export const OCCULUS = 'occulus';
export const ORSAY = 'orsay';
export const PS4 = 'ps4';
export const ROKU = 'roku';
export const SAILFISH = 'sailfish';
export const TIVO = 'tivo';
export const TIZEN = 'tizen';
export const TIZEN_WATCH = 'tizenwatch';
export const TIZEN_MOBILE = 'tizenmobile';
export const TVOS = 'tvos';
export const UBUNTU = 'ubuntu';
export const UBUNTU_TOUCH = 'ubuntutouch';
export const UNITY = 'unity';
export const VEWD = 'vewd';
export const VIDAA = 'vidaa';
export const VIERACONNECT = 'vieraconnect';
export const VIZIO = 'vizio';
export const WATCHOS = 'watchos';
export const WEB = 'web';
export const WEBTV = 'webtv';
export const WEBOS = 'webos';
export const WEBIAN = 'webian';
export const WII = 'wii';
export const WINDOWS = 'windows';
export const WP10 = 'wp10';
export const WP8 = 'wp8';
export const XBOX = 'xbox';
export const XBOX360 = 'xbox360';
// Kodi, Boxee, HorizonTV, Mediaroom(Ericsson), YahooSmartTV, Slingbox, Hololens, Occulus, GearVR, WebVR, Saphi

export const ICONS = {
    PHONE: '📱',
    AUTO: '🚗',
    TV: '📺',
    CONSOLE: '🎮',
    WATCH: '⌚',
    DESKTOP: '🖥️ ',
    BROWSER: '🌐',
    VOICE: '📢',
    SERVICE: '☁️'
};

export const REMOTE_DEBUG_PORT = 8079;
// CLI
export const CLI_ANDROID_EMULATOR = 'androidEmulator';
export const CLI_ANDROID_ADB = 'androidAdb';
export const CLI_ANDROID_AVDMANAGER = 'androidAvdManager';
export const CLI_ANDROID_SDKMANAGER = 'androidSdkManager';
export const CLI_TIZEN_EMULATOR = 'tizenEmulator';
export const CLI_KAIOS_EMULATOR = 'tizenEmulator';
export const CLI_TIZEN = 'tizen';
export const CLI_SDB_TIZEN = 'tizenSdb';
export const CLI_WEBOS_ARES = 'webosAres';
export const CLI_WEBOS_ARES_PACKAGE = 'webosAresPackage';
export const CLI_WEBOS_ARES_INSTALL = 'webosAresInstall';
export const CLI_WEBOS_ARES_LAUNCH = 'webosAresLaunch';
export const CLI_WEBOS_ARES_SETUP_DEVICE = 'webosAresSetup';
export const CLI_WEBOS_ARES_DEVICE_INFO = 'webosAresDeviceInfo';
export const CLI_WEBOS_ARES_NOVACOM = 'webosAresNovacom';
// SDK
export const ANDROID_SDK = 'ANDROID_SDK';
export const ANDROID_NDK = 'ANDROID_NDK';
export const TIZEN_SDK = 'TIZEN_SDK';
export const WEBOS_SDK = 'WEBOS_SDK';
export const KAIOS_SDK = 'KAIOS_SDK';

export const RENATIVE_CONFIG_NAME = 'renative.json';
export const RENATIVE_CONFIG_LOCAL_NAME = 'renative.local.json';
export const RENATIVE_CONFIG_PRIVATE_NAME = 'renative.private.json';
export const RENATIVE_CONFIG_TEMPLATE_NAME = 'renative.template.json';
export const RENATIVE_CONFIG_BUILD_NAME = 'renative.build.json';
export const RENATIVE_CONFIG_RUNTIME_NAME = 'renative.runtime.json';
export const RENATIVE_CONFIG_WORKSPACES_NAME = 'renative.workspaces.json';
export const RENATIVE_CONFIG_PLUGINS_NAME = 'renative.plugins.json';
export const RENATIVE_CONFIG_TEMPLATES_NAME = 'renative.templates.json';
export const RENATIVE_CONFIG_PLATFORMS_NAME = 'renative.platforms.json';
export const RENATIVE_CONFIG_ENGINE_NAME = 'renative.engine.json';
export const RN_CLI_CONFIG_NAME = 'metro.config.js';
export const RN_BABEL_CONFIG_NAME = 'babel.config.js';
export const NEXT_CONFIG_NAME = 'next.config.js';
export const SAMPLE_APP_ID = 'helloworld';

export const IS_TABLET_ABOVE_INCH = 6.5;
export const IS_WEAR_UNDER_SIZE = 1000; // width + height

export const PACKAGE_JSON_FILEDS = [
    'name',
    'version',
    'description',
    'keywords',
    'homepage',
    'bugs',
    'license',
    'author',
    'contributors',
    'files',
    'main',
    'browser',
    'bin',
    'man',
    'directories',
    'repository',
    'scripts',
    'config',
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'bundledDependencies',
    'optionalDependencies',
    'engines',
    'engineStrict',
    'os',
    'cpu',
    'private',
    'publishConfig'
];
// DEPRECATED
export const SUPPORTED_PLATFORMS = [
    IOS,
    ANDROID,
    FIRE_TV,
    ANDROID_TV,
    ANDROID_WEAR,
    WEB,
    WEBTV,
    TIZEN,
    TIZEN_MOBILE,
    TVOS,
    WEBOS,
    MACOS,
    WINDOWS,
    TIZEN_WATCH,
    KAIOS,
    FIREFOX_OS,
    FIREFOX_TV,
    CHROMECAST
];


export const SDK_PLATFORMS = {};
SDK_PLATFORMS[ANDROID] = ANDROID_SDK;
SDK_PLATFORMS[ANDROID_TV] = ANDROID_SDK;
SDK_PLATFORMS[FIRE_TV] = ANDROID_SDK;
SDK_PLATFORMS[ANDROID_WEAR] = ANDROID_SDK;
SDK_PLATFORMS[TIZEN] = TIZEN_SDK;
SDK_PLATFORMS[TIZEN_WATCH] = TIZEN_SDK;
SDK_PLATFORMS[TIZEN_MOBILE] = TIZEN_SDK;
SDK_PLATFORMS[WEBOS] = WEBOS_SDK;
SDK_PLATFORMS[KAIOS] = KAIOS_SDK;

export const TASK_RUN = 'run';
export const TASK_CONFIGURE = 'configure';
export const TASK_DOCTOR = 'doctor';
export const TASK_BUILD = 'build';
export const TASK_INFO = 'info';
export const TASK_START = 'start';
export const TASK_EXPORT = 'export';
export const TASK_DEBUG = 'debug';
export const TASK_PACKAGE = 'package';
export const TASK_DEPLOY = 'deploy';
export const TASK_LOG = 'log';
export const TASK_CLEAN = 'clean';
export const TASK_INSTALL = 'install';
export const TASK_PUBLISH = 'publish';
export const TASK_STATUS = 'status';
export const TASK_SWITCH = 'switch';
export const TASK_TARGET_LAUNCH = 'target launch';
export const TASK_TARGET_LIST = 'target list';
export const TASK_TARGET = 'target';
export const TASK_TEMPLATE_ADD = 'template add';
export const TASK_TEMPLATE_LIST = 'template list';
export const TASK_TEMPLATE_APPLY = 'template apply';
export const TASK_WORKSPACE_ADD = 'workspace add';
export const TASK_WORKSPACE_CONNECT = 'workspace connect';
export const TASK_WORKSPACE_LIST = 'workspace list';
export const TASK_WORKSPACE_UPDATE = 'workspace update';
export const TASK_PLATFORM_CONFIGURE = 'platform configure';
export const TASK_PLATFORM_CONNECT = 'platform connect';
export const TASK_PLATFORM_EJECT = 'platform eject';
export const TASK_PLATFORM_LIST = 'platform list';
export const TASK_PLATFORM_SETUP = 'platform setup';
export const TASK_PROJECT_CONFIGURE = 'project configure';
export const TASK_PROJECT_UPGRADE = 'project upgrade';
export const TASK_PLUGIN_ADD = 'plugin add';
export const TASK_PLUGIN_LIST = 'plugin list';
export const TASK_PLUGIN_UPDATE = 'plugin update';
export const TASK_CRYPTO_ENCRYPT = 'crypto encrypt';
export const TASK_CRYPTO_DECRYPT = 'crypto decrypt';
export const TASK_CRYPTO_INSTALL_CERTS = 'crypto installCerts';
export const TASK_CRYPTO_INSTALL_PROFILES = 'crypto installProfiles';
export const TASK_CRYPTO_INSTALL_PROFILE = 'crypto installProfile';
export const TASK_CRYPTO_UPDATE_PROFILE = 'crypto updateProfile';
export const TASK_CRYPTO_UPDATE_PROFILES = 'crypto updateProfiles';
export const TASK_HOOKS_RUN = 'hooks run';
export const TASK_HOOKS_LIST = 'hooks list';
export const TASK_HOOKS_PIPES = 'hooks pipes';
export const TASK_PKG = 'pkg';
export const TASK_APP_CONFIGURE = 'app configure';
export const TASK_APP_CREATE = 'app create';
export const TASK_WORKSPACE_CONFIGURE = 'workspace configure';
export const TASK_CONFIGURE_SOFT = 'configureSoft';
export const TASK_KILL = 'kill';

export const CLI_PROPS = [
    'provisioningStyle',
    'codeSignIdentity',
    'provisionProfileSpecifier'
];

export const PARAM_KEYS = {
    info: {
        shortcut: 'i',
        value: 'value',
        description: 'Show full debug Info'
    },
    updatePods: {
        shortcut: 'u',
        description: 'Force update dependencies (iOS only)'
    },
    platform: {
        shortcut: 'p',
        value: 'value',
        description: 'select specific Platform'
    },
    appConfigID: {
        shortcut: 'c',
        value: 'value',
        description: 'select specific app Config id'
    },
    target: {
        shortcut: 't',
        value: 'value',
        description: 'select specific Target device/simulator'
    },
    template: {
        shortcut: 'T',
        value: 'value',
        isRequired: true,
        description: 'select specific template'
    },
    device: {
        shortcut: 'd',
        value: 'value',
        description: 'select connected Device'
    },
    scheme: {
        shortcut: 's',
        value: 'value',
        description: 'select build Scheme'
    },
    filter: {
        shortcut: 'f',
        value: 'value',
        isRequired: true,
        description: 'Filter value'
    },
    list: {
        shortcut: 'l',
        description: 'return List of items related to command'
    },
    only: {
        shortcut: 'o',
        description: 'run Only top command (Skip dependencies)'
    },
    reset: {
        shortcut: 'r',
        description: 'also perform reset of platform build'
    },
    resetHard: {
        shortcut: 'R',
        description: 'also perform reset of platform platform and platform assets'
    },
    resetAssets: {
        shortcut: 'a',
        description: 'also perform reset of platform assets'
    },
    key: {
        shortcut: 'k',
        value: 'value',
        isRequired: true,
        description: 'Pass the key/password'
    },
    blueprint: {
        shortcut: 'b',
        value: 'value',
        description: 'Blueprint for targets'
    },
    help: {
        shortcut: 'h',
        description: 'Displays help info for particular command'
    },
    host: {
        shortcut: 'H',
        value: 'value',
        isRequired: true,
        description: 'custom Host ip'
    },
    exeMethod: {
        shortcut: 'x',
        value: 'value',
        description: 'eXecutable method in buildHooks'
    },
    port: {
        shortcut: 'P',
        value: 'value',
        isRequired: true,
        description: 'custom Port'
    },
    debug: {
        shortcut: 'D',
        value: 'value',
        description: 'enable or disable remote debugger.',
        examples: [
            '--debug weinre //run remote debug with weinre as preference',
            '--debug chii //run remote debug with chii as preference',
            '--debug false //force disable remote debug',
            '--debug //run remote debug with default preference (chii)'
        ]
    },
    global: {
        shortcut: 'G',
        description: 'Flag for setting a config value for all RNV projects'
    },
    engine: {
        shortcut: 'e',
        value: 'value',
        isRequired: true,
        description: 'engine to be used (next)'
    },
    debugIp: {
        value: 'value',
        isRequired: true,
        description: '(optional) overwrite the ip to which the remote debugger will connect'
    },
    ci: {
        description: 'CI/CD flag so it wont ask questions'
    },
    mono: {
        description: 'Monochrome console output without chalk'
    },
    skipNotifications: {
        description: 'Skip sending any integrated notifications'
    },
    keychain: {
        value: 'value',
        isRequired: true,
        description: 'Name of the keychain'
    },
    provisioningStyle: {
        value: 'value',
        isRequired: true,
        description: 'Set provisioningStyle <Automatic | Manual>'
    },
    codeSignIdentity: {
        value: 'value',
        isRequired: true,
        description: 'Set codeSignIdentity ie <iPhone Distribution>'
    },
    provisionProfileSpecifier: {
        value: 'value',
        isRequired: true,
        description: 'Name of provisionProfile'
    },
    hosted: {
        description: 'Run in a hosted environment (skip budleAssets)'
    },
    hooks: {
        description: 'Force rebuild hooks'
    },
    maxErrorLength: {
        value: 'number',
        isRequired: true,
        description: 'Specify how many characters each error should display. Default 200'
    },
    skipTargetCheck: {
        description: 'Skip Android target check, just display the raw adb devices to choose from'
    },
    analyzer: {
        description: 'Enable real-time bundle analyzer'
    },
    xcodebuildArchiveArgs: {
        value: 'value',
        isRequired: true,
        description: 'pass down custom xcodebuild arguments'
    },
    xcodebuildExportArgs: {
        value: 'value',
        isRequired: true,
        description: 'pass down custom xcodebuild arguments'
    },
    skipDependencyCheck: {
        description: 'Skips auto update of npm dependencies if mismatch found'
    },
    configName: {
        value: 'value',
        isRequired: true,
        description: 'Use custom name for ./renative.json. (applies only at root level)'
    },
    packageManager: {
        value: 'value',
        description: 'Specify the desired package manager to be used',
        examples: [
            '--packageManager yarn',
            '--packageManager npm'
        ]
    }
};

Object.keys(PARAM_KEYS).forEach((k) => {
    PARAM_KEYS[k].key = k;
});


export const PARAMS = {
    withBase: arr => [PARAM_KEYS.info, PARAM_KEYS.ci, PARAM_KEYS.mono,
        PARAM_KEYS.maxErrorLength, PARAM_KEYS.only].concat(arr || []),
    withConfigure: arr => [PARAM_KEYS.reset, PARAM_KEYS.resetHard, PARAM_KEYS.engine, PARAM_KEYS.resetAssets,
        PARAM_KEYS.appConfigID, PARAM_KEYS.scheme, PARAM_KEYS.platform].concat(arr || []),
    withRun: arr => [PARAM_KEYS.target, PARAM_KEYS.device, PARAM_KEYS.hosted,
        PARAM_KEYS.port, PARAM_KEYS.debug, PARAM_KEYS.debugIp, PARAM_KEYS.skipTargetCheck,
        PARAM_KEYS.host].concat(arr || []),
    withAll: arr => Object.values(PARAM_KEYS).concat(arr || []),
    all: Object.keys(PARAM_KEYS)
};


export const configSchema = {
    analytics: {
        values: ['true', 'false'],
        key: 'enableAnalytics',
        default: true
    }
};

export const RNV_PACKAGES = [
    {
        packageName: 'renative',
        folderName: 'renative',
        skipLinking: true
    },
    {
        packageName: 'renative-template-hello-world',
        folderName: 'renative-template-hello-world'
    },
    {
        packageName: 'renative-template-blank',
        folderName: 'renative-template-blank'
    },
    {
        packageName: 'renative-template-kitchen-sink',
        folderName: 'renative-template-kitchen-sink'
    },
    {
        packageName: 'rnv',
        folderName: 'rnv'
    },
    {
        packageName: '@rnv/engine-lightning',
        folderName: 'rnv-engine-lightning'
    },
    {
        packageName: '@rnv/engine-rn',
        folderName: 'rnv-engine-rn'
    },
    {
        packageName: '@rnv/engine-rn-electron',
        folderName: 'rnv-engine-rn-electron'
    },
    {
        packageName: '@rnv/engine-rn-next',
        folderName: 'rnv-engine-rn-next'
    },
    {
        packageName: '@rnv/engine-rn-tvos',
        folderName: 'rnv-engine-rn-tvos'
    },
    {
        packageName: '@rnv/engine-rn-web',
        folderName: 'rnv-engine-rn-web'
    },
    {
        packageName: '@rnv/engine-roku',
        folderName: 'rnv-engine-roku'
    },
    {
        packageName: '@rnv/integration-docker',
        folderName: 'rnv-integration-docker'
    },
    {
        packageName: '@rnv/integration-ftp',
        folderName: 'rnv-integration-ftp'
    },
    {
        packageName: '@rnv/integration-vercel',
        folderName: 'rnv-integration-vercel'
    },
];

export const INJECTABLE_CONFIG_PROPS = ['id', 'title', 'entryFile', 'backgroundColor', 'scheme',
    'teamID', 'provisioningStyle', 'bundleAssets', 'multipleAPKs', 'pagesDir'];
export const INJECTABLE_RUNTIME_PROPS = ['appId', 'scheme', 'timestamp', 'localhost', 'target', 'port'];

export const REDASH_URL = 'https://rnv.nxg.staging.24imedia.com/events';
export const REDASH_KEY = 'zCYINQqMxvat1V41Hb9d69JMVBDNLyeQ4wICtdtD';

export const REMOTE_DEBUGGER_ENABLED_PLATFORMS = [TIZEN, TIZEN_MOBILE, TIZEN_WATCH];
