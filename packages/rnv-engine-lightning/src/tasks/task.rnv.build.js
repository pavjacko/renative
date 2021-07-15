import { Constants, Logger, PlatformManager, TaskManager } from 'rnv';
import { SDKLightning } from '../sdks';

const { logErrorPlatform } = PlatformManager;
const { logTask } = Logger;
const {
    TIZEN,
    WEBOS,
    TASK_BUILD,
    TASK_CONFIGURE,
    PARAMS
} = Constants;
const { buildLightningProject } = SDKLightning;
const { executeOrSkipTask, shouldSkipTask } = TaskManager;

export const taskRnvBuild = async (c, parentTask, originTask) => {
    logTask('taskRnvBuild', `parent:${parentTask}`);
    const { platform } = c;
    c.runtime.forceBundleAssets = true;

    await executeOrSkipTask(c, TASK_CONFIGURE, TASK_BUILD, originTask);

    if (shouldSkipTask(c, TASK_BUILD, originTask)) return true;

    switch (platform) {
        case TIZEN:
        case WEBOS:
            await buildLightningProject(c);
            return;
        default:
            logErrorPlatform(c);
    }
};

export default {
    description: 'Build project binary',
    fn: taskRnvBuild,
    task: TASK_BUILD,
    params: PARAMS.withBase(PARAMS.withConfigure()),
    platforms: [
        TIZEN,
        WEBOS,
    ],
};
