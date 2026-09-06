'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { adbCandidates, classifyMonkeyResult, parseDevices, validateRunOptions } = require('../src/adb');

test('parses adb devices and preserves device state', () => {
  const output = 'List of devices attached\nABC123 device product:sdk model:Pixel_8 transport_id:1\nOLD offline\nNOPE unauthorized\n';
  assert.deepEqual(parseDevices(output), [
    { serial: 'ABC123', state: 'device', details: 'product:sdk model:Pixel_8 transport_id:1' },
    { serial: 'OLD', state: 'offline', details: '' },
    { serial: 'NOPE', state: 'unauthorized', details: '' },
  ]);
});

test('places an explicit adb executable before environment candidates', () => {
  assert.equal(adbCandidates({ override: '/tools/adb', env: {}, platform: 'darwin', home: '/Users/test' })[0], '/tools/adb');
});

test('checks the conventional macOS Android SDK location', () => {
  assert.ok(adbCandidates({ env: {}, platform: 'darwin', home: '/Users/test' }).includes(
    '/Users/test/Library/Android/sdk/platform-tools/adb',
  ));
});

test('rejects shell syntax in run options', () => {
  assert.throws(
    () => validateRunOptions({ device: 'ABC;touch /tmp/pwned', packageName: 'com.example.app', events: 100 }),
    /valid Android device/,
  );
  assert.throws(
    () => validateRunOptions({ device: 'ABC', packageName: 'com.example.app;whoami', events: 100 }),
    /valid Android package/,
  );
});

test('normalizes valid run options', () => {
  assert.deepEqual(
    validateRunOptions({ device: ' emulator-5554 ', packageName: ' com.example_app.debug ', events: '1000' }),
    { device: 'emulator-5554', packageName: 'com.example_app.debug', events: 1000 },
  );
});

test('classifies Monkey crashes and extracts a reason', () => {
  assert.deepEqual(
    classifyMonkeyResult('// CRASH: com.example.app (pid 42)\n// Short Msg: java.lang.IllegalStateException', { code: 0 }),
    { outcome: 'crash', title: 'App crash detected', detail: 'java.lang.IllegalStateException' },
  );
});

test('classifies ANRs before generic failures', () => {
  assert.deepEqual(classifyMonkeyResult('ANR in com.example.app\nReason: Input dispatching timed out', { code: 1 }), {
    outcome: 'anr', title: 'App not responding', detail: 'ANR in com.example.app',
  });
});

test('distinguishes stopped and successful runs', () => {
  assert.equal(classifyMonkeyResult('', { signal: 'SIGTERM', stopped: true }).outcome, 'stopped');
  assert.equal(classifyMonkeyResult('Events injected: 1000', { code: 0 }).outcome, 'passed');
});

test('surfaces process launch errors', () => {
  assert.deepEqual(classifyMonkeyResult('', { code: null, error: 'spawn adb ENOENT' }), {
    outcome: 'failed', title: 'Test command failed', detail: 'spawn adb ENOENT',
  });
});
