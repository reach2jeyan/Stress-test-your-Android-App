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

## Unsigned prerelease warnings

Current prerelease builds are not code-signed. Only bypass an operating-system
warning when you downloaded AppStresser from this repository's official GitHub
Releases page and the filename and version match the release notes. Do not turn
off SmartScreen, Gatekeeper, antivirus software, or other system-wide security
protections.

### Windows

Windows SmartScreen may display **Windows protected your PC** because the app
does not yet have a trusted publisher signature.

1. Confirm the installer came from the official AppStresser GitHub release.
2. In the SmartScreen window, select **More info**.
3. Check that the displayed app name is AppStresser, then select **Run anyway**.

If **Run anyway** is unavailable on a managed computer, do not weaken the
computer's security policy. Ask your administrator or run AppStresser from source.

### macOS

Gatekeeper may report that Apple cannot check AppStresser for malicious software
or that the developer cannot be verified.

1. Confirm the archive came from the official AppStresser GitHub release.
2. Move AppStresser to the **Applications** folder.
3. In Finder, Control-click AppStresser and choose **Open**, then choose **Open**
   again if macOS offers that option.
4. If it remains blocked, open **System Settings → Privacy & Security**, find the
   AppStresser message, choose **Open Anyway**, and authenticate when prompted.

These exceptions apply only to this copy of AppStresser. Do not disable
Gatekeeper globally or use commands that remove quarantine checks from arbitrary
downloads.

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
