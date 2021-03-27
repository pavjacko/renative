import path from 'path';
import { FileUtils, Logger, Common } from 'rnv';

const {
    getAppFolder,
    getBuildFilePath,
    getConfigProp,
    addSystemInjects
} = Common;
const { writeCleanFile } = FileUtils;
const { logTask } = Logger;


export const parseGradleWrapperSync = (c) => {
    logTask('parseGradleWrapperSync');

    const appFolder = getAppFolder(c);
    const { platform } = c;

    c.pluginConfigAndroid.gradleWrapperVersion = getConfigProp(
        c,
        platform,
        'gradleWrapperVersion',
        '5.5'
    );
    const injects = [
        {
            pattern: '{{INJECT_GRADLE_WRAPPER_VERSION}}',
            override: c.pluginConfigAndroid.gradleWrapperVersion
        }
    ];
    addSystemInjects(c, injects);

    writeCleanFile(
        getBuildFilePath(c, platform, 'gradle/wrapper/gradle-wrapper.properties'),
        path.join(appFolder, 'gradle/wrapper/gradle-wrapper.properties'),
        injects, null, c
    );
};
