import path from 'path';
import { FileUtils, Common, Logger, PluginManager } from 'rnv';

const {
    getAppFolder,
    getAppId,
    getBuildFilePath,
    getConfigProp,
    getFlavouredProp,
    addSystemInjects,
    getConfigPropArray
} = Common;
const { logTask, logError, logWarning, logDebug } = Logger;
const { readObjectSync, writeCleanFile } = FileUtils;
const { parsePlugins } = PluginManager;

const PROHIBITED_DUPLICATE_TAGS = ['intent-filter'];
const SYSTEM_TAGS = ['tag', 'children'];

const _findChildNode = (tag, name, node) => {
    if (!node) {
        logWarning('_findChildNode: Node is undefined');
        return;
    }
    if (!name && !PROHIBITED_DUPLICATE_TAGS.includes(tag)) return null; // Can't determine reused child nodes without unique name identifier
    for (let i = 0; i < node.children.length; i++) {
        const ch = node.children[i];
        if (ch.tag === tag) {
            if (
                ch['android:name'] === name
                || PROHIBITED_DUPLICATE_TAGS.includes(tag)
            ) { return ch; }
        }
    }
    return null;
};

const _convertToXML = manifestObj => _parseNode(manifestObj, 0);

const _parseNode = (n, level) => {
    let output = '';
    let space = '';
    for (let i = 0; i < level; i++) {
        space += '    ';
    }

    let nodeKeysCount = 0;
    Object.keys(n).forEach((v) => {
        if (!SYSTEM_TAGS.includes(v)) nodeKeysCount++;
    });
    const isSingleLine = nodeKeysCount < 2;

    if (!n.tag) {
        logWarning('Each node must have tag key!');
        return;
    }

    if (n) {
        const endLine = isSingleLine ? ' ' : '\n';
        output += `${space}<${n.tag}${endLine}`;
        Object.keys(n).forEach((k) => {
            if (!SYSTEM_TAGS.includes(k)) {
                output += `${isSingleLine ? '' : `${space}  `}${k}="${
                    n[k]
                }"${endLine}`;
            }
        });
    } else {
        output += `${space}<${n.tag}`;
    }
    if (n.children && n.children.length) {
        if (isSingleLine) {
            output += '>\n';
        } else {
            output += `${space}>\n`;
        }

        const nextLevel = level + 1;
        n.children.forEach((v) => {
            output += _parseNode(v, nextLevel);
        });
        output += `${space}</${n.tag}>\n`;
    } else {
        output += `${isSingleLine ? '' : space}/>\n`;
    }
    return output;
};

const _mergeNodeParameters = (node, nodeParamsExt) => {
    if (!nodeParamsExt) {
        logWarning('_mergeNodeParameters: nodeParamsExt value is null');
        return;
    }
    if (!node) {
        logWarning('_mergeNodeParameters: node value is null');
        return;
    }

    Object.keys(nodeParamsExt).forEach((k) => {
        if (!SYSTEM_TAGS.includes(k)) node[k] = nodeParamsExt[k];
    });
};

const _mergeNodeChildren = (node, nodeChildrenExt = []) => {
    // console.log('_mergeNodeChildren', node, 'OVERRIDE', nodeChildrenExt);
    if (!node) {
        logWarning('_mergeNodeChildren: Node is undefined');
        return;
    }
    if (!node.children) node.children = [];
    nodeChildrenExt.forEach((v) => {
        const nameExt = v['android:name'];
        if (v.tag) {
            const childNode = _findChildNode(v.tag, nameExt, node);
            if (childNode) {
                logDebug(
                    `_mergeNodeChildren: FOUND EXISTING NODE TO MERGE ${nameExt} ${v.tag}`
                );
                _mergeNodeParameters(childNode, v);
                _mergeNodeChildren(childNode, v.children);
            } else {
                logDebug(
                    `_mergeNodeChildren: NO android:name found. adding to children ${nameExt} ${v.tag}`
                );
                node.children.push(v);
            }
        }
    });
};

const _mergeFeatures = (c, baseManifestFile, configKey, value) => {
    const features = getConfigProp(c, c.platform, configKey);

    if (features) {
        const featuresObj = [];
        features.forEach((key) => {
            featuresObj.push({
                tag: 'uses-feature',
                'android:name': key,
                'android:required': value
            });
        });
        _mergeNodeChildren(baseManifestFile, featuresObj);
    }
};

export const parseAndroidManifestSync = (c) => {
    logTask('parseAndroidManifestSync');
    const { platform } = c;

    try {
        const baseManifestFilePath = path.join(
            __dirname,
            `../../../src/sdks/sdk-android/supportFiles/AndroidManifest_${platform}.json`
        );
        const baseManifestFile = readObjectSync(baseManifestFilePath);
        baseManifestFile.package = getAppId(c, platform);

        const objArr = getConfigPropArray(c, c.platform, 'AndroidManifest');

        // PARSE all standard renative.*.json files in correct mergeOrder
        objArr.forEach((manifestObj) => {
            _mergeNodeParameters(baseManifestFile, manifestObj);
            if (manifestObj.children) {
                _mergeNodeChildren(baseManifestFile, manifestObj.children);
            }
        });

        // appConfigs/base/plugins.json PLUGIN CONFIG OVERRIDES
        parsePlugins(c, platform, (plugin, pluginPlat) => {
            const androidManifestPlugin = getFlavouredProp(
                c,
                pluginPlat,
                'AndroidManifest'
            );
            if (androidManifestPlugin) {
                _mergeNodeChildren(baseManifestFile, androidManifestPlugin.children);
                if (androidManifestPlugin.children) {
                    _mergeNodeChildren(baseManifestFile, androidManifestPlugin.children);
                }
            }
        });

        // appConfig PERMISSIONS OVERRIDES
        const configPermissions = c.buildConfig?.permissions;

        const includedPermissions = getConfigProp(c, platform, 'includedPermissions');
        const excludedPermissions = getConfigProp(
            c,
            platform,
            'excludedPermissions'
        );
        if (includedPermissions?.forEach && configPermissions) {
            const platPerm = configPermissions[platform] ? platform : 'android';
            const pc = configPermissions[platPerm];
            if (includedPermissions[0] === '*') {
                Object.keys(pc).forEach((k) => {
                    if (
                        !(
                            excludedPermissions
                          && excludedPermissions.includes(k)
                        )
                    ) {
                        const key = pc[k].key || k;
                        baseManifestFile.children.push({
                            tag: 'uses-permission',
                            'android:name': key
                        });
                    }
                });
            } else {
                includedPermissions.forEach((v) => {
                    if (pc[v]) {
                        const key = pc[v].key || v;
                        baseManifestFile.children.push({
                            tag: 'uses-permission',
                            'android:name': key
                        });
                    }
                });
            }
        } else if (includedPermissions) {
            logWarning('includedPermissions not parsed. make sure it an array format!');
        }

        // appConfig FEATURES OVERRIDES
        _mergeFeatures(c, baseManifestFile, 'includedFeatures', true);
        _mergeFeatures(c, baseManifestFile, 'excludedFeatures', false);


        const manifestXml = _convertToXML(baseManifestFile);
        // get correct source of manifest
        const manifestFile = 'app/src/main/AndroidManifest.xml';

        const injects = [
            { pattern: '{{PLUGIN_MANIFEST_FILE}}', override: manifestXml }
        ];

        addSystemInjects(c, injects);

        const appFolder = getAppFolder(c);

        writeCleanFile(
            getBuildFilePath(c, platform, manifestFile),
            path.join(appFolder, manifestFile),
            injects, null, c
        );

        return;
    } catch (e) {
        logError(e);
    }
};

export const injectPluginManifestSync = () => {
    // const className = pkg ? pkg.split('.').pop() : null;
    // let packageParams = '';
    // if (plugin.packageParams) {
    //     packageParams = plugin.packageParams.join(',');
    // }
    //
    // const pathFixed = plugin.path
    //     ? `${plugin.path}`
    //     : `node_modules/${key}/android`;
    // const modulePath = `../../${pathFixed}`;
};
