import { TaskManager, EngineManager, Constants, Logger, PlatformManager, Exec, Common, Resolver } from 'rnv';
import { isBundlerActive } from '../commonEngine';

const { getEntryFile, confirmActiveBundler } = Common;
const { doResolve } = Resolver;
const { logErrorPlatform } = PlatformManager;
const { generateEnvVars } = EngineManager;
const { executeTask } = TaskManager;
const { chalk, logTask, logError, logRaw, logInfo } = Logger;
const {
    IOS,
    TVOS,
    ANDROID,
    ANDROID_TV,
    FIRE_TV,
    ANDROID_WEAR,
    TASK_START,
    TASK_CONFIGURE_SOFT,
    PARAMS
} = Constants;
const { executeAsync } = Exec;


const BUNDLER_PLATFORMS = {};

BUNDLER_PLATFORMS[IOS] = IOS;
BUNDLER_PLATFORMS[TVOS] = IOS;
BUNDLER_PLATFORMS[ANDROID] = ANDROID;
BUNDLER_PLATFORMS[ANDROID_TV] = ANDROID;
BUNDLER_PLATFORMS[FIRE_TV] = ANDROID;
BUNDLER_PLATFORMS[ANDROID_WEAR] = ANDROID;

export const taskRnvStart = async (c, parentTask, originTask) => {
    const { platform } = c;
    const { hosted } = c.program;

    logTask('taskRnvStart', `parent:${parentTask} port:${c.runtime.port} hosted:${!!hosted}`);

    if (hosted) {
        return logError(
            'This platform does not support hosted mode',
            true
        );
    }
    // Disable reset for other commands (ie. cleaning platforms)
    c.runtime.disableReset = true;
    if (!parentTask) {
        await executeTask(c, TASK_CONFIGURE_SOFT, TASK_START, originTask);
    }


    switch (platform) {
        case IOS:
        case TVOS:
        case ANDROID:
        case ANDROID_TV:
        case FIRE_TV:
        case ANDROID_WEAR: {
            let startCmd = `node ${doResolve(
                'react-native'
            )}/local-cli/cli.js start --port ${
                c.runtime.port
            } --config=metro.config.js`;

            if (c.program.resetHard) {
                startCmd += ' --reset-cache';
            } else if (c.program.reset) {
                startCmd += ' --reset-cache';
            }
            if (c.program.resetHard || c.program.reset) {
                logInfo(
                    `You passed ${chalk().white('-r')} argument. --reset-cache will be applied to react-native`
                );
            }
            // logSummary('BUNDLER STARTED');
            const url = chalk().cyan(`http://${c.runtime.localhost}:${c.runtime.port}/${
                getEntryFile(c, c.platform)}.bundle?platform=${BUNDLER_PLATFORMS[platform]}`);
            logRaw(`

Dev server running at: ${url}

`);
            if (!parentTask) {
                const isRunning = await isBundlerActive(c);
                const resetCompleted = await confirmActiveBundler(c);
                if (!isRunning || (isRunning && resetCompleted)) {
                    return executeAsync(c, startCmd, { stdio: 'inherit', silent: true, env: { ...generateEnvVars(c) } });
                }

                if (resetCompleted) {
                    return executeAsync(c, startCmd, { stdio: 'inherit', silent: true, env: { ...generateEnvVars(c) } });
                }

                return true;
            }
            executeAsync(c, startCmd, { stdio: 'inherit', silent: true, env: { ...generateEnvVars(c) } });
            return true;
        }
        default:

            return logErrorPlatform(c);
    }
};

export default {
    description: 'Starts bundler / server',
    fn: taskRnvStart,
    task: 'start',
    params: PARAMS.withBase(PARAMS.withConfigure()),
    platforms: [
        IOS,
        TVOS,
        ANDROID,
        ANDROID_TV,
        FIRE_TV,
        ANDROID_WEAR,
    ],
};
