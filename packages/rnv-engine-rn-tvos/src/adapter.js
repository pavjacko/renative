const blacklist = require('metro-config/src/defaults/blacklist');
const path = require('path');

export const withRNV = (config) => {
    const projectPath = process.env.RNV_PROJECT_ROOT || process.cwd();

    const watchFolders = [path.resolve(projectPath, 'node_modules')];

    if (process.env.RNV_IS_MONOREPO === 'true' || process.env.RNV_IS_MONOREPO === true) {
        const monoRootPath = process.env.RNV_MONO_ROOT || projectPath;
        watchFolders.push(path.resolve(monoRootPath, 'node_modules'));
        watchFolders.push(path.resolve(monoRootPath, 'packages'));
    }
    if (config?.watchFolders?.length) {
        watchFolders.push(...config.watchFolders);
    }

    const cnf = {
        ...config,
        transformer: {
            getTransformOptions: async () => ({
                transform: {
                    // this defeats the RCTDeviceEventEmitter is not a registered callable module
                    inlineRequires: true,
                },
            }),
            ...config?.transformer || {},
        },
        resolver: {
            blacklistRE: blacklist([
                /platformBuilds\/.*/,
                /buildHooks\/.*/,
                /projectConfig\/.*/,
                /appConfigs\/.*/,
                /renative.local.*/,
                /metro.config.local.*/,
                /platformBuilds\/.*/,
                /buildHooks\/.*/,
                /projectConfig\/.*/,
                /website\/.*/,
                /appConfigs\/.*/,
                /renative.local.*/,
                /metro.config.local.*/,
            ]),
            ...config?.resolver || {},
            extraNodeModules: {
                ...config?.resolver?.extraNodeModules || []
            }
        },
        watchFolders,
        projectRoot: path.resolve(projectPath)
    };
    cnf.resolver.sourceExts = process.env.RNV_EXTENSIONS.split(',');

    return cnf;
};

export const createEngineAlias = (customAlias) => {
    const projectPath = process.env.RNV_PROJECT_ROOT || process.cwd();
    const isMonorepo = process.env.RNV_IS_MONOREPO === 'true' || process.env.RNV_IS_MONOREPO === true;
    const rootPath = isMonorepo ? process.env.RNV_MONO_ROOT || projectPath : projectPath;
    const alias = customAlias ? { ...customAlias } : {};

    if (process.env.RNV_IS_TVOS === 'true' || process.env.RNV_IS_TVOS === true) {
        alias['react-native'] = `${rootPath}/node_modules/react-native-tvos`;
    }

    return alias;
};
