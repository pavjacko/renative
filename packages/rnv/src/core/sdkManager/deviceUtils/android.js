import path from 'path';
import child_process from 'child_process';
import inquirer from 'inquirer';
import { fsExistsSync, fsReaddirSync, fsLstatSync, fsReadFileSync } from '../../systemManager/fileutils';
import { execCLI, executeTelnet } from '../../systemManager/exec';
import { waitForEmulator } from './common';
import { isSystemWin } from '../../systemManager/utils';
import {
    chalk,
    logToSummary,
    logTask,
    logError,
    logWarning,
    logDebug,
    logSuccess,
    logRaw
} from '../../systemManager/logger';
import {
    IS_TABLET_ABOVE_INCH,
    ANDROID_WEAR,
    ANDROID,
    ANDROID_TV,
    FIRE_TV,
    CLI_ANDROID_EMULATOR,
    CLI_ANDROID_ADB,
    CLI_ANDROID_AVDMANAGER,
    CLI_ANDROID_SDKMANAGER,
    USER_HOME_DIR
} from '../../constants';

const CHECK_INTEVAL = 5000;

const currentDeviceProps = {};

export const composeDevicesString = (devices, returnArray) => {
    logTask('composeDevicesString', `numDevices:${devices ? devices.length : null}`);
    const devicesArray = [];
    devices.forEach((v, i) => devicesArray.push(_getDeviceString(v, !returnArray ? i : null)));
    if (returnArray) return devicesArray;
    return `\n${devicesArray.join('')}`;
};

export const launchAndroidSimulator = async (c, target, isIndependentThread = false) => {
    logTask(
        'launchAndroidSimulator', `target:${target} independentThread:${!!isIndependentThread}`
    );
    let newTarget = target;
    if (target === true) {
        const {
            program: { device }
        } = c;
        const list = await getAndroidTargets(c, false, device, device);

        const devicesString = composeDevicesString(list, true);
        const choices = devicesString;
        const response = await inquirer.prompt([
            {
                name: 'chosenEmulator',
                type: 'list',
                message: 'What emulator would you like to start?',
                choices
            }
        ]);
        newTarget = response.chosenEmulator;
    }

    if (newTarget) {
        const actualTarget = newTarget.name || newTarget;
        if (isIndependentThread) {
            execCLI(c, CLI_ANDROID_EMULATOR, `-avd "${actualTarget}"`, {
                detached: isIndependentThread
            }).catch((err) => {
                if (err.includes && err.includes('WHPX')) {
                    logWarning(err);
                    return logError(
                        'It seems you do not have the Windows Hypervisor Platform virtualization enabled. Enter windows features in the Windows search box and select Turn Windows features on or off in the search results. In the Windows Features dialog, enable both Hyper-V and Windows Hypervisor Platform.',
                        true
                    );
                }
                logError(err);
            });
            return Promise.resolve();
        }
        return execCLI(c, CLI_ANDROID_EMULATOR, `-avd "${actualTarget}"`, {
            detached: isIndependentThread
        });
    }
    return Promise.reject('No simulator -t target name specified!');
};

export const listAndroidTargets = async (c) => {
    logTask('listAndroidTargets');
    const {
        program: { device }
    } = c;

    await resetAdb(c);
    const list = await getAndroidTargets(c, false, device, device);
    const devices = await composeDevicesString(list);
    logToSummary(`Android Targets:\n${devices}`);
    if (devices.trim() === '') {
        logToSummary('Android Targets: No devices found');
    }
    return devices;
};

const _getDeviceString = (device, i) => {
    const {
        isTV,
        isTablet,
        name,
        udid,
        isDevice,
        isActive,
        avdConfig,
        isWear,
        arch
    } = device;
    let deviceIcon = '';
    if (isTablet) deviceIcon = 'Tablet 💊 ';
    if (isTV) deviceIcon = 'TV 📺 ';
    if (isWear) deviceIcon = 'Wear ⌚ ';
    if (!deviceIcon && (udid !== 'unknown' || avdConfig)) {
        deviceIcon = 'Phone 📱 ';
    }

    const deviceString = `${chalk().white(
        name
    )} | ${deviceIcon} | arch: ${arch} | udid: ${chalk().grey(udid)}${
        isDevice ? chalk().red(' (device)') : ''
    } ${isActive ? chalk().magenta(' (active)') : ''}`;

    if (i === null) {
        return { key: name, name: deviceString, value: name, icon: deviceIcon };
    }

    return ` [${i + 1}]> ${deviceString}\n`;
};

export const resetAdb = async (c, ranBefore) => {
    try {
        if (!ranBefore) await execCLI(c, CLI_ANDROID_ADB, 'kill-server');
    } catch (e) {
        logWarning(e);
    }
    try {
        await execCLI(c, CLI_ANDROID_ADB, 'start-server');
    } catch (e) {
        if (ranBefore) {
            return Promise.reject(e);
        }
        logWarning(`Got error:\n${e}\nWill attemnt again in 5 seconds`);
        setTimeout(resetAdb, 5000, c, true);
    }
};

export const getAndroidTargets = async (
    c,
    skipDevices,
    skipAvds,
    deviceOnly = false
) => {
    logTask(
        'getAndroidTargets',
        `skipDevices:${!!skipDevices} skipAvds:${!!skipAvds} deviceOnly:${!!deviceOnly}`
    );

    try {
        let devicesResult;
        let avdResult;

        if (!skipDevices) {
            devicesResult = await execCLI(c, CLI_ANDROID_ADB, 'devices -l');
        }
        if (!skipAvds) {
            avdResult = await execCLI(c, CLI_ANDROID_EMULATOR, '-list-avds');
        }
        return _parseDevicesResult(c, devicesResult, avdResult, deviceOnly);
    } catch (e) {
        return Promise.reject(e);
    }
};

const calculateDeviceDiagonal = (width, height, density) => {
    // Calculate the diagonal in inches
    const widthInches = width / density;
    const heightInches = height / density;
    return Math.sqrt(widthInches * widthInches + heightInches * heightInches);
};

const getRunningDeviceProp = async (c, udid, prop) => {
    // avoid multiple calls to the same device
    if (currentDeviceProps[udid]) {
        if (!prop) return currentDeviceProps[udid];
        return currentDeviceProps[udid][prop];
    }
    const rawProps = await execCLI(
        c,
        CLI_ANDROID_ADB,
        `-s ${udid} shell getprop`
    );
    const reg = /\[.+\]: \[.*\n?[^[]*\]/gm;
    const lines = rawProps.match(reg);

    lines.forEach((line) => {
        const words = line.split(']: [');
        const key = words[0].slice(1);
        const value = words[1].slice(0, words[1].length - 1);

        if (!currentDeviceProps[udid]) currentDeviceProps[udid] = {};
        currentDeviceProps[udid][key] = value;
    });

    return getRunningDeviceProp(c, udid, prop);
};

const decideIfTVRunning = async (c, device) => {
    const { udid, model, product } = device;
    const mod = await getRunningDeviceProp(c, udid, 'ro.product.model');
    const name = await getRunningDeviceProp(c, udid, 'ro.product.name');
    const flavor = await getRunningDeviceProp(c, udid, 'ro.build.flavor');
    const clientIdBase = await getRunningDeviceProp(
        c,
        udid,
        'ro.com.google.clientidbase'
    );
    const description = await getRunningDeviceProp(
        c,
        udid,
        'ro.build.description'
    );
    const hdmi = await getRunningDeviceProp(c, udid, 'init.svc.hdmi');
    const modelGroup = await getRunningDeviceProp(
        c,
        udid,
        'ro.nrdp.modelgroup'
    );
    const configuration = await getRunningDeviceProp(
        c,
        udid,
        'ro.build.configuration'
    );
    const cecEnabled = await getRunningDeviceProp(
        c,
        udid,
        'persist.sys.cec.enabled'
    );

    let isTV = false;
    [mod, name, flavor, clientIdBase, description, model, product].forEach(
        (string) => {
            if (string && string.toLowerCase().includes('tv')) isTV = true;
        }
    );

    if (model.includes('SHIELD')) isTV = true;
    if (hdmi) isTV = true;
    if (modelGroup && modelGroup.toLowerCase().includes('firetv')) isTV = true;
    if (configuration === 'tv') isTV = true;
    if (cecEnabled) isTV = true;

    return isTV;
};

const decideIfWearRunning = async (c, device) => {
    const { udid, model, product } = device;
    const fingerprint = await getRunningDeviceProp(
        c,
        udid,
        'ro.vendor.build.fingerprint'
    );
    const name = await getRunningDeviceProp(c, udid, 'ro.product.vendor.name');
    const mod = await getRunningDeviceProp(c, udid, 'ro.product.vendor.model');
    const flavor = await getRunningDeviceProp(c, udid, 'ro.build.flavor');
    const description = await getRunningDeviceProp(
        c,
        udid,
        'ro.build.description'
    );

    let isWear = false;
    [fingerprint, name, mod, flavor, description, model, product].forEach(
        (string) => {
            const cmp = string ? string.toLowerCase() : '';
            if ((cmp.includes('wear') || cmp.includes('rubyfish'))) isWear = true;
        }
    );
    return isWear;
};

const getDeviceType = async (device, c) => {
    logDebug('getDeviceType - in', { device });

    if (device.product === 'tunny') {
        device.isNotEligibleAndroid = true;
        return device;
    }

    if (device.udid !== 'unknown') {
        const screenSizeResult = await execCLI(
            c,
            CLI_ANDROID_ADB,
            `-s ${device.udid} shell wm size`
        );
        const screenDensityResult = await execCLI(
            c,
            CLI_ANDROID_ADB,
            `-s ${device.udid} shell wm density`
        );
        const arch = await getRunningDeviceProp(
            c,
            device.udid,
            'ro.product.cpu.abi'
        );
        let screenProps;

        if (screenSizeResult) {
            const [width, height] = screenSizeResult
                .split('Physical size: ')[1]
                .split('x');
            screenProps = {
                width: parseInt(width, 10),
                height: parseInt(height, 10)
            };
        }

        if (screenDensityResult) {
            const density = screenDensityResult.split('Physical density: ')[1];
            screenProps = { ...screenProps, density: parseInt(density, 10) };
        }

        device.isTV = await decideIfTVRunning(c, device);

        if (screenSizeResult && screenDensityResult) {
            const { width, height, density } = screenProps;

            const diagonalInches = calculateDeviceDiagonal(
                width,
                height,
                density
            );
            screenProps = { ...screenProps, diagonalInches };
            device.isTablet = !device.isTV
                && diagonalInches > IS_TABLET_ABOVE_INCH
                && diagonalInches <= 15;
            device.isWear = await decideIfWearRunning(c, device);
        }

        device.isPhone = !device.isTablet && !device.isWear && !device.isTV;
        device.isMobile = !device.isWear && !device.isTV;
        device.screenProps = screenProps;
        device.arch = arch;
        logDebug('getDeviceType - out', { device });
        return device;
    }

    if (device.avdConfig) {
        const density = parseInt(device.avdConfig['hw.lcd.density'], 10);
        const width = parseInt(device.avdConfig['hw.lcd.width'], 10);
        const height = parseInt(device.avdConfig['hw.lcd.height'], 10);
        const arch = device.avdConfig['abi.type'];

        // Better detect wear
        const sysdir = device.avdConfig['image.sysdir.1'];
        const tagId = device.avdConfig['tag.id'];
        const tagDisplay = device.avdConfig['tag.display'];
        const deviceName = device.avdConfig['hw.device.name'];

        device.isWear = false;
        [sysdir, tagId, tagDisplay, deviceName].forEach((string) => {
            if (string && string.includes('wear')) device.isWear = true;
        });

        const avdId = device.avdConfig.AvdId;
        const name = device.avdConfig['hw.device.name'];
        const skin = device.avdConfig['skin.name'];
        const image = device.avdConfig['image.sysdir.1'];

        device.isTV = false;
        [avdId, name, skin, image].forEach((string) => {
            if (string && string.toLowerCase().includes('tv')) {
                device.isTV = true;
            }
        });

        const diagonalInches = calculateDeviceDiagonal(width, height, density);
        device.isTablet = !device.isTV && diagonalInches > IS_TABLET_ABOVE_INCH;
        device.isPhone = !device.isTablet && !device.isWear && !device.isTV;
        device.isMobile = !device.isWear && !device.isTV;
        device.arch = arch;
        logDebug('getDeviceType - out', { device });
        return device;
    }
    return device;
};

const getAvdDetails = (c, deviceName) => {
    const { ANDROID_SDK_HOME, ANDROID_AVD_HOME } = process.env;

    // .avd dir might be in other place than homedir. (https://developer.android.com/studio/command-line/variables)
    const avdConfigPaths = [
        `${ANDROID_AVD_HOME}`,
        `${ANDROID_SDK_HOME}/.android/avd`,
        `${USER_HOME_DIR}/.android/avd`
    ];

    const results = {};

    avdConfigPaths.forEach((cPath) => {
        if (fsExistsSync(cPath)) {
            const filesPath = fsReaddirSync(cPath);

            filesPath.forEach((fName) => {
                const fPath = path.join(cPath, fName);
                const dirent = fsLstatSync(fPath);
                if (!dirent.isDirectory() && fName === `${deviceName}.ini`) {
                    const avdData = fsReadFileSync(fPath).toString();
                    const lines = avdData.trim().split(/\r?\n/);
                    lines.forEach((line) => {
                        const [key, value] = line.split('=');
                        if (key === 'path') {
                            const initData = fsReadFileSync(`${value}/config.ini`)
                                .toString();
                            const initLines = initData.trim().split(/\r?\n/);
                            const avdConfig = {};
                            initLines.forEach((initLine) => {
                                const [iniKey, iniValue] = initLine.split('=');
                                // also remove the white space
                                avdConfig[iniKey.trim()] = iniValue.trim();
                            });
                            results.avdConfig = avdConfig;
                        }
                    });
                }
            });
        }
    });
    return results;
};

const getEmulatorName = async (c, words) => {
    const emulator = words[0];
    const port = emulator.split('-')[1];

    const emulatorReply = await executeTelnet(c, port, 'avd name');
    const emulatorReplyArray = emulatorReply.split('OK');
    const emulatorNameStr = emulatorReplyArray[
        emulatorReplyArray.length - 2
    ];
    const emulatorName = emulatorNameStr?.trim?.() || '(err: could not parse emulator name)';
    return emulatorName;
};

export const connectToWifiDevice = async (c, ip) => {
    const deviceResponse = await execCLI(
        c,
        CLI_ANDROID_ADB,
        `connect ${ip}:5555`
    );
    if (deviceResponse.includes('connected')) return true;
    logError(`Failed to connect to ${ip}:5555`, false, true);
    return false;
};

const _parseDevicesResult = async (
    c,
    devicesString,
    avdsString,
    deviceOnly
) => {
    logDebug(
        `_parseDevicesResult:${devicesString}:${avdsString}:${deviceOnly}`
    );
    const devices = [];
    const { skipTargetCheck } = c.program;

    if (devicesString) {
        const lines = devicesString.trim().split(/\r?\n/);
        logDebug('_parseDevicesResult 2', { lines });
        if (lines.length !== 0) {
            await Promise.all(
                lines.map(async (line) => {
                    const words = line.split(/[ ,\t]+/).filter(w => w !== '');
                    if (words.length === 0) return;
                    logDebug('_parseDevicesResult 3', { words });

                    if (words[1] === 'device') {
                        const isDevice = !words[0].includes('emulator');
                        let name = _getDeviceProp(words, 'model:');
                        const model = name;
                        const product = _getDeviceProp(words, 'product:');
                        logDebug('_parseDevicesResult 4', { name });
                        if (!isDevice) {
                            await waitForEmulatorToBeReady(c, words[0]);
                            name = await getEmulatorName(c, words);
                            logDebug('_parseDevicesResult 5', { name });
                        }
                        logDebug('_parseDevicesResult 6', {
                            deviceOnly,
                            isDevice
                        });
                        if ((deviceOnly && isDevice) || !deviceOnly) {
                            devices.push({
                                udid: words[0],
                                isDevice,
                                isActive: true,
                                name,
                                model,
                                product
                            });
                        }
                        return true;
                    }
                })
            );
        }
    }

    if (avdsString) {
        const avdLines = avdsString.trim().split(/\r?\n/);
        logDebug('_parseDevicesResult 7', { avdLines });

        await Promise.all(
            avdLines.map(async (line) => {
                let avdDetails;

                try {
                    avdDetails = getAvdDetails(c, line);
                } catch (e) {
                    logError(e);
                }

                try {
                    logDebug('_parseDevicesResult 8', { avdDetails });

                    // Yes, 2 greps. Hacky but it excludes the grep process corectly and quickly :)
                    // if this runs without throwing it means that the simulator is running so it needs to be excluded
                    const findProcess = isSystemWin
                        ? `tasklist | find "avd ${line}"`
                        : `ps x | grep "avd ${line}" | grep -v grep`;
                    child_process.execSync(findProcess);
                    logDebug(
                        '_parseDevicesResult 9 - excluding running emulator'
                    );
                } catch (e) {
                    if (avdDetails) {
                        devices.push({
                            udid: 'unknown',
                            isDevice: false,
                            isActive: false,
                            name: line,
                            ...avdDetails
                        });
                    }
                }
            })
        );
    }

    logDebug('_parseDevicesResult 10', { devices });

    return Promise.all(devices.map(device => getDeviceType(device, c))).then(
        devicesArray => devicesArray.filter((device) => {
            // filter devices based on selected platform
            const { platform } = c;
            if (skipTargetCheck) return true; // return everything if skipTargetCheck is used
            if (device.isNotEligibleAndroid) return false;
            const matches = (platform === ANDROID && device.isTablet)
                    || (platform === ANDROID_WEAR && device.isWear)
                    || (platform === ANDROID_TV && device.isTV)
                    || (platform === FIRE_TV && device.isTV)
                    || (platform === ANDROID && device.isMobile);
            logDebug('getDeviceType - filter', {
                device,
                matches,
                platform
            });
            return matches;
        })
    );
};

const _getDeviceProp = (arr, prop) => {
    for (let i = 0; i < arr.length; i++) {
        const v = arr[i];
        if (v && v.includes(prop)) return v.replace(prop, '');
    }
    return '';
};

export const askForNewEmulator = async (c, platform) => {
    logTask('askForNewEmulator');
    const emuName = c.files.workspace.config.defaultTargets[platform];

    const { confirm } = await inquirer.prompt({
        name: 'confirm',
        type: 'confirm',
        message: `Do you want ReNative to create new Emulator (${chalk().white(
            emuName
        )}) for you?`
    });

    if (confirm) {
        switch (platform) {
            case 'android':
                return _createEmulator(c, '28', 'google_apis', emuName).then(
                    () => launchAndroidSimulator(c, emuName, true)
                );
            case 'androidtv':
                return _createEmulator(c, '28', 'android-tv', emuName).then(
                    () => launchAndroidSimulator(c, emuName, true)
                );
            case 'androidwear':
                return _createEmulator(c, '28', 'android-wear', emuName).then(
                    () => launchAndroidSimulator(c, emuName, true)
                );
            default:
                return Promise.reject(
                    'Cannot find any active or created emulators'
                );
        }
    }
    return Promise.reject('Action canceled!');
};

const _createEmulator = (c, apiVersion, emuPlatform, emuName) => {
    logTask('_createEmulator');

    return execCLI(
        c,
        CLI_ANDROID_SDKMANAGER,
        `"system-images;android-${apiVersion};${emuPlatform};x86"`
    )
        .then(() => execCLI(
            c,
            CLI_ANDROID_AVDMANAGER,
            `create avd -n ${emuName} -k "system-images;android-${apiVersion};${emuPlatform};x86"`
        ))
        .catch(e => logError(e, true));
};

const waitForEmulatorToBeReady = (c, emulator) => waitForEmulator(
    c,
    CLI_ANDROID_ADB,
    `-s ${emulator} shell getprop init.svc.bootanim`,
    res => res.includes('stopped')
);

export const checkForActiveEmulator = c => new Promise((resolve, reject) => {
    logTask('checkForActiveEmulator');
    const { platform } = c;
    let attempts = 1;
    const maxAttempts = isSystemWin ? 20 : 10;
    let running = false;
    const poll = setInterval(() => {
        // Prevent the interval from running until enough promises return to make it stop or we get a result
        if (!running) {
            running = true;
            getAndroidTargets(c, false, true, false)
                .then(async (v) => {
                    logDebug('Available devices after filtering', v);
                    if (v.length > 0) {
                        logSuccess(
                            `Found active emulator! ${chalk().white(
                                v[0].udid
                            )}. Will use it`
                        );
                        clearInterval(poll);
                        resolve(v[0]);
                    } else {
                        logRaw(
                            `looking for active emulators: attempt ${attempts}/${maxAttempts}`
                        );
                        attempts++;
                        if (
                            [ANDROID_TV, FIRE_TV, ANDROID_WEAR].includes(platform)
                                && attempts === 2
                        ) {
                            await resetAdb(c); // from time to time adb reports a recently started atv emu as being offline. Restarting adb fixes it
                        }
                        if (attempts > maxAttempts) {
                            clearInterval(poll);
                            reject('Could not find any active emulators');
                            // TODO: Asking for new emulator is worng as it diverts
                            // user from underlying failure of not being able to connect
                            // return _askForNewEmulator(c, platform);
                        }
                        running = false;
                    }
                })
                .catch((e) => {
                    clearInterval(poll);
                    logError(e);
                });
        }
    }, CHECK_INTEVAL);
});
