console.log('first js.js');
//var cmd     = require('node-command-line'),Promise = require('bluebird');
var cmd=require('node-cmd');
const { exec } = require('child_process');

if(localStorage.getItem("megatron")){ 
    window.location="index.html";
}
document.querySelector('#btnfirstSubmit').addEventListener('click', navigate);
document.querySelector('#btnadbinfo').addEventListener('click', determineOS);
function navigate(){
    if(document.getElementById('android_sdk_path').value!=''){
        localStorage.setItem('megatron',document.getElementById('android_sdk_path').value)
        window.location='index.html';
    }else{
        alert("You cant proceed without entering this")
    }
}
function displayadbinfo(command) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
          console.log(`exec error: ${error}`);
          alert(error);
        }else{
          console.log(`stdout: "The adb path is" ${stdout}`);
          alert(stdout)
        }
      });

}
function determineOS() {
    if (process.platform === "win32") {
        alert("We detected you are using windows. Please type 'adb' in your command prompt and copy the value from 'Installed at'")
    }
    else {
        displayadbinfo("which adb")
    }
}