# CrashScout

**Local, scriptless Android crash discovery by ReporterPlus.**

CrashScout explores Android applications with repeatable events, detects crashes
and ANRs, and surfaces useful device logs. Its first execution engine is the
[ADB Monkey](https://developer.android.com/studio/test/other-testing-tools/monkey) tool.

> CrashScout is the next generation of AppStresser, originally created by
> Mrityunjeyan Sarvabhouman in 2019. The current release is an experimental alpha.

**Powered by Android Monkey · Built by ReporterPlus**

## macOS: open the downloaded app

The current macOS prerelease is not signed or notarized. After downloading it
from this repository's official GitHub Releases page, move **CrashScout.app** to
your **Applications** folder and run:

```sh
xattr -dr com.apple.quarantine "/Applications/CrashScout.app"
open "/Applications/CrashScout.app"
```

Only use this command for a copy downloaded from the official release. It removes
quarantine from CrashScout only; it does not disable Gatekeeper globally. See
[Unsigned prerelease warnings](#unsigned-prerelease-warnings) for alternatives
and Windows instructions.

## Current alpha features

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
warning when you downloaded CrashScout from this repository's official GitHub
Releases page and the filename and version match the release notes. Do not turn
off SmartScreen, Gatekeeper, antivirus software, or other system-wide security
protections.

### Windows

Windows SmartScreen may display **Windows protected your PC** because the app
does not yet have a trusted publisher signature.

1. Confirm the installer came from the official CrashScout GitHub release.
2. In the SmartScreen window, select **More info**.
3. Check that the displayed app name is CrashScout, then select **Run anyway**.

If **Run anyway** is unavailable on a managed computer, do not weaken the
computer's security policy. Ask your administrator or run CrashScout from source.

### macOS

Gatekeeper may report that Apple cannot check CrashScout for malicious software
or that the developer cannot be verified.

1. Confirm the archive came from the official CrashScout GitHub release.
2. Move CrashScout to the **Applications** folder.
3. In Finder, Control-click CrashScout and choose **Open**, then choose **Open**
   again if macOS offers that option.
4. If it remains blocked, open **System Settings → Privacy & Security**, find the
   CrashScout message, choose **Open Anyway**, and authenticate when prompted.

Some unsigned builds may instead produce a **CrashScout is damaged and can't be
opened** dialog with only a **Move to Bin** option. If—and only if—you downloaded
that copy from this repository's official GitHub Releases page, remove the
quarantine attribute from CrashScout specifically:

```sh
xattr -dr com.apple.quarantine "/Applications/CrashScout.app"
open "/Applications/CrashScout.app"
```

This does not disable Gatekeeper globally; it removes quarantine from only the
specified CrashScout bundle. Never run the command against an app from an
untrusted source, and never replace the app path with a broad directory.

If you prefer not to bypass the warning, run CrashScout from source after
installing Node.js 22 or newer and pnpm:

```sh
git clone https://github.com/reach2jeyan/Stress-test-your-Android-App.git
cd Stress-test-your-Android-App
pnpm install
pnpm start
```

These extra steps are necessary because the current prereleases are not signed
with an Apple Developer ID certificate or notarized by Apple. A future signed and
notarized release will support the normal double-click installation experience.

## Security model

The renderer has no Node.js access. All privileged work passes through explicit
IPC handlers in the Electron main process. ADB is launched with `spawn()` and an
argument array (`shell: false`); UI values are never concatenated into a shell
command.

## Technology attribution

CrashScout currently uses Android Monkey as its test-execution engine. CrashScout
is an independent ReporterPlus project and is not affiliated with or endorsed by
Google. Android is a trademark of Google LLC.

## Current scope

CrashScout currently identifies crashes and ANRs reported by Monkey and displays
recent entries from Android's crash log buffer. Exportable reports and deeper
stack-trace analysis are not implemented yet.

## License

[MIT](LICENSE)
