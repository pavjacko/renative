import { TaskManager, Constants, Logger } from 'rnv';

import { updateProfile } from '../sdks/sdk-xcode/fastlane';

const { executeTask, shouldSkipTask } = TaskManager;
const { logTask } = Logger;
const { TASK_CRYPTO_UPDATE_PROFILE, TASK_PROJECT_CONFIGURE, TVOS, PARAMS } = Constants;


export const taskRnvCryptoUpdateProfile = async (c, parentTask, originTask) => {
    logTask('taskRnvCryptoUpdateProfile');

    await executeTask(c, TASK_PROJECT_CONFIGURE, TASK_CRYPTO_UPDATE_PROFILE, originTask);

    if (shouldSkipTask(c, TASK_CRYPTO_UPDATE_PROFILE, originTask)) return true;

    await updateProfile(c);
};

export default {
    description: 'Update provisioning profile',
    fn: taskRnvCryptoUpdateProfile,
    task: TASK_CRYPTO_UPDATE_PROFILE,
    params: PARAMS.withBase(),
    platforms: [TVOS],
    skipPlatforms: true,
};
