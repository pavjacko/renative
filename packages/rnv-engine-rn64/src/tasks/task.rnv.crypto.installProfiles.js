import path from 'path';
import { TaskManager, Constants, Logger, FileUtils } from 'rnv';

const {
    logWarning,
    logError,
    logTask,
    logDebug
} = Logger;
const {
    getFileListSync,
    copyFileSync,
    mkdirSync,
    fsExistsSync
} = FileUtils;
const { executeTask } = TaskManager;
const { TASK_CRYPTO_INSTALL_PROFILES, TASK_PROJECT_CONFIGURE, PARAMS } = Constants;


export const taskRnvCryptoInstallProfiles = async (c, parentTask, originTask) => {
    logTask('taskRnvCryptoInstallProfiles');

    await executeTask(c, TASK_PROJECT_CONFIGURE, TASK_CRYPTO_INSTALL_PROFILES, originTask);

    if (c.platform !== 'ios') {
        logError(
            `taskRnvCryptoInstallProfiles: platform ${c.platform} not supported`
        );
        return true;
    }

    const ppFolder = path.join(
        c.paths.home.dir,
        'Library/MobileDevice/Provisioning Profiles'
    );

    if (!fsExistsSync(ppFolder)) {
        logWarning(`folder ${ppFolder} does not exist!`);
        mkdirSync(ppFolder);
    }

    const list = getFileListSync(c.paths.workspace.project.dir);
    const mobileprovisionArr = list.filter(v => v.endsWith('.mobileprovision'));

    try {
        mobileprovisionArr.forEach((v) => {
            logDebug(`taskRnvCryptoInstallProfiles: Installing: ${v}`);
            copyFileSync(v, ppFolder);
        });
    } catch (e) {
        logError(e);
    }

    return true;
};

export default {
    description: '',
    fn: taskRnvCryptoInstallProfiles,
    task: TASK_CRYPTO_INSTALL_PROFILES,
    params: PARAMS.withBase(),
    platforms: [],
    skipPlatforms: true,
};
