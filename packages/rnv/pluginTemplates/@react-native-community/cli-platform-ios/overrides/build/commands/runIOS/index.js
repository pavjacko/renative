"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _child_process() {
  const data = _interopRequireDefault(require("child_process"));

  _child_process = function () {
    return data;
  };

  return data;
}

function _fs() {
  const data = _interopRequireDefault(require("fs"));

  _fs = function () {
    return data;
  };

  return data;
}

function _path() {
  const data = _interopRequireDefault(require("path"));

  _path = function () {
    return data;
  };

  return data;
}

function _chalk() {
  const data = _interopRequireDefault(require("chalk"));

  _chalk = function () {
    return data;
  };

  return data;
}

var _findXcodeProject = _interopRequireDefault(require("./findXcodeProject"));

var _parseIOSDevicesList = _interopRequireDefault(require("./parseIOSDevicesList"));

var _findMatchingSimulator = _interopRequireDefault(require("./findMatchingSimulator"));

var _warnAboutManuallyLinkedLibs = _interopRequireDefault(require("../../link/warnAboutManuallyLinkedLibs"));

var _warnAboutPodInstall = _interopRequireDefault(require("../../link/warnAboutPodInstall"));

function _cliTools() {
  const data = require("@react-native-community/cli-tools");

  _cliTools = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
let counter = 0;
function runIOS(_, ctx, args) {
  if (counter === 1) {
      return;
  }
  counter++;
  if (!_fs().default.existsSync(args.projectPath)) {
    throw new (_cliTools().CLIError)('iOS project folder not found. Are you sure this is a React Native project?');
  }

  (0, _warnAboutManuallyLinkedLibs.default)(ctx);
  (0, _warnAboutPodInstall.default)(ctx);
  process.chdir(args.projectPath);
  const xcodeProject = (0, _findXcodeProject.default)(_fs().default.readdirSync('.'));

  if (!xcodeProject) {
    throw new (_cliTools().CLIError)(`Could not find Xcode project files in "${args.projectPath}" folder`);
  }

  const inferredSchemeName = _path().default.basename(xcodeProject.name, _path().default.extname(xcodeProject.name));

  const scheme = args.scheme || inferredSchemeName;

  _cliTools().logger.info(`Found Xcode ${xcodeProject.isWorkspace ? 'workspace' : 'project'} "${_chalk().default.bold(xcodeProject.name)}"`); // No need to load all available devices


  if (!args.device && !args.udid) {
    return runOnSimulator(xcodeProject, scheme, args);
  }

  if (args.device && args.udid) {
    return _cliTools().logger.error('The `device` and `udid` options are mutually exclusive.');
  }

  const devices = (0, _parseIOSDevicesList.default)(_child_process().default.execFileSync('xcrun', ['instruments', '-s'], {
    encoding: 'utf8'
  }));

  if (args.udid) {
    const device = devices.find(d => d.udid === args.udid);

    if (!device) {
      return _cliTools().logger.error(`Could not find a device with udid: "${_chalk().default.bold(args.udid)}". ${printFoundDevices(devices)}`);
    }

    if (device.type === 'simulator') {
      return runOnSimulator(xcodeProject, scheme, args);
    } else {
      return runOnDevice(device, scheme, xcodeProject, args);
    }
  } else {
    const physicalDevices = devices.filter(d => d.type !== 'simulator');
    const device = matchingDevice(physicalDevices, args.device);

    if (device) {
      return runOnDevice(device, scheme, xcodeProject, args);
    }
  }
}

async function runOnSimulator(xcodeProject, scheme, args) {
  let simulators;

  try {
    simulators = JSON.parse(_child_process().default.execFileSync('xcrun', ['simctl', 'list', '--json', 'devices'], {
      encoding: 'utf8'
    }));
  } catch (error) {
    throw new (_cliTools().CLIError)('Could not get the simulator list from Xcode. Please open Xcode and try running project directly from there to resolve the remaining issues.', error);
  }
  /**
   * If provided simulator does not exist, try simulators in following order
   * - iPhone X
   * - iPhone 8
   */

  // throw new (_cliTools().CLIError)(JSON.stringify(args));

  // args.simulator = 'Apple TV 4K';
  
  const fallbackSimulators = ['iPhone X', 'iPhone 8'];
  const selectedSimulator = fallbackSimulators.reduce((simulator, fallback) => {
    return simulator || (0, _findMatchingSimulator.default)(simulators, {
      simulator: fallback
    });
  }, (0, _findMatchingSimulator.default)(simulators, args));

  // throw new (_cliTools().CLIError)(JSON.stringify(selectedSimulator));

  // const selectedSimulator = simulators.devices['com.apple.CoreSimulator.SimRuntime.tvOS-14-3'][0];

  // throw new (_cliTools().CLIError)(JSON.stringify(selectedSimulator, null, 2));

  if (!selectedSimulator) {
    throw new (_cliTools().CLIError)(`No simulator available with ${args.simulator ? `name "${args.simulator}"` : `udid "${args.udid}"`}`);
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


  const activeDeveloperDir = _child_process().default.execFileSync('xcode-select', ['-p'], {
    encoding: 'utf8'
  }).trim();

  _child_process().default.execFileSync('open', [`${activeDeveloperDir}/Applications/Simulator.app`, '--args', '-CurrentDeviceUDID', selectedSimulator.udid]);

  if (!selectedSimulator.booted) {
    bootSimulator(selectedSimulator);
  }

  const appName = await buildProject(xcodeProject, selectedSimulator.udid, scheme, args);
  const appPath = getBuildPath(xcodeProject, args.configuration, appName, false, scheme);

  _cliTools().logger.info(`Installing "${_chalk().default.bold(appPath)}"`);

  _child_process().default.spawnSync('xcrun', ['simctl', 'install', selectedSimulator.udid, appPath], {
    stdio: 'inherit'
  });

  const bundleID = _child_process().default.execFileSync('/usr/libexec/PlistBuddy', ['-c', 'Print:CFBundleIdentifier', _path().default.join(appPath, 'Info.plist')], {
    encoding: 'utf8'
  }).trim();

  _cliTools().logger.info(`Launching "${_chalk().default.bold(bundleID)}"`);

  const result = _child_process().default.spawnSync('xcrun', ['simctl', 'launch', selectedSimulator.udid, bundleID]);

  if (result.status === 0) {
    _cliTools().logger.success('Successfully launched the app on the simulator');
  } else {
    _cliTools().logger.error('Failed to launch the app on simulator', result.stderr);
  }
}

async function runOnDevice(selectedDevice, scheme, xcodeProject, args) {
  const isIOSDeployInstalled = _child_process().default.spawnSync('ios-deploy', ['--version'], {
    encoding: 'utf8'
  });

  if (isIOSDeployInstalled.error) {
    throw new (_cliTools().CLIError)(`Failed to install the app on the device because we couldn't execute the "ios-deploy" command. Please install it by running "${_chalk().default.bold('npm install -g ios-deploy')}" and try again.`);
  }

  const appName = await buildProject(xcodeProject, selectedDevice.udid, scheme, args);
  const iosDeployInstallArgs = ['--bundle', getBuildPath(xcodeProject, args.configuration, appName, true, scheme), '--id', selectedDevice.udid, '--justlaunch'];

  _cliTools().logger.info(`Installing and launching your app on ${selectedDevice.name}`);

  const iosDeployOutput = _child_process().default.spawnSync('ios-deploy', iosDeployInstallArgs, {
    encoding: 'utf8'
  });

  if (iosDeployOutput.error) {
    throw new (_cliTools().CLIError)(`Failed to install the app on the device. We've encountered an error in "ios-deploy" command: ${iosDeployOutput.error.message}`);
  }

  return _cliTools().logger.success('Installed the app on the device.');
}

function buildProject(xcodeProject, udid, scheme, args) {
  return new Promise((resolve, reject) => {
    const xcodebuildArgs = [xcodeProject.isWorkspace ? '-workspace' : '-project', xcodeProject.name, '-configuration', args.configuration, '-scheme', scheme, '-destination', `id=${udid}`];

    _cliTools().logger.info(`Building ${_chalk().default.dim(`(using "xcodebuild ${xcodebuildArgs.join(' ')}")`)}`);

    let xcpretty;

    if (!args.verbose) {
      xcpretty = xcprettyAvailable() && _child_process().default.spawn('xcpretty', [], {
        stdio: ['pipe', process.stdout, process.stderr]
      });
    }

    const buildProcess = _child_process().default.spawn('xcodebuild', xcodebuildArgs, getProcessOptions(args));

    let buildOutput = '';
    let errorOutput = '';
    buildProcess.stdout.on('data', data => {
      const stringData = data.toString();
      buildOutput += stringData;

      if (xcpretty) {
        xcpretty.stdin.write(data);
      } else {
        if (_cliTools().logger.isVerbose()) {
          _cliTools().logger.debug(stringData);
        } else {
          process.stdout.write('.');
        }
      }
    });
    buildProcess.stderr.on('data', data => {
      errorOutput += data;
    });
    buildProcess.on('close', code => {
      if (xcpretty) {
        xcpretty.stdin.end();
      } else {
        process.stdout.write('\n');
      }

      if (code !== 0) {
        reject(new (_cliTools().CLIError)(`
            Failed to build iOS project.

            We ran "xcodebuild" command but it exited with error code ${code}. To debug build
            logs further, consider building your app with Xcode.app, by opening
            ${xcodeProject.name}.
          `, buildOutput + '\n' + errorOutput));
        return;
      }

      resolve(getProductName(buildOutput) || scheme);
    });
  });
}

function bootSimulator(selectedSimulator) {
  const simulatorFullName = formattedDeviceName(selectedSimulator);

  _cliTools().logger.info(`Launching ${simulatorFullName}`);

  try {
    _child_process().default.spawnSync('xcrun', ['instruments', '-w', selectedSimulator.udid]);
  } catch (_ignored) {// instruments always fail with 255 because it expects more arguments,
    // but we want it to only launch the simulator
  }
}

function getTargetBuildDir(buildSettings) {
  const settings = JSON.parse(buildSettings); // Find app in all building settings - look for WRAPPER_EXTENSION: 'app',

  for (const i in settings) {
    const wrapperExtension = settings[i].buildSettings.WRAPPER_EXTENSION;

    if (wrapperExtension === 'app') {
      return settings[i].buildSettings.TARGET_BUILD_DIR;
    }
  }

  return null;
}

function getBuildPath(xcodeProject, configuration, appName, isDevice, scheme) {
  let device;

  if (isDevice) {
    device = 'iphoneos';
  } else if (appName.toLowerCase().includes('tvos')) {
    device = 'appletvsimulator';
  } else {
    device = 'iphonesimulator';
  }

  const buildSettings = _child_process().default.execFileSync('xcodebuild', [xcodeProject.isWorkspace ? '-workspace' : '-project', xcodeProject.name, '-scheme', scheme, '-sdk', device, '-configuration', configuration, '-showBuildSettings', '-json'], {
    encoding: 'utf8'
  });

  const targetBuildDir = getTargetBuildDir(buildSettings);

  if (!targetBuildDir) {
    throw new (_cliTools().CLIError)('Failed to get the target build directory.');
  }

  return `${targetBuildDir}/${appName}.app`;
}

function getProductName(buildOutput) {
  const productNameMatch = /export FULL_PRODUCT_NAME="?(.+).app"?$/m.exec(buildOutput);
  return productNameMatch ? productNameMatch[1] : null;
}

function xcprettyAvailable() {
  try {
    _child_process().default.execSync('xcpretty --version', {
      stdio: [0, 'pipe', 'ignore']
    });
  } catch (error) {
    return false;
  }

  return true;
}

function matchingDevice(devices, deviceName) {
  if (deviceName === true) {
    const firstIOSDevice = devices.find(d => d.type === 'device');

    if (firstIOSDevice) {
      _cliTools().logger.info(`Using first available device named "${_chalk().default.bold(firstIOSDevice.name)}" due to lack of name supplied.`);

      return firstIOSDevice;
    } else {
      _cliTools().logger.error('No iOS devices connected.');

      return undefined;
    }
  }

  const deviceByName = devices.find(device => device.name === deviceName || formattedDeviceName(device) === deviceName);

  if (!deviceByName) {
    _cliTools().logger.error(`Could not find a device named: "${_chalk().default.bold(String(deviceName))}". ${printFoundDevices(devices)}`);
  }

  return deviceByName;
}

function formattedDeviceName(simulator) {
  return simulator.version ? `${simulator.name} (${simulator.version})` : simulator.name;
}

function printFoundDevices(devices) {
  return ['Available devices:', ...devices.map(device => `  - ${device.name} (${device.udid})`)].join('\n');
}

function getProcessOptions({
  packager,
  terminal,
  port
}) {
  if (packager) {
    return {
      env: { ...process.env,
        RCT_TERMINAL: terminal,
        RCT_METRO_PORT: port.toString()
      }
    };
  }

  return {
    env: { ...process.env,
      RCT_TERMINAL: terminal,
      RCT_NO_LAUNCH_PACKAGER: 'true'
    }
  };
}

var _default = {
  name: 'run-ios',
  description: 'builds your app and starts it on iOS simulator',
  func: runIOS,
  examples: [{
    desc: 'Run on a different simulator, e.g. iPhone SE',
    cmd: 'react-native run-ios --simulator "iPhone SE"'
  }, {
    desc: 'Pass a non-standard location of iOS directory',
    cmd: 'react-native run-ios --project-path "./app/ios"'
  }, {
    desc: "Run on a connected device, e.g. Max's iPhone",
    cmd: 'react-native run-ios --device "Max\'s iPhone"'
  }, {
    desc: 'Run on the AppleTV simulator',
    cmd: 'react-native run-ios --simulator "Apple TV"  --scheme "helloworld-tvOS"'
  }],
  options: [{
    name: '--simulator [string]',
    description: 'Explicitly set simulator to use. Optionally include iOS version between ' + 'parenthesis at the end to match an exact version: "iPhone 6 (10.0)"',
    default: 'iPhone 11'
  }, {
    name: '--configuration [string]',
    description: 'Explicitly set the scheme configuration to use',
    default: 'Debug'
  }, {
    name: '--scheme [string]',
    description: 'Explicitly set Xcode scheme to use'
  }, {
    name: '--project-path [string]',
    description: 'Path relative to project root where the Xcode project ' + '(.xcodeproj) lives.',
    default: 'ios'
  }, {
    name: '--device [string]',
    description: 'Explicitly set device to use by name.  The value is not required if you have a single device connected.'
  }, {
    name: '--udid [string]',
    description: 'Explicitly set device to use by udid'
  }, {
    name: '--no-packager',
    description: 'Do not launch packager while building'
  }, {
    name: '--verbose',
    description: 'Do not use xcpretty even if installed'
  }, {
    name: '--port [number]',
    default: process.env.RCT_METRO_PORT || 8081,
    parse: val => Number(val)
  }, {
    name: '--terminal [string]',
    description: 'Launches the Metro Bundler in a new window using the specified terminal path.',
    default: _cliTools().getDefaultUserTerminal
  }]
};
exports.default = _default;

//# sourceMappingURL=index.js.map