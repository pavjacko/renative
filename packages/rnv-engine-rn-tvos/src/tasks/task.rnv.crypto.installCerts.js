import { TaskManager, Constants, Logger, Exec, FileUtils } from 'rnv';

const {
    logWarning,
    logError,
    logTask
} = Logger;
const { getFileListSync } = FileUtils;
const { executeAsync } = Exec;
const { executeTask, shouldSkipTask } = TaskManager;
const { TASK_CRYPTO_INSTALL_CERTS, TASK_PROJECT_CONFIGURE, PARAMS } = Constants;


export const taskRnvCryptoInstallCerts = async (c, parentTask, originTask) => {
    logTask('taskRnvCryptoInstallCerts');

    await executeTask(c, TASK_PROJECT_CONFIGURE, TASK_CRYPTO_INSTALL_CERTS, originTask);

    if (shouldSkipTask(c, TASK_CRYPTO_INSTALL_CERTS, originTask)) return true;

    if (c.platform !== 'tvos') {
        logError(`_installTempCerts: platform ${c.platform} not supported`);
        return true;
    }
    const kChain = c.program.keychain || 'ios-build.keychain';

    const list = getFileListSync(c.paths.workspace.project.dir);
    const cerArr = list.filter(v => v.endsWith('.cer'));

    try {
        Promise.all(
            cerArr.map(v => executeAsync(c, `security import ${v} -k ${kChain} -A`))
        );
    } catch (e) {
        logWarning(e);
        return true;
    }
};

export default {
    description: '',
    fn: taskRnvCryptoInstallCerts,
    task: TASK_CRYPTO_INSTALL_CERTS,
    params: PARAMS.withBase(),
    platforms: [],
    skipPlatforms: true,
};
