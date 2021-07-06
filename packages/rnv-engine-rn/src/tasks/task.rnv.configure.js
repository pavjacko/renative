import { TaskManager, Constants, Logger, PlatformManager, NPMUtils, TemplateManager } from 'rnv';
import { configureMetroConfigs } from '../commonEngine';
import { SDKAndroid, SDKXcode } from '../sdks';

const { logErrorPlatform } = PlatformManager;
const { logTask } = Logger;
const { jetifyIfRequired } = NPMUtils;
const {
    IOS,
    ANDROID,
    ANDROID_TV,
    FIRE_TV,
    ANDROID_WEAR,
    TASK_PLATFORM_CONFIGURE,
    TASK_CONFIGURE,
    PARAMS
} = Constants;
const { configureXcodeProject } = SDKXcode;
const { configureGradleProject } = SDKAndroid;
const { executeTask, shouldSkipTask } = TaskManager;
const { configureEntryPoint } = TemplateManager;

export const taskRnvConfigure = async (c, parentTask, originTask) => {
    logTask('taskRnvConfigure');

    await configureMetroConfigs(c);

    await executeTask(c, TASK_PLATFORM_CONFIGURE, TASK_CONFIGURE, originTask);
    if (shouldSkipTask(c, TASK_CONFIGURE, originTask)) return true;

    await configureEntryPoint(c, c.platform);

    if (c.program.only && !!parentTask) {
        return true;
    }

    switch (c.platform) {
        case IOS:
            await configureXcodeProject(c);
            return true;
        case ANDROID:
        case ANDROID_TV:
        case FIRE_TV:
        case ANDROID_WEAR:
            await configureGradleProject(c);
            await jetifyIfRequired(c);
            return true;
        default:
            await logErrorPlatform(c);
            return true;
    }
};

export default {
    description: 'Configure current project',
    fn: taskRnvConfigure,
    task: 'configure',
    params: PARAMS.withBase(PARAMS.withConfigure()),
    platforms: [
        IOS,
        ANDROID,
        ANDROID_TV,
        FIRE_TV,
        ANDROID_WEAR,
    ],
};
