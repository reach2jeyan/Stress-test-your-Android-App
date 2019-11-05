console.log('first js.js');
//var cmd     = require('node-command-line'),Promise = require('bluebird');
var cmd=require('node-cmd');
const { exec } = require('child_process').exec;
const path = require('path');
const os = require('os');

const child_process = require('child_process');

if(localStorage.getItem("path")){ 
    window.location="index.html";
}
document.querySelector('#validateadbpath').addEventListener('click', navigate);
document.querySelector('#getadbpath').addEventListener('click', determineOS);
function navigate(){
    if(document.getElementById('enteradbpath').value!=''){
        localStorage.setItem('path',document.getElementById('enteradbpath').value)
        window.location='index.html';
    }else{
        alert("You cant proceed without entering this")
    }
}

function determineOS() {
    if (process.platform === "win32") {
        alert("We detected you are using windows. Please type 'adb' in your command prompt and copy the value from 'Installed at'")
    }
    else {
        const { app } = require ('electron').remote;
        const atPath = app.getPath ('desktop');
        const { spawn } = require ('child_process');
        let openTerminalAtPath = spawn ('open', [ '-a', 'Terminal', atPath ]);
        openTerminalAtPath.on ('error', (err) => { console.log (err); });

    }
}
function deletelocalstorage() {
    window.localStorage.clear();
}


