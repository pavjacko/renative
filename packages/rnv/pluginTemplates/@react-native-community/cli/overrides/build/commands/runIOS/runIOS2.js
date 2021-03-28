

Object.defineProperty(exports, '__esModule', {
    value: true,
});
exports.default = void 0;

function _child_process() {
    const data = _interopRequireDefault(require('child_process'));

    _child_process = function () {
        return data;
    };

    return data;
}

function _fs() {
    const data = _interopRequireDefault(require('fs'));

    _fs = function () {
        return data;
    };

    return data;
}

function _path() {
    const data = _interopRequireDefault(require('path'));

    _path = function () {
        return data;
    };

    return data;
}

const _findXcodeProject = _interopRequireDefault(require('./findXcodeProject'));

const _parseIOSDevicesList = _interopRequireDefault(require('./parseIOSDevicesList'));

const _findMatchingSimulator = _interopRequireDefault(require('./findMatchingSimulator'));

const _errors = require('../../tools/errors');

const _logger = _interopRequireDefault(require('../../tools/logger'));

const _commandExistsSync = require('rnv/dist/systemManager/exec').commandExistsSync;

const _shell = require('shelljs');

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _objectSpread(target) {
    for (let i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};
        let ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(
                Object.getOwnPropertySymbols(source).filter(sym => Object.getOwnPropertyDescriptor(source, sym).enumerable)
            );
        }
        ownKeys.forEach((key) => {
            _defineProperty(target, key, source[key]);
        });
    }
    return target;
}

function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
        obj[key] = value;
    }
    return obj;
}

function runIOS(_, ctx, args) {
    if (!_fs().default.existsSync(args.projectPath)) {
        throw new Error('iOS project folder not found. Are you sure this is a React Native project?');
    }

    process.chdir(args.projectPath);
    const xcodeProject = (0, _findXcodeProject.default)(_fs().default.readdirSync('.'));

    if (!xcodeProject) {
        throw new Error(`Could not find Xcode project files in "${args.projectPath}" folder`);
    }

    const inferredSchemeName = _path().default.basename(xcodeProject.name, _path().default.extname(xcodeProject.name));

    const scheme = args.scheme || inferredSchemeName;

    _logger.default.info(`Found Xcode ${xcodeProject.isWorkspace ? 'workspace' : 'project'} ${xcodeProject.name}`);

    const devices = (0, _parseIOSDevicesList.default)(
        // $FlowExpectedError https://github.com/facebook/flow/issues/5675
        _child_process().default.execFileSync('xcrun', ['instruments', '-s'], {
            encoding: 'utf8',
        })
    );

    if (args.device) {
        const selectedDevice = matchingDevice(devices, args.udid || args.device);

        if (selectedDevice) {
            return runOnDevice(selectedDevice, scheme, xcodeProject, args.configuration, args.packager, args.verbose, args.port, args.allowProvisioningUpdates);
        }

        if (devices && devices.length > 0) {
            // $FlowIssue: args.device is defined in this context
            _logger.default.error(`Could not find device with the name: "${args.device}".
Choose one of the following:${printFoundDevices(devices)}`);
        } else {
            _logger.default.error('No iOS devices connected.');
        }
    } else if (args.udid) {
        // $FlowIssue: args.udid is defined in this context
        return runOnDeviceByUdid(args, scheme, xcodeProject, devices);
    }

    return runOnSimulator(xcodeProject, args, scheme);
}

function runOnDeviceByUdid(args, scheme, xcodeProject, devices) {
    const selectedDevice = matchingDeviceByUdid(devices, args.udid);

    if (selectedDevice) {
        runOnDevice(selectedDevice, scheme, xcodeProject, args.configuration, args.packager, args.verbose, args.port);
        return;
    }

    if (devices && devices.length > 0) {
        // $FlowIssue: args.udid is defined in this context
        _logger.default.error(`Could not find device with the udid: "${args.udid}".
Choose one of the following:\n${printFoundDevices(devices)}`);
    } else {
        _logger.default.error('No iOS devices connected.');
    }
}

async function runOnSimulator(xcodeProject, args, scheme) {
    let simulators;

    try {
        simulators = JSON.parse(
            // $FlowIssue: https://github.com/facebook/flow/issues/5675
            _child_process().default.execFileSync('xcrun', ['simctl', 'list', '--json', 'devices'], {
                encoding: 'utf8',
            })
        );
    } catch (e) {
        throw new Error('Could not parse the simulator list output');
    }

    const selectedSimulator = (0, _findMatchingSimulator.default)(simulators, args.simulator);

    if (!selectedSimulator) {
        throw new Error(`Could not find ${args.simulator} simulator`);
    }
    /**
     * Booting simulator through `xcrun simctl boot` will boot it in the `headless` mode
     * (running in the background).
     *
     * In order for user to see the app and the simulator itself, we have to make sure
     * that the Simulator.app is running.
     *
     * We also pass it `-CurrentDeviceUDID` so that when we launch it for the first time,
     * it will not boot the "default" device, but the one we set. If the app is already running,
     * this flag has no effect.
     */

    const activeDeveloperDir = _child_process()
        .default.execFileSync('xcode-select', ['-p'], {
            encoding: 'utf8',
        }) // $FlowExpectedError https://github.com/facebook/flow/issues/5675
        .trim();

    _child_process().default.execFileSync('open', [
        `${activeDeveloperDir}/Applications/Simulator.app`,
        '--args',
        '-CurrentDeviceUDID',
        selectedSimulator.udid,
    ]);

    if (!selectedSimulator.booted) {
        bootSimulator(selectedSimulator);
    }

    const appName = await buildProject(
        xcodeProject,
        selectedSimulator.udid,
        scheme,
        args.configuration,
        args.packager,
        args.verbose,
        args.port,
        args.allowProvisioningUpdates
    );
    const appPath = getBuildPath(args.configuration, appName, false, scheme);

    _logger.default.info(`Installing ${appPath}`);

    _child_process().default.spawnSync('xcrun', ['simctl', 'install', selectedSimulator.udid, appPath], {
        stdio: 'inherit',
    });

    const bundleID = _child_process()
        .default.execFileSync(
            '/usr/libexec/PlistBuddy',
            ['-c', 'Print:CFBundleIdentifier', _path().default.join(appPath, 'Info.plist')],
            {
                encoding: 'utf8',
            }
        ) // $FlowExpectedError https://github.com/facebook/flow/issues/5675
        .trim();

    _logger.default.info(`Launching ${bundleID}`);

    _child_process().default.spawnSync('xcrun', ['simctl', 'launch', selectedSimulator.udid, bundleID], {
        stdio: 'inherit',
    });
}

async function runOnDevice(selectedDevice, scheme, xcodeProject, configuration, launchPackager, verbose, port, allowProvisioningUpdates) {
    const appName = await buildProject(xcodeProject, selectedDevice.udid, scheme, configuration, launchPackager, verbose, port, allowProvisioningUpdates);
    const iosDeployInstallArgs = [
        '--bundle',
        getBuildPath(configuration, appName, true, scheme),
        '--id',
        selectedDevice.udid,
        '--justlaunch',
    ];

    _logger.default.info(`installing and launching your app on ${selectedDevice.name}... `);

    // check if brew is used and if it is, if python@2 is installed, which will cause issues with lldb
    if (_commandExistsSync('brew')) {
        const installed = _shell.exec('brew list').stdout;
        if (installed && installed.includes('python@2')) {
            console.log('You have Python@2 installed with Brew. Unlinking it since it will cause problems with LLDB');
            _shell.exec('brew unlink python@2');
        }
    }

    if (!_commandExistsSync('easy_install')) {
        console.log('Installing six...');
        _child_process().default.spawnSync('easy_install', ['-U', 'six'], {
            encoding: 'utf8',
        });
    }


    console.log('Running ios-deploy', iosDeployInstallArgs.join(' '));
    const iosDeployOutput = _shell.exec(`npx ios-deploy ${iosDeployInstallArgs.join(' ')}`);

    if (iosDeployOutput.stderr) {
        if (iosDeployOutput.stderr.includes('Unable to mount developer disk image')) {
            _logger.default.error(
                '** WARNING **\nApp was installed but couldn\'t be launched because the device is locked.'
            );
            throw new Error('ERROR:DEVICE_LOCKED');
        } else {
            _logger.default.error(
                '** INSTALLATION FAILED **\nMake sure you have ios-deploy installed globally.\n(e.g "npm install -g ios-deploy")'
            );
        }
    } else {
        _logger.default.info('** INSTALLATION SUCCEEDED **');
    }
}

function buildProject(xcodeProject, udid, scheme, configuration, launchPackager = false, verbose, port, allowProvisioningUpdates) {
    return new Promise((resolve, reject) => {
        const xcodebuildArgs = [
            xcodeProject.isWorkspace ? '-workspace' : '-project',
            xcodeProject.name,
            '-configuration',
            configuration,
            '-scheme',
            scheme,
            '-destination',
            `id=${udid}`,
            '-derivedDataPath',
            `build/${scheme}`
        ];
        if (allowProvisioningUpdates) xcodebuildArgs.push('-allowProvisioningUpdates');

        _logger.default.info(`Building using "xcodebuild ${xcodebuildArgs.join(' ')}"`);

        let xcpretty;

        if (!verbose) {
            xcpretty = xcprettyAvailable()
                && _child_process().default.spawn('xcpretty', [], {
                    stdio: ['pipe', process.stdout, process.stderr],
                });
        }

        const buildProcess = _child_process().default.spawn(
            'xcodebuild',
            xcodebuildArgs,
            getProcessOptions(launchPackager, port)
        );

        let buildOutput = '';
        let errorOutput = '';
        buildProcess.stdout.on('data', (data) => {
            buildOutput += data.toString();

            if (xcpretty) {
                xcpretty.stdin.write(data);
            } else {
                _logger.default.info(data.toString());
            }
        });
        buildProcess.stderr.on('data', (data) => {
            errorOutput += data;
        });
        buildProcess.on('close', (code) => {
            if (xcpretty) {
                xcpretty.stdin.end();
            }

            if (code !== 0) {
                reject(
                    new _errors.ProcessError(
                        [
                            'Failed to build iOS project.',
                            `We ran "xcodebuild" command but it exited with error code ${code}.`,
                            `To debug build logs further, consider building your app with Xcode.app, by opening ${
                                xcodeProject.name
                            }`,
                        ].join(' '),
                        errorOutput
                    )
                );
                return;
            }

            resolve(getProductName(buildOutput) || scheme);
        });
    });
}

function bootSimulator(selectedSimulator) {
    const simulatorFullName = formattedDeviceName(selectedSimulator);

    _logger.default.info(`Launching ${simulatorFullName}...`);

    try {
        _child_process().default.spawnSync('xcrun', ['instruments', '-w', selectedSimulator.udid]);
    } catch (_ignored) {
        // instruments always fail with 255 because it expects more arguments,
        // but we want it to only launch the simulator
    }
}

function getBuildPath(configuration, appName, isDevice, scheme) {
    let device;

    if (isDevice) {
        device = 'iphoneos';
        if (appName.toLowerCase().includes('tvos')) {
            device = 'appletvos';
        }
    } else if (appName.toLowerCase().includes('tvos')) {
        device = 'appletvsimulator';
    } else {
        device = 'iphonesimulator';
    }

    return `build/${scheme}/Build/Products/${configuration}-${device}/${appName}.app`;
}

function getProductName(buildOutput) {
    const productNameMatch = /export FULL_PRODUCT_NAME="?(.+).app"?$/m.exec(buildOutput);
    return productNameMatch ? productNameMatch[1] : null;
}

function xcprettyAvailable() {
    try {
        _child_process().default.execSync('xcpretty --version', {
            stdio: [0, 'pipe', 'ignore'],
        });
    } catch (error) {
        return false;
    }

    return true;
}

function matchingDevice(devices, deviceName) {
    if (deviceName === true && devices.length === 1) {
        _logger.default.info(`Using first available device ${devices[0].name} due to lack of name supplied.`);

        return devices[0];
    }

    for (let i = devices.length - 1; i >= 0; i--) {
        if (devices[i].udid === deviceName || devices[i].name === deviceName || formattedDeviceName(devices[i]) === deviceName) {
            return devices[i];
        }
    }

    return null;
}

function matchingDeviceByUdid(devices, udid) {
    for (let i = devices.length - 1; i >= 0; i--) {
        if (devices[i].udid === udid) {
            return devices[i];
        }
    }

    return null;
}

function formattedDeviceName(simulator) {
    return `${simulator.name} (${simulator.version})`;
}

function printFoundDevices(devices) {
    let output = '';

    for (let i = devices.length - 1; i >= 0; i--) {
        output += `${devices[i].name} Udid: ${devices[i].udid}\n`;
    }

    return output;
}

function getProcessOptions(launchPackager, port) {
    if (launchPackager) {
        return {
            env: _objectSpread({}, process.env, {
                RCT_METRO_PORT: port,
            }),
        };
    }

    return {
        env: _objectSpread({}, process.env, {
            RCT_NO_LAUNCH_PACKAGER: true,
        }),
    };
}

const _default = {
    name: 'run-ios',
    description: 'builds your app and starts it on iOS simulator',
    func: runIOS,
    examples: [
        {
            desc: 'Run on a different simulator, e.g. iPhone 5',
            cmd: 'react-native run-ios --simulator "iPhone 5"',
        },
        {
            desc: 'Pass a non-standard location of iOS directory',
            cmd: 'react-native run-ios --project-path "./app/ios"',
        },
        {
            desc: "Run on a connected device, e.g. Max's iPhone",
            cmd: 'react-native run-ios --device "Max\'s iPhone"',
        },
        {
            desc: 'Run on the AppleTV simulator',
            cmd: 'react-native run-ios --simulator "Apple TV"  --scheme "helloworld-tvOS"',
        },
    ],
    options: [
        {
            command: '--simulator [string]',
            description:
                'Explicitly set simulator to use. Optionally include iOS version between'
                + 'parenthesis at the end to match an exact version: "iPhone 6 (10.0)"',
            default: 'iPhone X',
        },
        {
            command: '--configuration [string]',
            description: 'Explicitly set the scheme configuration to use',
            default: 'Debug',
        },
        {
            command: '--scheme [string]',
            description: 'Explicitly set Xcode scheme to use',
        },
        {
            command: '--project-path [string]',
            description: 'Path relative to project root where the Xcode project ' + '(.xcodeproj) lives.',
            default: 'ios',
        },
        {
            command: '--device [string]',
            description:
                'Explicitly set device to use by name.  The value is not required if you have a single device connected.',
        },
        {
            command: '--udid [string]',
            description: 'Explicitly set device to use by udid',
        },
        {
            command: '--no-packager',
            description: 'Do not launch packager while building',
        },
        {
            command: '--verbose',
            description: 'Do not use xcpretty even if installed',
        },
        {
            command: '--port [number]',
            default: process.env.RCT_METRO_PORT || 8081,
            parse: val => Number(val),
        },
        {
            command: '--allowProvisioningUpdates',
            description: 'Allow provisioning profiles updates'
        }
    ],
};
exports.default = _default;
