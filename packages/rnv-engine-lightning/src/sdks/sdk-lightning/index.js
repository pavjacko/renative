
import path from 'path';
import { Common, Constants, EngineManager, Exec, FileUtils, Logger, PlatformManager, ProjectManager, SDKManager } from 'rnv';
import semver from 'semver';

const { TIZEN, CLI_TIZEN, CLI_WEBOS_ARES_PACKAGE } = Constants;
const { isPlatformActive } = PlatformManager;
const { chalk, logTask, logSuccess } = Logger;
const { executeAsync, execCLI } = Exec;
const {
    getPlatformBuildDir, getConfigProp, addSystemInjects, getAppVersion, getPlatformProjectDir, getAppTitle, getAppId, getAppDescription
} = Common;
const { generateEnvVars } = EngineManager;
const { copyAssetsFolder, copyBuildsFolder } = ProjectManager;
const { writeCleanFile } = FileUtils;

const { runTizenSimOrDevice, DEFAULT_SECURITY_PROFILE_NAME } = SDKManager.Tizen;
const { runWebosSimOrDevice } = SDKManager.Webos;

export const runLightningProject = async (c, target) => {
    logTask('runLightningProject', `target:${target}`);
    const entryFile = getConfigProp(c, c.platform, 'entryFile');
    const { platform } = c;
    const { hosted } = c.program;
    const isHosted = hosted && !getConfigProp(c, platform, 'bundleAssets');

    if (isHosted) {
        await executeAsync(c, 'lng dev', {
            stdio: 'inherit',
            silent: false,
            env: {
                LNG_BUILD_FOLDER: getPlatformBuildDir(c, true),
                LNG_ENTRY_FILE: entryFile,
                LNG_SERVE_PORT: c.runtime.currentPlatform?.defaultPort,
                ...generateEnvVars(c)
            }
        });
    } else {
        await buildLightningProject(c);
        if (platform === TIZEN) {
            await runTizenSimOrDevice(c);
        } else {
            await runWebosSimOrDevice(c);
        }
    }

    return true;
};

export const buildLightningProject = async (c) => {
    logTask('buildLightningProject');

    const { platform } = c;
    const platformConfig = c.buildConfig.platforms[platform];

    const entryFile = getConfigProp(c, c.platform, 'entryFile');
    const target = getConfigProp(c, platform, 'target', 'es6');
    const tBuild = getPlatformProjectDir(c);

    const tOut = path.join(tBuild, 'output');
    const certProfile = platformConfig.certificateProfile ?? DEFAULT_SECURITY_PROFILE_NAME;

    await executeAsync(c, `lng dist --${target}`, {
        stdio: 'inherit',
        silent: false,
        env: {
            LNG_DIST_FOLDER: getPlatformBuildDir(c, true),
            LNG_ENTRY_FILE: entryFile,
            ...generateEnvVars(c),
        }
    });

    if (platform === TIZEN) {
        await execCLI(
            c,
            CLI_TIZEN,
            `package -- ${tBuild} -s ${certProfile} -t wgt -o ${tOut}`
        );

        logSuccess(
            `Your WGT package is located in ${chalk().cyan(tOut)} .`
        );
    } else {
        await execCLI(c, CLI_WEBOS_ARES_PACKAGE, `-o ${tOut} ${tBuild} -n`);

        logSuccess(
            `Your IPK package is located in ${chalk().cyan(tOut)} .`
        );
    }

    return true;
};

export const configureLightningProject = async (c) => {
    logTask('configureLightningProject');
    const { platform } = c;
    c.runtime.platformBuildsProjectPath = `${getPlatformBuildDir(c)}`;
    if (!isPlatformActive(c, platform)) {
        return;
    }
    await copyAssetsFolder(c, platform);
    await _configureProject(c);
    return copyBuildsFolder(c, platform);
};

const _configureProject = c => new Promise((resolve) => {
    logTask('_configureProject');
    const { platform } = c;
    const p = c.buildConfig.platforms[platform];

    const injects = platform === TIZEN ? [
        { pattern: '{{PACKAGE}}', override: p.package },
        { pattern: '{{ID}}', override: p.id },
        { pattern: '{{APP_NAME}}', override: p.appName },
        { pattern: '{{APP_VERSION}}', override: semver.coerce(getAppVersion(c, platform)) }
    ] : [
        { pattern: '{{APPLICATION_ID}}', override: getAppId(c, platform).toLowerCase() },
        { pattern: '{{APP_TITLE}}', override: getAppTitle(c, platform) },
        { pattern: '{{APP_VERSION}}', override: semver.coerce(getAppVersion(c, platform)) },
        { pattern: '{{APP_DESCRIPTION}}', override: getAppDescription(c, platform) },
        { pattern: '{{APP_BG_COLOR}}', override: getConfigProp(c, platform, 'bgColor', '#fff') },
        { pattern: '{{APP_ICON_COLOR}}', override: getConfigProp(c, platform, 'iconColor', '#000') },
        { pattern: '{{APP_VENDOR}}', override: getConfigProp(c, platform, 'vendor', 'Pavel Jacko') }
    ];

    addSystemInjects(c, injects);

    const configFile = platform === TIZEN ? 'config.xml' : 'appinfo.json';
    const file = path.join(getPlatformProjectDir(c), configFile);
    writeCleanFile(
        file,
        file,
        injects, null, c
    );

    resolve();
});
