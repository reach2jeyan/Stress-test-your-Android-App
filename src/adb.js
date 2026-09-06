'use strict';

const { execFile, spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const EXEC_TIMEOUT_MS = 10_000;

function adbExecutableName(platform = process.platform) {
  return platform === 'win32' ? 'adb.exe' : 'adb';
}

function adbCandidates({ override, env = process.env, platform = process.platform, home = os.homedir() } = {}) {
  const executable = adbExecutableName(platform);
  const candidates = [];

  if (override && override.trim()) {
    const value = override.trim();
    candidates.push(path.basename(value).toLowerCase() === executable ? value : path.join(value, executable));
  }

  for (const sdkRoot of [env.ANDROID_SDK_ROOT, env.ANDROID_HOME]) {
    if (sdkRoot) candidates.push(path.join(sdkRoot, 'platform-tools', executable));
  }

  const conventionalSdkRoot = platform === 'darwin'
    ? path.join(home, 'Library', 'Android', 'sdk')
    : platform === 'win32'
      ? env.LOCALAPPDATA && path.join(env.LOCALAPPDATA, 'Android', 'Sdk')
      : path.join(home, 'Android', 'Sdk');
  if (conventionalSdkRoot) candidates.push(path.join(conventionalSdkRoot, 'platform-tools', executable));

  candidates.push(executable);
  return [...new Set(candidates)];
}

function execFileResult(file, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(file, args, { timeout: EXEC_TIMEOUT_MS, windowsHide: true, ...options }, (error, stdout, stderr) => {
      if (error) {
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function findAdb(override) {
  const errors = [];
  for (const candidate of adbCandidates({ override })) {
    if (candidate !== adbExecutableName() && (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile())) {
      errors.push(`${candidate}: not found`);
      continue;
    }

    try {
      const { stdout } = await execFileResult(candidate, ['version']);
      const version = stdout.split(/\r?\n/).find((line) => line.startsWith('Android Debug Bridge')) || stdout.trim();
      return { path: candidate, version };
    } catch (error) {
      errors.push(`${candidate}: ${error.code || error.message}`);
    }
  }

  throw new Error(`ADB was not found. Install Android SDK Platform-Tools or enter the ADB executable path.\n${errors.join('\n')}`);
}

function parseDevices(output) {
  return output
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [serial, state, ...details] = line.split(/\s+/);
      return { serial, state: state || 'unknown', details: details.join(' ') };
    })
    .filter((device) => device.serial && !device.serial.startsWith('*'));
}

async function listDevices(adbPath) {
  const { stdout } = await execFileResult(adbPath, ['devices', '-l']);
  return parseDevices(stdout);
}

function validateRunOptions(options) {
  const device = String(options?.device || '').trim();
  const packageName = String(options?.packageName || '').trim();
  const events = Number(options?.events);

  if (!/^[A-Za-z0-9._:-]+$/.test(device)) throw new Error('Select a valid Android device.');
  if (!/^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/.test(packageName)) {
    throw new Error('Enter a valid Android package name, such as com.example.app.');
  }
  if (!Number.isSafeInteger(events) || events < 1 || events > 10_000_000) {
    throw new Error('Event count must be a whole number between 1 and 10,000,000.');
  }

  return { device, packageName, events };
}

function startMonkey(adbPath, options, handlers = {}) {
  const run = validateRunOptions(options);
  const args = [
    '-s', run.device, 'shell', 'monkey', '-p', run.packageName,
    '--ignore-crashes', '--ignore-timeouts', '--monitor-native-crashes', '-v', String(run.events),
  ];
  const child = spawn(adbPath, args, { shell: false, windowsHide: true });

  child.stdout.on('data', (chunk) => handlers.onOutput?.('stdout', chunk.toString()));
  child.stderr.on('data', (chunk) => handlers.onOutput?.('stderr', chunk.toString()));
  child.once('error', (error) => handlers.onError?.(error));
  child.once('close', (code, signal) => handlers.onClose?.({ code, signal }));
  return child;
}

module.exports = { adbCandidates, findAdb, listDevices, parseDevices, startMonkey, validateRunOptions };
