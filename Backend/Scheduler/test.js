const {spawn} = require('child_process');
const path = require('path');


function py_api(data){
    return new Promise((resolve, reject) => {
    const pythonPath = 'C://Users//naray//Desktop//Devlopment//webdev//NeuroLinguo_WEB//.venv//Scripts//python.exe';
    const model_path = path.join(__dirname, 'tag_generator', 'Paper_tagger.py');
    const pythonProcess = spawn(pythonPath,[model_path])
    try { 
        pythonProcess.stdin.write(JSON.stringify(data));
        pythonProcess.stdin.end();
        pythonProcess.stdout.on('data', (data) => {
            data = data.toString('utf-8');
            pythonProcess.kill('SIGINT');
            console.log(data);
            resolve(data);
        });
    }
    catch (err) {
        pythonProcess.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`);
        });
        pythonProcess.on('close', (code) => {
          console.log(`Python process exited with code ${code}`);
        });
        reject(new Error('Error parsing JSON output from Python script: ' + err.message));
    }
    })
}
async function call(){
    try{
        console.log("Python API Called...");
        const data = await py_api('Hellow world it is a test about convolutional neural networks');
        console.log(data);
        return data;
    }    
    catch(error){
        console.error('Error running Python script:', error);
        console.error('Error running Python script:', error);
        return 'error';
    }
}
call();



