import { EngineManager, Config } from 'rnv';
import { withRNV } from './adapter';
import CNF from '../renative.engine.json';
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
        ios: {
            defaultPort: 8082,
            extenstions: generateEngineExtensions([
                'ios.mobile', 'mobile', 'ios', 'mobile.native', 'native'
            ], CNF)
        },
        android: {
            defaultPort: 8083,
            extenstions: generateEngineExtensions([
                'android.mobile', 'mobile', 'android', 'mobile.native', 'native'
            ], CNF)
        },
        androidtv: {
            defaultPort: 8084,
            extenstions: generateEngineExtensions([
                'androidtv.tv', 'tv', 'androidtv', 'android', 'tv.native', 'native'
            ], CNF)
        },
        firetv: {
            defaultPort: 8098,
            extenstions: generateEngineExtensions([
                'firetv.tv', 'androidtv.tv', 'tv', 'firetv', 'androidtv', 'android', 'tv.native', 'native'
            ], CNF)
        },
        androidwear: {
            defaultPort: 8084,
            extenstions: generateEngineExtensions([
                'androidwear.watch', 'watch', 'androidwear', 'android', 'watch.native', 'native'
            ], CNF)
        },
        tvos: {
            defaultPort: 8089,
            extenstions: generateEngineExtensions([
                'tvos.tv', 'tv', 'tvos', 'ios', 'tv.native', 'native'
            ], CNF)
        }
    }

};

export { withRNV };
