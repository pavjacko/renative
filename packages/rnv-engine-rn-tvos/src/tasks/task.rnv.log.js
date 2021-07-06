import { TaskManager, Constants, Logger, PlatformManager, SDKManager } from 'rnv';

import { runAppleLog } from '../sdks/sdk-xcode';

const { checkAndConfigureSdks } = SDKManager;

const { logErrorPlatform } = PlatformManager;

const { logTask } = Logger;
const {
    PARAMS,
    TVOS,
    TASK_WORKSPACE_CONFIGURE, TASK_PROJECT_CONFIGURE
} = Constants;
const { executeTask } = TaskManager;

export const taskRnvLog = async (c, parentTask, originTask) => {
    logTask('taskRnvLog', `parent:${parentTask}`);

    await executeTask(c, TASK_WORKSPACE_CONFIGURE, TASK_PROJECT_CONFIGURE, originTask);

    // await checkSdk(c);
    await checkAndConfigureSdks(c);

    switch (c.platform) {
        case TVOS:
            return runAppleLog(c);
        default:
            return logErrorPlatform(c);
    }
};

export default {
    description: 'Attach logger to device or emulator and print out logs',
    fn: taskRnvLog,
    task: 'log',
    params: PARAMS.withBase(),
    platforms: [TVOS],
    isGlobalScope: true
};
