console.log('first js.js');
//var cmd     = require('node-command-line'),Promise = require('bluebird');
var cmd=require('node-cmd');
const { exec } = require('child_process').exec;

if(localStorage.getItem("path")){ 
    window.location="index.html";
}
document.querySelector('#btnfirstSubmit').addEventListener('click', navigate);
document.querySelector('#btnadbinfo').addEventListener('click', determineOS);
function navigate(){
    if(document.getElementById('android_sdk_path').value!=''){
        localStorage.setItem('path',document.getElementById('android_sdk_path').value)
        window.location='index.html';
    }else{
        alert("You cant proceed without entering this")
    }
}

function determineOS() {
    const {app} = require('electron');
    if (process.platform === "win32") {
        alert("We detected you are using windows. Please type 'adb' in your command prompt and copy the value from 'Installed at'")
    }
    else {
        alert("we are still working on fetching this, please add your ANDROID_HOME path or WHICH ADB path with upto adb")
        
    }
}
function deletelocalstorage() {
    window.localStorage.clear();
}
