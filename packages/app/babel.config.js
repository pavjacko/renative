const { createEngineAlias } = require('@rnv/engine-rn-tvos');

module.exports = {
    retainLines: true,
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        [
            require.resolve('babel-plugin-module-resolver'),
            {
                root: ['..'],
                alias: { ...createEngineAlias() }
            },
        ],
    ],
};
