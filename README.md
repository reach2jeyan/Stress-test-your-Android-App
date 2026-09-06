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
- Stops on the first crash or ANR and displays a clear test result
- Shows the recent device crash log when a failure is detected
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

AppStresser currently identifies crashes and ANRs reported by Monkey and displays
recent entries from Android's crash log buffer. Exportable reports and deeper
stack-trace analysis are not implemented yet.

## License

[MIT](LICENSE)
