'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { adbCandidates, parseDevices, validateRunOptions } = require('../src/adb');

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
