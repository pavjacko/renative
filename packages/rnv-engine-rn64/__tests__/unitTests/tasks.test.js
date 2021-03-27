/* eslint-disable global-require */

import taskRnvRun from '../../src/tasks/task.rnv.run';
import { generateMockConfig } from '../../../jest-preset-rnv/mocks';

jest.mock('fs');

jest.mock('axios', () => ({
    get: () => true
}));

const configPropMocks = {
    scheme: 'debug',
    bundleAssets: false
};

jest.mock('rnv', () => {
    const _chalkCols = {
        white: v => v,
        green: v => v,
        red: v => v,
        yellow: v => v,
        default: v => v,
        gray: v => v,
        grey: v => v,
        blue: v => v,
        cyan: v => v,
        magenta: v => v
    };
    _chalkCols.rgb = () => v => v;
    _chalkCols.bold = _chalkCols;
    const _chalkMono = {
        ..._chalkCols
    };
    return {
        EngineManager: {

        },
        Common: {
            getConfigProp: (c, platform, key) => configPropMocks[key],
            confirmActiveBundler: () => null,
            getAppFolder: () => null
        },
        Logger: {
            logToSummary: jest.fn(),
            logTask: jest.fn(),
            logDebug: jest.fn(),
            logInfo: jest.fn(),
            logError: jest.fn(),
            logWarning: jest.fn(),
            logSuccess: jest.fn(),
            logSummary: jest.fn(),
            chalk: () => _chalkMono
        },
        FileUtils: {
            fsExistsSync: () => null,
            copyFileSync: () => null,
        },
        Constants: {
            PARAMS: {
                withBase: () => [],
                withRun: () => [],
                withConfigure: () => []
            },
            IOS: 'ios'
        },
        TaskManager: {
            executeTask: () => null,
            executeOrSkipTask: () => null,
        },
        Exec: {
            executeAsync: () => null,
        },
        ObjectUtils: {
            isObject: () => null,
        },
        PluginManager: {
            parsePlugins: () => null,
        },
        ProjectManager: {
            copyAssetsFolder: () => null,
            copyBuildsFolder: () => null,
            parseFonts: () => null,
        },
        Resolver: {
            doResolve: () => null,
            doResolvePath: () => null,
        },
        Prompt: {
            isSystemWin: () => null,
        },
        Utils: {
            inquirerPrompt: () => null,
        },
        PlatformManager: {
            isPlatformActive: () => null,
            logErrorPlatform: () => null
        },
        RuntimeManager: {
            updateRenativeConfigs: () => null
        },
        SDKManager: {
            Apple: {

            },
            Android: {

            }
        }
    };
});


beforeEach(() => {
});

afterEach(() => {

});

const originTask = {};
const c = generateMockConfig({});

test('Execute task.rnv.run', async () => {
    // const taskManager = require('../../src/core/taskManager/index.js');
    // await taskRnvRun.fn(c, null, originTask);
    await expect(taskRnvRun.fn(c, null, originTask)).resolves.toEqual(true);
    // expect(taskManager.executeTask).toHaveBeenCalledWith(c, 'project configure', 'platform list', originTask);
});
