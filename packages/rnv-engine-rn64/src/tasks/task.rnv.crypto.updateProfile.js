import { TaskManager, Constants, Logger } from 'rnv';

import { updateProfile } from '../sdks/sdk-xcode/fastlane';

const { executeTask } = TaskManager;
const { logTask } = Logger;
const { TASK_CRYPTO_UPDATE_PROFILE, TASK_PROJECT_CONFIGURE, IOS, TVOS, PARAMS } = Constants;


export const taskRnvCryptoUpdateProfile = async (c, parentTask, originTask) => {
    logTask('taskRnvCryptoUpdateProfile');

    await executeTask(c, TASK_PROJECT_CONFIGURE, TASK_CRYPTO_UPDATE_PROFILE, originTask);

    await updateProfile(c);
};

export default {
    description: 'Update provisioning profile',
    fn: taskRnvCryptoUpdateProfile,
    task: TASK_CRYPTO_UPDATE_PROFILE,
    params: PARAMS.withBase(),
    platforms: [IOS, TVOS],
    skipPlatforms: true,
};
