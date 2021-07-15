import { Constants, Logger, PlatformManager, TaskManager } from 'rnv';
import { SDKLightning } from '../sdks';

const { logErrorPlatform } = PlatformManager;
const { logTask } = Logger;
const {
    TIZEN,
    WEBOS,
    TASK_PLATFORM_CONFIGURE, TASK_CONFIGURE,
    PARAMS
} = Constants;
const { configureLightningProject } = SDKLightning;
const { executeTask } = TaskManager;

export const taskRnvConfigure = async (c, parentTask, originTask) => {
    logTask('taskRnvConfigure');

    await executeTask(c, TASK_PLATFORM_CONFIGURE, TASK_CONFIGURE, originTask);


    if (c.program.only && !!parentTask) {
        return true;
    }

    switch (c.platform) {
        case TIZEN:
        case WEBOS:
            return configureLightningProject(c);
        default:
            return logErrorPlatform(c);
    }
};

export default {
    description: 'Configure current project',
    fn: taskRnvConfigure,
    task: 'configure',
    params: PARAMS.withBase(PARAMS.withConfigure()),
    platforms: [
        TIZEN, WEBOS
    ],
};
