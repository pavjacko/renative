import path from 'path';
import { FileUtils, Common } from 'rnv';

const {
    getAppFolder,
    getAppTitle,
    getBuildFilePath,
    getConfigProp,
    sanitizeColor,
    addSystemInjects
} = Common;
const { writeFileSync, writeCleanFile } = FileUtils;

export const parseValuesStringsSync = (c) => {
    const appFolder = getAppFolder(c, c.platform);
    const stringsPath = 'app/src/main/res/values/strings.xml';
    let strings = '<resources>\n';
    strings += `  <string name="app_name">${getAppTitle(
        c,
        c.platform
    )}</string>\n`;
    c.pluginConfigAndroid.resourceStrings.forEach((v) => {
        strings += `  <${v.tag} name="${v.name}">${v.child_value}</${v.tag}>\n`;
    });
    strings += '</resources>';
    writeFileSync(path.join(appFolder, stringsPath), strings);
};

export const parseValuesColorsSync = (c) => {
    const appFolder = getAppFolder(c, c.platform);
    const stringsPath = 'app/src/main/res/values/colors.xml';

    const injects = [
        {
            pattern: '{{PLUGIN_COLORS_BG}}',
            override: sanitizeColor(
                getConfigProp(c, c.platform, 'backgroundColor'),
                'backgroundColor'
            ).hex
        }
    ];

    addSystemInjects(c, injects);

    writeCleanFile(
        getBuildFilePath(c, c.platform, stringsPath),
        path.join(appFolder, stringsPath),
        injects, null, c
    );
};

export const injectPluginXmlValuesSync = (c, plugin) => {
    const rStrings = plugin.ResourceStrings?.children;
    if (rStrings) {
        rStrings.forEach((obj) => {
            c.pluginConfigAndroid.resourceStrings.push(obj);
        });
    }
};
