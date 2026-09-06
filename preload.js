'use strict';

const { contextBridge, ipcRenderer } = require('electron');

function subscribe(channel, callback) {
  if (typeof callback !== 'function') throw new TypeError('A callback is required.');
  const listener = (_event, payload) => callback(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld('appStresser', Object.freeze({
  detectAdb: (override) => ipcRenderer.invoke('adb:detect', override),
  listDevices: () => ipcRenderer.invoke('adb:devices'),
  startMonkey: (options) => ipcRenderer.invoke('monkey:start', options),
  stopMonkey: () => ipcRenderer.invoke('monkey:stop'),
  onMonkeyOutput: (callback) => subscribe('monkey:output', callback),
  onMonkeyFinished: (callback) => subscribe('monkey:finished', callback),
}));
