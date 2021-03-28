const path = require('path');
const { withRNV } = require('@rnv/engine-rn64');

const defaultConfig = {
    watchFolders: [
        path.resolve(__dirname, '../renative')
    ],
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: true,
            },
        }),
    },
};

module.exports = withRNV(defaultConfig);
