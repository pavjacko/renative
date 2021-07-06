import { EngineManager, Config } from 'rnv';
import taskRnvRun from './tasks/task.rnv.run';
import taskRnvPackage from './tasks/task.rnv.package';
import taskRnvBuild from './tasks/task.rnv.build';
import taskRnvConfigure from './tasks/task.rnv.configure';
import taskRnvStart from './tasks/task.rnv.start';
import taskRnvExport from './tasks/task.rnv.export';
import taskRnvDeploy from './tasks/task.rnv.deploy';
import taskRnvDebug from './tasks/task.rnv.debug';
import taskRnvCryptoInstallCerts from './tasks/task.rnv.crypto.installCerts';
import taskRnvCryptoUpdateProfile from './tasks/task.rnv.crypto.updateProfile';
import taskRnvCryptoUpdateProfiles from './tasks/task.rnv.crypto.updateProfiles';
import taskRnvCryptoInstallProfiles from './tasks/task.rnv.crypto.installProfiles';
import taskRnvLog from './tasks/task.rnv.log';
import CNF from '../renative.engine.json';

export { withRNV, createEngineAlias } from './adapter';

const { generateEngineTasks, generateEngineExtensions } = EngineManager;

export default {
    initializeRuntimeConfig: c => Config.initializeConfig(c),
    tasks: generateEngineTasks([
        taskRnvRun,
        taskRnvPackage,
        taskRnvBuild,
        taskRnvConfigure,
        taskRnvStart,
        taskRnvExport,
        taskRnvDeploy,
        taskRnvDebug,
        taskRnvCryptoInstallCerts,
        taskRnvCryptoUpdateProfile,
        taskRnvCryptoUpdateProfiles,
        taskRnvCryptoInstallProfiles,
        taskRnvLog
    ]),
    config: CNF,
    projectDirName: '',
    ejectPlatform: null,
    platforms: {
        tvos: {
            defaultPort: 8089,
            extenstions: generateEngineExtensions([
                'tvos.tv', 'tv', 'tvos', 'tv.native', 'native'
            ], CNF)
        },
    }
};
