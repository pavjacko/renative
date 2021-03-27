import path from 'path';
import { FileUtils, Logger, Common } from 'rnv';

const {
    getAppFolder,
    getAppId,
    getBuildFilePath,
    getEntryFile,
    getGetJsBundleFile,
    getConfigProp,
    getIP,
    addSystemInjects
} = Common;
const { logWarning } = Logger;
const { writeCleanFile } = FileUtils;

const JS_BUNDLE_DEFAULTS = {
    // CRAPPY BUT Android Wear does not support webview required for connecting to packager
    androidwear: '"assets://index.androidwear.bundle"'
};

export const parseMainApplicationSync = (c) => {
    const appFolder = getAppFolder(c);
    const { platform } = c;
    const applicationPath = 'app/src/main/java/rnv/MainApplication.kt';
    const bundleAssets = getConfigProp(c, platform, 'bundleAssets');
    const bundleFile = getGetJsBundleFile(c, platform) || bundleAssets
        ? '"assets://index.android.bundle"'
        : JS_BUNDLE_DEFAULTS[platform] || '"super.getJSBundleFile()"';
    const bundlerIp = getIP() || '10.0.2.2';
    if (!bundleAssets) {
        c.pluginConfigAndroid.pluginApplicationDebugServer
            += '    var mPreferences: SharedPreferences = PreferenceManager.getDefaultSharedPreferences(this)\n';
        c.pluginConfigAndroid.pluginApplicationDebugServer
        += `    mPreferences?.edit().putString("debug_http_host", "${bundlerIp}:${c.runtime.port}").apply()\n`;
    }

    const injects = [
        { pattern: '{{APPLICATION_ID}}', override: getAppId(c, platform) },
        { pattern: '{{ENTRY_FILE}}', override: getEntryFile(c, platform) },
        { pattern: '{{GET_JS_BUNDLE_FILE}}', override: bundleFile },
        {
            pattern: '{{PLUGIN_IMPORTS}}',
            override: c.pluginConfigAndroid.pluginApplicationImports
        },
        {
            pattern: '{{PLUGIN_PACKAGES}}',
            override: c.pluginConfigAndroid.pluginPackages
        },
        {
            pattern: '{{PLUGIN_METHODS}}',
            override: c.pluginConfigAndroid.pluginApplicationMethods
        },
        {
            pattern: '{{PLUGIN_ON_CREATE}}',
            override: c.pluginConfigAndroid.pluginApplicationCreateMethods
        },
        {
            pattern: '{{PLUGIN_DEBUG_SERVER}}',
            override: c.pluginConfigAndroid.pluginApplicationDebugServer
        }
    ];

    addSystemInjects(c, injects);

    writeCleanFile(
        getBuildFilePath(c, platform, applicationPath),
        path.join(appFolder, applicationPath),
        injects, null, c
    );
};

export const parseMainActivitySync = (c) => {
    const appFolder = getAppFolder(c);
    const { platform } = c;
    const activityPath = 'app/src/main/java/rnv/MainActivity.kt';


    const mainActivity = getConfigProp(c, platform, 'mainActivity', {});

    c.pluginConfigAndroid.injectActivityOnCreate = mainActivity.onCreate || 'super.onCreate(savedInstanceState)';


    const injects = [
        { pattern: '{{APPLICATION_ID}}', override: getAppId(c, platform) },
        {
            pattern: '{{PLUGIN_ACTIVITY_IMPORTS}}',
            override: c.pluginConfigAndroid.pluginActivityImports
        },
        {
            pattern: '{{PLUGIN_ACTIVITY_METHODS}}',
            override: c.pluginConfigAndroid.pluginActivityMethods
        },
        {
            pattern: '{{PLUGIN_ON_CREATE}}',
            override: c.pluginConfigAndroid.pluginActivityCreateMethods
        },
        {
            pattern: '{{INJECT_ON_CREATE}}',
            override: c.pluginConfigAndroid.injectActivityOnCreate
        },
        {
            pattern: '{{PLUGIN_ON_ACTIVITY_RESULT}}',
            override: c.pluginConfigAndroid.pluginActivityResultMethods
        }
    ];

    addSystemInjects(c, injects);

    writeCleanFile(
        getBuildFilePath(c, platform, activityPath),
        path.join(appFolder, activityPath),
        injects, null, c
    );
};

export const parseSplashActivitySync = (c) => {
    const appFolder = getAppFolder(c);
    const { platform } = c;
    const splashPath = 'app/src/main/java/rnv/SplashActivity.kt';

    // TODO This is temporary ANDROIDX support. whole kotlin parser will be refactored in the near future
    const enableAndroidX = getConfigProp(c, platform, 'enableAndroidX', true);
    if (enableAndroidX === true) {
        c.pluginConfigAndroid.pluginSplashActivityImports
            += 'import androidx.appcompat.app.AppCompatActivity\n';
    } else {
        c.pluginConfigAndroid.pluginSplashActivityImports
            += 'import android.support.v7.app.AppCompatActivity\n';
    }

    const injects = [
        { pattern: '{{APPLICATION_ID}}', override: getAppId(c, platform) },
        {
            pattern: '{{PLUGIN_SPLASH_ACTIVITY_IMPORTS}}',
            override: c.pluginConfigAndroid.pluginSplashActivityImports
        }
    ];

    addSystemInjects(c, injects);

    writeCleanFile(
        getBuildFilePath(c, platform, splashPath),
        path.join(appFolder, splashPath),
        injects, null, c
    );
};

export const injectPluginKotlinSync = (c, plugin, key, pkg) => {
    if (plugin.activityImports instanceof Array) {
        plugin.activityImports.forEach((activityImport) => {
            // Avoid duplicate imports
            if (
                c.pluginConfigAndroid.pluginActivityImports.indexOf(
                    activityImport
                ) === -1
            ) {
                c.pluginConfigAndroid.pluginActivityImports += `import ${activityImport}\n`;
            }
        });
    }

    if (plugin.activityMethods instanceof Array) {
        c.pluginConfigAndroid.pluginActivityMethods += '\n';
        c.pluginConfigAndroid.pluginActivityMethods += `${plugin.activityMethods.join(
            '\n    '
        )}`;
    }

    const { mainActivity } = plugin;
    if (mainActivity) {
        if (mainActivity.createMethods instanceof Array) {
            c.pluginConfigAndroid.pluginActivityCreateMethods += '\n';
            c.pluginConfigAndroid.pluginActivityCreateMethods += `${mainActivity.createMethods.join(
                '\n    '
            )}`;
        }

        if (mainActivity.resultMethods instanceof Array) {
            c.pluginConfigAndroid.pluginActivityResultMethods += '\n';
            c.pluginConfigAndroid.pluginActivityResultMethods += `${mainActivity.resultMethods.join(
                '\n    '
            )}`;
        }

        if (mainActivity.imports instanceof Array) {
            mainActivity.imports.forEach((v) => {
                c.pluginConfigAndroid.pluginActivityImports += `import ${v}\n`;
            });
        }

        if (mainActivity.methods instanceof Array) {
            c.pluginConfigAndroid.pluginActivityMethods += '\n';
            c.pluginConfigAndroid.pluginActivityMethods += `${mainActivity.methods.join(
                '\n    '
            )}`;
        }
    }

    if (plugin.imports) {
        plugin.imports.forEach((v) => {
            c.pluginConfigAndroid.pluginApplicationImports += `import ${v}\n`;
        });
    }

    _injectPackage(c, plugin, pkg);

    if (plugin.MainApplication) {
        if (plugin.MainApplication.packages) {
            plugin.MainApplication.packages.forEach((v) => {
                _injectPackage(c, plugin, v);
            });
        }
    }

    const { mainApplication } = plugin;
    if (mainApplication) {
        if (mainApplication.createMethods instanceof Array) {
            c.pluginConfigAndroid.pluginApplicationCreateMethods += '\n';
            c.pluginConfigAndroid.pluginApplicationCreateMethods += `${mainApplication.createMethods.join(
                '\n    '
            )}`;
        }

        if (mainApplication.imports instanceof Array) {
            mainApplication.imports.forEach((v) => {
                c.pluginConfigAndroid.pluginApplicationImports += `import ${v}\n`;
            });
        }

        if (mainApplication.methods instanceof Array) {
            c.pluginConfigAndroid.pluginApplicationMethods += '\n';
            c.pluginConfigAndroid.pluginApplicationMethods += `${mainApplication.methods.join(
                '\n    '
            )}`;
        }
    }

    if (plugin.mainApplicationMethods) {
        logWarning(
            `Plugin ${key} in ${c.paths.project.config} is using DEPRECATED "${
                c.platform
            }": { MainApplicationMethods }. Use "${
                c.platform
            }": { "mainApplication": { "methods": []}} instead`
        );
        c.pluginConfigAndroid.pluginApplicationMethods += `\n${plugin.mainApplicationMethods}\n`;
    }
};

const _injectPackage = (c, plugin, pkg) => {
    if (pkg) { c.pluginConfigAndroid.pluginApplicationImports += `import ${pkg}\n`; }
    let packageParams = '';
    if (plugin.packageParams) {
        packageParams = plugin.packageParams.join(',');
    }

    const className = _extractClassName(pkg);
    if (className) { c.pluginConfigAndroid.pluginPackages += `${className}(${packageParams}),\n`; }
};

const _extractClassName = pkg => (pkg ? pkg.split('.').pop() : null);
