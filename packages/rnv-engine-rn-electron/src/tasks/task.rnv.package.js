import { TaskManager, Constants, Logger } from 'rnv';

const { logTask } = Logger;
const { MACOS, WINDOWS, TASK_PACKAGE, TASK_CONFIGURE, PARAMS } = Constants;
const { executeOrSkipTask } = TaskManager;

export const taskRnvPackage = async (c, parentTask, originTask) => {
    logTask('taskRnvPackage', `parent:${parentTask}`);

    await executeOrSkipTask(c, TASK_CONFIGURE, TASK_PACKAGE, originTask);

    // macOS does not require packaging
    return true;
};

export default {
    description: 'Package source files into bundle',
    fn: taskRnvPackage,
    task: TASK_PACKAGE,
    params: PARAMS.withBase(PARAMS.withConfigure()),
    platforms: [
        MACOS,
        WINDOWS,
    ],
};
