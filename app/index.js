console.log('index js.js');
//var cmd     = require('node-command-line'),Promise = require('bluebird');
var cmd=require('node-cmd');
const { exec } = require('child_process');
document.querySelector('#btnEd').addEventListener('click', runSingleCommandWithoutWait);
document.querySelector('#btnSubmit').addEventListener('click', runTestfunction);
function selectFunction(data){  
    var devices=data.trim().split('\n');
    document.getElementById('selectId').innerHTML='';
    for(x=1;x<devices.length;x++){
    var option = "<option value='" + devices[x] + "'>" + devices[x] + "</option>";
    document.getElementById('selectId').innerHTML += option;   
    } 
} 

function runSingleCommandWithoutWait() {
    var androidSdkPath = localStorage.getItem('megatron');
    if(androidSdkPath == '') {
        alert("Android sdk path is required");
        return;
    }
    var command = androidSdkPath +" devices";
    try{
        exec(androidSdkPath+' devices', (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              alert(error);
              return;
            }else{
                console.log(`stdout: ${stdout}`);
                selectFunction(stdout);
            }
          });
    }catch(e){
        alert(e);
        localStorage.removeItem('megatron');
        window.location="first.html";
    }
   }
   //com.deserve.deserve
   function runTestfunction(){
       let Packagename=document.getElementById("package").value;
       let NoofInterrupts=document.getElementById("interrupts").value;
       var SelectedValue=document.getElementById("selectId").value.trim().split(/(\s+)/);
       if(Packagename!='' && NoofInterrupts!='' && SelectedValue!=''){
        exec(localStorage.getItem('megatron')+' -s '+SelectedValue[0]+' shell monkey -p '+Packagename+' --ignore-crashes --ignore-timeouts --monitor-native-crashes -v '+NoofInterrupts+'', (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              alert(error);
            }else{
                console.log(`stdout: ${stdout}`);
                alert("Test Complete. Crash if any notified via crashlytics")
            }
          });
       }else{
           alert("Input package name or Number of interrupts or Select device to run!!");
       }
   }

