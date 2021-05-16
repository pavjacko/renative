<p align='center'>
    <br />
    <br />
  <p align='center'><img width="300" height="321" src="https://renative.org/img/logo-512.png" /></p>
  <br />
  <br />
  <p align='center'>build universal cross-platform apps with <a href="https://facebook.github.io/react-native/">react native</a></p>
  <p align='center'>
  <img src="https://img.shields.io/badge/Platforms_Supported-15-blue.svg" />
  <img src="https://img.shields.io/badge/React_Native-0.61.2-blue.svg" />
  <img src="https://img.shields.io/badge/React-16.9.0-blue.svg" />
  <img src="https://img.shields.io/badge/Plugins-78-red.svg" />
  </p>
</p>

<p align='center'>
  <a href="https://www.youtube.com/watch?v=PLCJzCDSyDk">Introduction Video</a>
</p>

   <br />
    <br />
      <br />
       <br />

<p align='center'>
    <a href="https://github.com/pavjacko/renative"><img src="https://img.shields.io/github/stars/pavjacko/renative.svg?style=social" /></a>
    <a href="https://github.com/pavjacko/renative"><img src="https://img.shields.io/github/forks/pavjacko/renative.svg?style=social" />
    <a href="https://spectrum.chat/renative"><img src="https://withspectrum.github.io/badge/badge.svg" /></a>
        </a>
    <a href="https://twitter.com/renative"><img src="https://img.shields.io/twitter/follow/renative.svg?style=social" /></a>
</p>

---

<!--
Quickstart
Platforms
Plugins
Templates
Configuration
Integrations
Build Hooks
CLI
Runtime
Contributing
-->

<p align="center">
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#features">Features</a> &bull;
  <!-- <a href="#platforms">Platforms</a> &bull; -->
  <a href="#templates--starters">Templates</a> &bull;
  <a href="#plugins">Plugins</a> &bull;
  <a href="#integrations">Integrations</a> &bull;
  <a href="#json-configurations">JSON Configurations</a> &bull;
  <a href="#folder-configurations">Folder Configurations</a> &bull;
  <a href="#build-hooks">Build Hooks</a> &bull;
  <a href="#cli">CLI</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="#developing-renative">Developing ReNative</a> &bull;
  <a href="#common-issues">Common Issues</a> &bull;
  <a href="#runtime">Runtime</a> &bull;
  <!-- <a href="#contributing">Contributing</a> &bull; -->
  <a href="#discussions">Discussions</a> &bull;
  <a href="#contributors">Contributors</a> &bull;
  <a href="#backers">Backers</a> &bull;
  <a href="#sponsors">Sponsors</a> &bull;
  <a href="#community">Community</a> &bull;
  <a href="#stats">Stats</a> &bull;
  <a href="#license">License</a>
</p>

<p align='center'>
    <a href="https://github.com/pavjacko"><img src="https://img.shields.io/github/followers/pavjacko.svg?label=Follow%20me%20on%20Github&style=social" /></a>
    <a href="https://twitter.com/pavjacko"><img src="https://img.shields.io/twitter/follow/pavjacko.svg?label=Follow%20me%20on%20Twitter&style=social" /></a>
</p>

<br />

<table>
  <tr>
    <th>
      <img src="https://renative.org/img/ic_ios.png" width=20 height=20 />
      </br>
      <a href="#ios">iOS</a>
    </th><th>
      <img src="https://renative.org/img/ic_tvos.png" width=36 height=20 />
      </br>
      <a href="#tvos">tvOS</a>
    </th><th>
      <img src="https://renative.org/img/ic_androidtv.png" width=20 height=20 />
      </br>
      <a href="#android-tv">Android TV</a>
    </th><th>
      <img src="https://renative.org/img/ic_macos.png" width=20 height=20 />
      </br>
      <a href="#macos">macOS</a>
    </th>
  </tr>
  <tr>
    <th>
      <img src="https://renative.org/img/rnv_ios.gif" />
    </th><th>
    <img src="https://renative.org/img/rnv_tvos.gif" />
    </th><th>
    <img src="https://renative.org/img/rnv_android-tv.gif" />
    </th><th>
    <img src="https://renative.org/img/rnv_macos.gif" />
    </th>
  </tr>
  <tr>
    <th>
    <img src="https://renative.org/img/ic_android.png" width=20 height=20 />
    </br>
    <a href="#android">Android</a>
    </th><th>
    <img src="https://renative.org/img/ic_web.png" width=80 height=20 />
    </br>
    <a href="#web">Web</a>
    </th><th>
    <img src="https://renative.org/img/ic_tizen.png" width=20 height=20 />
    </br>
    <a href="#tizen-tv">Tizen TV</a>
    </th><th>
    <img src="https://renative.org/img/ic_webos.png" width=20 height=20 />
    </br>
    <a href="#lg-webos">LG webOS</a>
    </th>
  </tr>
  <tr>
    <th>
    <img src="https://renative.org/img/rnv_android.gif" />
    </th><th>
    <img src="https://renative.org/img/rnv_web.gif" />
    </th><th>
    <img src="https://renative.org/img/rnv_tizen.gif" />
    </th><th>
    <img src="https://renative.org/img/rnv_webos.gif" />
    </th>
  </tr>
  <tr>
    <th>
    <img src="https://renative.org/img/ic_firefoxos.png" width=20 height=20 />
    </br>
    <a href="#firefoxos">FirefoxOS</a>
    </th><th>
    <img src="https://renative.org/img/ic_windows.png" width=20 height=20 />
    </br>
    <a href="#windows">Windows</a>
    </th><th>
    <img src="https://renative.org/img/ic_firefoxtv.png" width=20 height=20 />
    </br>
    <a href="#firefoxtv">Firefox TV</a>
    </th><th>
    <img src="https://renative.org/img/ic_kaios.png" width=55 height=20 />
    </br>
    <a href="#kaios">KaiOS</a>
    </th>
  </tr>
  <tr>
    <th>
    <img src="https://renative.org/img/rnv_firefoxos.gif" />
    </th><th>
    <img src="https://renative.org/img/rnv_windows.gif" />
    </th><th>
    <img src="https://renative.org/img/rnv_firefoxtv.gif" />
    </th><th>
    <img src="https://renative.org/img/rnv_kaios.gif" />
    </th>
  </tr>

  <tr>
    <th>
    <img src="https://renative.org/img/ic_tizen.png" width=20 height=20 />
    </br>
    <a href="#tizen-mobile">Tizen Mobile</a>
    </th><th>
    <img src="https://renative.org/img/ic_tizenwatch.png" width=20 height=20 />
    </br>
    <a href="#tizen-watch">Tizen Watch</a>
    </th><th>
    <img src="https://renative.org/img/ic_androidwear.png" width=20 height=20 />
    </br>
    <a href="#android-wear">Android Wear</a>
    </th><th>
    <img src="https://renative.org/img/ic_firetv.png" width=20 height=20 />
    </br>
    <a href="#firetv">FireTV</a>
    </th>
  </tr>
  <tr>
    <th>
    <img src="https://renative.org/img/rnv_tizenmobile.gif" />
    </th><th>
    <img src="https://renative.org/img/rnv_tizenwatch.gif" width="136" height="184" />
    </th><th>
    <img src="https://renative.org/img/rnv_androidwear.gif" width="150" height="150" />
    </th><th>
    <img src="https://renative.org/img/rnv_androidtv.gif" width="150" height="150" />
    </th>
  </tr>
</table>

<br />

[![build](https://travis-ci.org/pavjacko/renative.svg?branch=develop)](https://travis-ci.org/pavjacko/renative)
[![npm version](https://img.shields.io/npm/v/renative.svg?style=flat-square)](https://www.npmjs.com/package/renative)
[![npm downloads](https://img.shields.io/npm/dm/renative.svg?style=flat-square)](https://www.npmjs.com/package/renative)
[![All Contributors](https://img.shields.io/github/contributors/pavjacko/renative.svg)](#contributors)
[![License MIT](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/pavjacko/renative/pulls)
![hits](https://hits.dwyl.com/pavjacko/renative.svg)
[![Actions Status](https://github.com/pavjacko/renative/workflows/Node%20CI/badge.svg)](https://github.com/pavjacko/renative/actions)
[![codecov](https://codecov.io/gh/pavjacko/renative/branch/master/graph/badge.svg)](https://codecov.io/gh/pavjacko/renative)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

<!-- [![OpenCollective](https://opencollective.com/renative/backers/badge.svg)](#backers) -->
<!-- [![OpenCollective](https://opencollective.com/renative/sponsors/badge.svg)](#sponsors) -->
<!-- [![StackOverflow](http://img.shields.io/badge/stackoverflow-renative-blue.svg)]( http://stackoverflow.com/questions/tagged/renative) -->

> The universal development SDK to build multi-platform projects with [react native](https://facebook.github.io/react-native/). Includes latest `iOS`, `tvOS`, `Android`, `Android TV`, `FireTV`, `Web`, `Tizen TV`, `Tizen Watch`, `LG webOS`, `macOS/OSX`, `Windows`, `KaiOS`, `Firefox OS` and `Firefox TV` platforms

---

<img src="https://renative.org/img/ic_quickstart.png" width=50 height=50 />

## Quick Start

```bash
$ npm install rnv -g

$ rnv new
```

[Get Started (with more in-depth info)](https://renative.org/docs/intro-installation)

---

<img src="https://renative.org/img/ic_features.png" width=50 height=50 />

## Features

-   Learn
-   Write
-   Build
-   Integrate
-   Debug
-   Test
-   Deploy

[Explore ReNative Features](https://renative.org/docs/intro-features)

---

<img src="https://renative.org/img/ic_templates.png" width=50 height=50 />

## Templates / Starters

Too lazy to build your idea from scratch? use one of the predefined & community templates to get you started in no time.

[Documentation for ReNative Templates and Starters](https://renative.org/docs/guide-templates)

---

<img src="https://renative.org/img/ic_plugins.png" width=50 height=50 />

## Plugins

ReNative supports standard community driven react-native plugins you can use to enhance the functionality of your apps:

[Documentation for ReNative Plugins](https://renative.org/docs/guide-plugins)

---

<img src="https://renative.org/img/ic_integrations.png" width=50 height=50 />

## Integrations

ReNative supports integration for various services and deployment infrastructures for your apps

[Documentation for ReNative Integrations](https://renative.org/docs/integration_fastlane)

---

<img src="https://renative.org/img/ic_configuration.png" width=50 height=50 />

## JSON Configurations

Tire of setting up and managing countless of various projects? you can go as simple as most basic json config file to get yourself up and running

[Documentation for ReNative JSON Config](https://renative.org/docs/guide-config)

---

<img src="https://renative.org/img/ic_appconfigs.png" width=50 height=50 />

## Folder Configurations

ReNative offers flexible and scalable folder override & injection features to create numerous flavours, A/B features, dynamic plugin switches and more

[Documentation for ReNative Folder Configurations](https://renative.org/docs/guide-config_folders)

---

<img src="https://renative.org/img/ic_hooks.png" width=50 height=50 />

## Build Hooks

Sometimes you need to extend CLI functionality with custom build scripts. ReNative makes this easy for you.

[Documentation for ReNative Build Hooks](https://renative.org/docs/guide-build_hooks)

---

<img src="https://renative.org/img/ic_runtime.png" width=50 height=50 />

## Runtime

ReNative runtime is an NPM dependency used abstract away some of the complexities of building UI interfaces and features for large number of target platforms

[Documentation for ReNative Runtime](https://renative.org/docs/guide-renative-runtime)

---

<img src="https://renative.org/img/ic_cli.png" width=50 height=50 />

## CLI

One CLI to do it all. `rnv` is your entry point and control centre to building multi-platform apps with just a few commands to learn

[Documentation for RNV CLI](https://renative.org/docs/guide-cli)

---

<img src="https://renative.org/img/ic_arch.png" width=50 height=50 />

## Architecture

More in-depth explanation how ReNative internals work

[Documentation for ReNative Architecture](https://renative.org/docs/platform)

<!--
# Platforms

<p>

<img src="https://renative.org/img/ic_android.png" width=50 height=50 />
<img src="https://renative.org/img/ic_androidtv.png" width=50 height=50 />
<img src="https://renative.org/img/ic_web.png" width=200 height=50 />
<img src="https://renative.org/img/ic_tizen.png" width=50 height=50 />
<img src="https://renative.org/img/ic_tizenwatch.png" width=50 height=50 />
<img src="https://renative.org/img/ic_webos.png" width=50 height=50 />
<img src="https://renative.org/img/ic_tizen.png" width=50 height=50 />
<img src="https://renative.org/img/ic_macos.png" width=50 height=50 />
<img src="https://renative.org/img/ic_windows.png" width=50 height=50 />
<img src="https://renative.org/img/ic_ios.png" width=50 height=50 />
<img src="https://renative.org/img/ic_androidwear.png" width=50 height=50 />
<img src="https://renative.org/img/ic_firefoxos.png" width=50 height=50 />
<img src="https://renative.org/img/ic_firefoxtv.png" width=50 height=50 />
</p>
 -->

---

<img src="https://renative.org/img/ic_ios.png" width=50 height=50 />

## iOS

`rnv run -p ios`

[Documentation for iOS Platform](https://renative.org/docs/platform-ios)

---

<img src="https://renative.org/img/ic_android.png" width=50 height=50 />

## Android

`rnv run -p android`

[Documentation for Android Platform](https://renative.org/docs/platform-android)

---

<img src="https://renative.org/img/ic_tvos.png" width=90 height=50 />

## tvOS

`rnv run -p tvos`

[Documentation for tvOS Platform](https://renative.org/docs/platform-tvos)

---

<img src="https://renative.org/img/ic_androidtv.png" width=50 height=50 />

## Android TV

`rnv run -p androidtv`

[Documentation for Android TV Platform](https://renative.org/docs/platform-androidtv)

---

<img src="https://renative.org/img/ic_firetv.png" width=50 height=50 />

## FireTV

`rnv run -p firetv`

[Documentation for FireTV Platform](https://renative.org/docs/next/platforms/firetv)

---

<img src="https://renative.org/img/ic_web.png" width=200 height=50 />

## Web

`rnv run -p web`

[Documentation for Web Platform](https://renative.org/docs/platform-web)

---

<img src="https://renative.org/img/ic_tizen.png" width=50 height=50 />

## Tizen TV

`rnv run -p tizen`

[Documentation for Tizen TV Platform](https://renative.org/docs/platform-tizen)

---

<img src="https://renative.org/img/ic_tizenwatch.png" width=50 height=50 />

## Tizen Watch

`rnv run -p tizenwatch`

[Documentation for Tizen Watch Platform](https://renative.org/docs/platform-tizenwatch)

---

<img src="https://renative.org/img/ic_webos.png" width=50 height=50 />

## LG webOS

`rnv run -p webos`

[Documentation for LG WebOS Platform](https://renative.org/docs/platform-webos)

---

<img src="https://renative.org/img/ic_tizen.png" width=50 height=50 />

## Tizen Mobile

`rnv run -p tizenmobile`

[Documentation for Tizen Mobile Platform](https://renative.org/docs/platform-tizenmobile)

---

<img src="https://renative.org/img/ic_macos.png" width=50 height=50 />

## macOS

`rnv run -p macos`

[Documentation for macOS Platform](https://renative.org/docs/platform-macos)

---

<img src="https://renative.org/img/ic_windows.png" width=50 height=50 />

## Windows

`rnv run -p windows`

[Documentation for Windows Platform](https://renative.org/docs/platform-windows)

---

<img src="https://renative.org/img/ic_androidwear.png" width=50 height=50 />

## Android Wear

`rnv run -p androidwear`

[Documentation for Android Wear Platform](https://renative.org/docs/platform-androidwear)

---

<img src="https://renative.org/img/ic_kaios.png" width=140 height=50 />

## KaiOS

`rnv run -p kaios`

[Documentation for KaiOS Platform](https://renative.org/docs/platform-kaios)

---

<img src="https://renative.org/img/ic_firefoxos.png" width=50 height=50 />

## FirefoxOS

`rnv run -p firefoxos`

[Documentation for Firefox OS Platform](https://renative.org/docs/platform-firefoxos)

---

<img src="https://renative.org/img/ic_firefoxtv.png" width=50 height=50 />

## FirefoxTV

`rnv run -p firefoxtv`

[Documentation for Firefox TV Platform](https://renative.org/docs/platform-firefoxtv)

---

<img src="https://renative.org/img/ic_chromecast.png" width=50 height=50 />

## Chromecast

`rnv run -p chromecast`

[Documentation for Chromecast Platform](https://renative.org/docs/platform-chromecast)

---

<img src="https://renative.org/img/ic_construction.png" width=50 height=50 />

## Developing ReNative

If you need full control over whole ReNative build or want to contribute, you can clone and develop ReNative locally

[Documentation for Developing ReNative](https://renative.org/docs/guide-develop)

---

<img src="https://renative.org/img/ic_issues.png" width=50 height=50 />

## Common Issues

If you face unexpected issues always good to check if there is a quick solution for it

[List of common problems and how to solve them](https://renative.org/docs/guide-common_issues)

---

<img src="https://renative.org/img/ic_chat.png" width=50 height=50 />

## Discussions

https://spectrum.chat/renative

---

<img src="https://renative.org/img/ic_contributor.png" width=50 height=50 />

## Contributors

This project exists thanks to all the people who contribute. [[Contribute]](CONTRIBUTING.md).

<a href="graphs/contributors"><img src="https://opencollective.com/renative/contributors.svg?width=890" /></a>

## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/renative#backer)]

<a href="https://opencollective.com/renative#backers" target="_blank"><img src="https://opencollective.com/renative/backers.svg?width=890"></a>

## Sponsors

<a href="https://www.24i.com"><img src="https://renative.org/img/sponsors/24i.jpg" width=200 height=85 /></a>

---

<img src="https://renative.org/img/ic_community.png" width=50 height=50 />

## Community

Special thanks to open-source initiatives this project utilises, notably:

-   https://www.npmjs.com/package/react-native
-   https://www.npmjs.com/package/react-native-web
-   https://www.npmjs.com/package/webpack
-   https://www.npmjs.com/package/babel-cli
-   https://www.npmjs.com/package/electron

---

## Stats

[![NPM](https://nodei.co/npm/renative.png)](https://nodei.co/npm/renative/) [![Join the chat at https://gitter.im/pavjacko/renative](https://badges.gitter.im/pavjacko/renative.svg)](https://gitter.im/pavjacko/renative?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## LICENSE

[MIT](LICENSE)
