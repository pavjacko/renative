import path from 'path';
import { Exec, Logger, PluginManager, FileUtils, Resolver, Common } from 'rnv';

import compareVersions from 'compare-versions';

const {
    getAppFolder,
    getAppTemplateFolder,
    getConfigProp,
    getFlavouredProp,
    addSystemInjects
} = Common;
const { logTask, logWarning } = Logger;
const { parsePlugins, overrideFileContents } = PluginManager;
const { doResolve, doResolvePath } = Resolver;
const { executeAsync } = Exec;
const { writeCleanFile } = FileUtils;

export const parsePodFile = async (c, platform) => {
    logTask('parsePodFile');

    const appFolder = getAppFolder(c);
    let pluginInject = '';

    // PLUGINS
    c.pluginConfigiOS.podfileInject = '';
    parsePlugins(c, platform, (plugin, pluginPlat, key) => {
        const podName = getFlavouredProp(c, pluginPlat, 'podName');
        if (podName) {
            pluginInject += _injectPod(podName, pluginPlat, plugin, key);
        }
        const podNames = getFlavouredProp(c, pluginPlat, 'podNames');
        if (podNames) {
            podNames.forEach((v) => {
                pluginInject += _injectPod(v, pluginPlat, plugin, key);
            });
        }
        const podDependencies = getFlavouredProp(c, pluginPlat, 'podDependencies');
        if (podDependencies) {
            podDependencies.forEach((v) => {
                pluginInject += `  pod ${v}\n`;
            });
        }
        const isStatic = getFlavouredProp(c, pluginPlat, 'isStatic');
        if (isStatic === true) {
            if (!c.pluginConfigiOS.staticFrameworks.includes(podName)) {
                c.pluginConfigiOS.staticFrameworks.push(`'${podName}'`);
            }
        }
        const staticPods = getFlavouredProp(c, pluginPlat, 'staticPods');
        if (staticPods?.forEach) {
            staticPods.forEach((sPod) => {
                if (sPod.startsWith('::startsWith::')) {
                    c.pluginConfigiOS.staticPodExtraConditions += ` || pod.name.start_with?('${sPod.replace('::startsWith::', '')}')`;
                }
            });
        }

        const reactSubSpecs = getFlavouredProp(c, pluginPlat, 'reactSubSpecs');
        if (reactSubSpecs) {
            logWarning(
                'reactSubSpecs prop is deprecated. You can safely remove it'
            );
        }

        const podfile = getFlavouredProp(c, pluginPlat, 'Podfile');
        if (podfile) {
            const { injectLines, post_install } = podfile;
            // INJECT LINES
            if (injectLines) {
                injectLines.forEach((v) => {
                    c.pluginConfigiOS.podfileInject += `${v}\n`;
                });
            }

            if (post_install) {
                post_install.forEach((v) => {
                    c.pluginConfigiOS.podPostInstall += `${v}\n`;
                });
            }
        }
    });

    // WARNINGS
    const ignoreWarnings = getConfigProp(c, platform, 'ignoreWarnings');
    const podWarnings = ignoreWarnings ? 'inhibit_all_warnings!' : '';

    // SOURCES
    c.pluginConfigiOS.podfileSources = '';
    const podfileObj = getFlavouredProp(
        c,
        c.buildConfig?.platforms?.[platform],
        'Podfile'
    );
    const podfileSources = podfileObj?.sources;
    if (podfileSources && podfileSources.length) {
        podfileSources.forEach((v) => {
            c.pluginConfigiOS.podfileSources += `source '${v}'\n`;
        });
    }


    // DEPLOYMENT TARGET
    const deploymentTarget = getConfigProp(
        c,
        platform,
        'deploymentTarget',
        '12.0'
    );
    c.pluginConfigiOS.deploymentTarget = deploymentTarget;

    // STATIC POD INJECT VERSION
    c.pluginConfigiOS.staticPodDefinition = 'Pod::BuildType.static_library';
    try {
        const podVersion = await executeAsync(c, 'pod --version');
        const isPodOld = compareVersions(podVersion, '1.9') < 0;
        if (isPodOld) {
            c.pluginConfigiOS.staticPodDefinition = 'Pod::Target::BuildType.static_library';
        }
    } catch (e) {
        // Ignore
    }

    const injects = [
        { pattern: '{{PLUGIN_PATHS}}', override: pluginInject },
        { pattern: '{{PLUGIN_WARNINGS}}', override: podWarnings },
        {
            pattern: '{{PLUGIN_PODFILE_INJECT}}',
            override: c.pluginConfigiOS.podfileInject
        },
        {
            pattern: '{{INJECT_POST_INSTALL}}',
            override: c.pluginConfigiOS.podPostInstall
        },
        {
            pattern: '{{PLUGIN_PODFILE_SOURCES}}',
            override: c.pluginConfigiOS.podfileSources
        },
        {
            pattern: '{{PLUGIN_DEPLOYMENT_TARGET}}',
            override: c.pluginConfigiOS.deploymentTarget
        },
        {
            pattern: '{{PLUGIN_STATIC_FRAMEWORKS}}',
            override: c.pluginConfigiOS.staticFrameworks.join(',')
        },
        {
            pattern: '{{PATH_JSC_ANDROID}}',
            override: doResolve('jsc-android')
        },
        {
            pattern: '{{PATH_REACT_NATIVE}}',
            override: doResolve('react-native-tvos')
        },
        {
            pattern: '{{PLUGIN_STATIC_POD_DEFINITION}}',
            override: c.pluginConfigiOS.staticPodDefinition
        },
        {
            pattern: '{{PLUGIN_STATIC_POD_EXTRA_CONDITIONS}}',
            override: c.pluginConfigiOS.staticPodExtraConditions
        }
    ];

    addSystemInjects(c, injects);

    writeCleanFile(
        path.join(getAppTemplateFolder(c, platform), 'Podfile'),
        path.join(appFolder, 'Podfile'),
        injects, null, c
    );
    return true;
};

const REACT_CORE_OVERRIDES = {
    "s.dependency 'React'": "s.dependency 'React-Core'",
    's.dependency "React"': 's.dependency "React-Core"'
};

const _injectPod = (podName, pluginPlat, plugin, key) => {
    let pluginInject = '';
    const isNpm = plugin['no-npm'] !== true;
    if (isNpm) {
        const podPath = doResolvePath(pluginPlat.path ?? key);
        pluginInject += `  pod '${podName}', :path => '${podPath}'\n`;
        const podspecPath = `${podPath}/${podName}.podspec`;
        // Xcode 12 Migration
        overrideFileContents(podspecPath, REACT_CORE_OVERRIDES);
    } else if (pluginPlat.git) {
        const commit = pluginPlat.commit
            ? `, :commit => '${pluginPlat.commit}'`
            : '';
        pluginInject += `  pod '${podName}', :git => '${
            pluginPlat.git
        }'${commit}\n`;
    } else if (pluginPlat.version) {
        pluginInject += `  pod '${podName}', '${pluginPlat.version}'\n`;
    } else {
        pluginInject += `  pod '${podName}'\n`;
    }

    return pluginInject;
};
