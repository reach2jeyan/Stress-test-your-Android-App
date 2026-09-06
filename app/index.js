'use strict';

const elements = {
  adbBadge: document.querySelector('#adbBadge'),
  adbPath: document.querySelector('#adbPath'),
  adbStatus: document.querySelector('#adbStatus'),
  detectAdb: document.querySelector('#detectAdb'),
  refreshDevices: document.querySelector('#refreshDevices'),
  device: document.querySelector('#device'),
  packageName: document.querySelector('#packageName'),
  eventCount: document.querySelector('#eventCount'),
  startTest: document.querySelector('#startTest'),
  stopTest: document.querySelector('#stopTest'),
  runStatus: document.querySelector('#runStatus'),
  result: document.querySelector('#result'),
  resultTitle: document.querySelector('#resultTitle'),
  resultDetail: document.querySelector('#resultDetail'),
  crashDetails: document.querySelector('#crashDetails'),
  crashLog: document.querySelector('#crashLog'),
  clearOutput: document.querySelector('#clearOutput'),
  output: document.querySelector('#output'),
};

let adbReady = false;
let running = false;

function errorMessage(error) {
  return error?.message || String(error);
}

function updateControls() {
  elements.detectAdb.disabled = running;
  elements.refreshDevices.disabled = !adbReady || running;
  elements.device.disabled = !adbReady || running;
  elements.packageName.disabled = running;
  elements.eventCount.disabled = running;
  elements.startTest.disabled = !adbReady || running || !elements.device.value;
  elements.stopTest.disabled = !running;
}

function appendOutput(text, stream = 'stdout') {
  if (elements.output.textContent === 'Ready.') elements.output.textContent = '';
  const marker = stream === 'stderr' ? '[stderr] ' : '';
  elements.output.textContent += marker + text;
  elements.output.scrollTop = elements.output.scrollHeight;
}

function clearResult() {
  elements.result.hidden = true;
  elements.result.className = 'result';
  elements.crashDetails.hidden = true;
  elements.crashDetails.open = false;
  elements.crashLog.textContent = '';
}

function showResult({ outcome, title, detail, crashLog }) {
  elements.result.className = `result result-${outcome}`;
  elements.resultTitle.textContent = title;
  elements.resultDetail.textContent = detail;
  elements.crashDetails.hidden = !crashLog;
  elements.crashLog.textContent = crashLog || '';
  elements.result.hidden = false;
}

async function refreshDevices() {
  elements.refreshDevices.disabled = true;
  elements.device.replaceChildren(new Option('Looking for devices…', ''));
  try {
    const devices = await window.appStresser.listDevices();
    const authorized = devices.filter((device) => device.state === 'device');
    const options = [];
    if (!authorized.length) options.push(new Option('No authorized devices found', ''));
    for (const device of authorized) {
      const model = device.details.match(/(?:^|\s)model:([^\s]+)/)?.[1]?.replaceAll('_', ' ');
      options.push(new Option(model ? `${model} — ${device.serial}` : device.serial, device.serial));
    }
    elements.device.replaceChildren(...options);

    const unavailable = devices.filter((device) => device.state !== 'device');
    elements.runStatus.textContent = unavailable.length
      ? `${unavailable.length} offline or unauthorized device${unavailable.length === 1 ? '' : 's'} hidden.`
      : '';
  } catch (error) {
    elements.device.replaceChildren(new Option('Unable to list devices', ''));
    elements.runStatus.textContent = errorMessage(error);
  } finally {
    updateControls();
  }
}

async function detectAdb() {
  elements.detectAdb.disabled = true;
  elements.adbStatus.textContent = 'Detecting ADB…';
  try {
    const adb = await window.appStresser.detectAdb(elements.adbPath.value);
    adbReady = true;
    elements.adbBadge.textContent = 'ADB connected';
    elements.adbBadge.className = 'badge badge-ready';
    elements.adbStatus.textContent = `${adb.version} • ${adb.path}`;
    await refreshDevices();
  } catch (error) {
    adbReady = false;
    elements.adbBadge.textContent = 'ADB unavailable';
    elements.adbBadge.className = 'badge badge-error';
    elements.adbStatus.textContent = errorMessage(error);
  } finally {
    updateControls();
  }
}

async function startTest() {
  clearResult();
  elements.output.textContent = '';
  elements.runStatus.textContent = 'Starting…';
  try {
    await window.appStresser.startMonkey({
      device: elements.device.value,
      packageName: elements.packageName.value,
      events: elements.eventCount.value,
    });
    running = true;
    elements.runStatus.textContent = 'Test running';
    appendOutput(`Starting Monkey on ${elements.device.value}\n`);
  } catch (error) {
    elements.runStatus.textContent = errorMessage(error);
  } finally {
    updateControls();
  }
}

async function stopTest() {
  elements.stopTest.disabled = true;
  elements.runStatus.textContent = 'Stopping…';
  try {
    const result = await window.appStresser.stopMonkey();
    if (!result.stopped) elements.runStatus.textContent = 'No test is running.';
  } catch (error) {
    elements.runStatus.textContent = errorMessage(error);
    updateControls();
  }
}

elements.detectAdb.addEventListener('click', detectAdb);
elements.refreshDevices.addEventListener('click', refreshDevices);
elements.device.addEventListener('change', updateControls);
elements.startTest.addEventListener('click', startTest);
elements.stopTest.addEventListener('click', stopTest);
elements.clearOutput.addEventListener('click', () => { elements.output.textContent = ''; });

window.appStresser.onMonkeyOutput(({ stream, text }) => appendOutput(text, stream));
window.appStresser.onMonkeyFinished((result) => {
  running = false;
  elements.runStatus.textContent = result.title;
  showResult(result);
  updateControls();
});

updateControls();
detectAdb();
