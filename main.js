'use strict';

const path = require('node:path');
const { app, BrowserWindow, ipcMain } = require('electron');
const { classifyMonkeyResult, findAdb, getRecentCrashLog, listDevices, startMonkey } = require('./src/adb');

let mainWindow;
let activeRun;
let activeAdbPath;
let stopRequested = false;

app.setAppUserModelId('com.reporterplus.crashscout');

function isTrustedSender(event) {
  if (!mainWindow || event.sender !== mainWindow.webContents) return false;
  try {
    const senderPath = decodeURIComponent(new URL(event.senderFrame.url).pathname);
    return path.resolve(senderPath) === path.resolve(__dirname, 'app/index.html');
  } catch {
    return false;
  }
}

function assertTrustedSender(event) {
  if (!isTrustedSender(event)) throw new Error('Blocked an IPC request from an untrusted page.');
}

function sendToRenderer(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, payload);
}

function registerIpc() {
  ipcMain.handle('adb:detect', async (event, override) => {
    assertTrustedSender(event);
    const adb = await findAdb(typeof override === 'string' ? override : undefined);
    activeAdbPath = adb.path;
    return adb;
  });

  ipcMain.handle('adb:devices', async (event) => {
    assertTrustedSender(event);
    if (!activeAdbPath) throw new Error('Detect ADB before refreshing devices.');
    return listDevices(activeAdbPath);
  });

  ipcMain.handle('monkey:start', async (event, options) => {
    assertTrustedSender(event);
    if (!activeAdbPath) throw new Error('Detect ADB before starting a test.');
    if (activeRun) throw new Error('A stress test is already running.');

    const output = [];
    let outputSize = 0;
    stopRequested = false;
    let finished = false;
    const finish = async (result) => {
      if (finished) return;
      finished = true;
      const summary = classifyMonkeyResult(output.join(''), { ...result, stopped: stopRequested });
      if (summary.outcome === 'crash' || summary.outcome === 'anr') {
        summary.crashLog = await getRecentCrashLog(activeAdbPath, activeRun.runOptions.device);
      }
      activeRun = undefined;
      stopRequested = false;
      sendToRenderer('monkey:finished', { ...result, ...summary });
    };

    activeRun = startMonkey(activeAdbPath, options, {
      onOutput: (stream, text) => {
        output.push(text);
        outputSize += text.length;
        while (outputSize > 2_000_000 && output.length > 1) outputSize -= output.shift().length;
        sendToRenderer('monkey:output', { stream, text });
      },
      onError: (error) => finish({ code: null, error: error.message }),
      onClose: ({ code, signal }) => finish({ code, signal }),
    });
    return { started: true, pid: activeRun.pid };
  });

  ipcMain.handle('monkey:stop', async (event) => {
    assertTrustedSender(event);
    if (!activeRun) return { stopped: false };
    stopRequested = true;
    const stopped = activeRun.kill('SIGTERM');
    return { stopped };
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 920,
    height: 720,
    minWidth: 720,
    minHeight: 600,
    backgroundColor: '#0b1220',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.removeMenu();
  mainWindow.loadFile(path.join(__dirname, 'app/index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());
  mainWindow.on('closed', () => { mainWindow = undefined; });
}

app.whenReady().then(() => {
  registerIpc();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => activeRun?.kill('SIGTERM'));
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
