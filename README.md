# AppStresser v3

AppStresser is a small desktop UI for exercising Android applications with the
[ADB Monkey](https://developer.android.com/studio/test/other-testing-tools/monkey) tool.

> v3 is under active development. Milestone 1 provides the secure execution core.

## Milestone 1 features

- Detects ADB from `ANDROID_SDK_ROOT`, `ANDROID_HOME`, or `PATH`
- Accepts an optional explicit ADB executable or `platform-tools` directory
- Lists authorized Android devices and hides offline/unauthorized devices
- Validates the application package and event count
- Runs Monkey without invoking a command shell
- Streams stdout/stderr and allows an active run to be stopped
- Uses a sandboxed, context-isolated Electron renderer with a narrow preload API

## Prerequisites

- Node.js 22 or newer
- Android SDK Platform-Tools
- An Android device or emulator with USB debugging enabled

## Development

```sh
pnpm install
pnpm test
pnpm start
```

Connect and authorize a device before launching the test. You can verify it from
a terminal with `adb devices -l`.

## Security model

The renderer has no Node.js access. All privileged work passes through explicit
IPC handlers in the Electron main process. ADB is launched with `spawn()` and an
argument array (`shell: false`); UI values are never concatenated into a shell
command.

## Current scope

Milestone 1 displays raw Monkey output. Structured crash/ANR reporting and report
export belong to Milestone 3.

## License

[MIT](LICENSE)
