const path = require('path');
const { spawn } = require('child_process');
const {scrapeWebsite} = require('./Web_scrapper/web_scrapper.js')

const default_sentiment_Text = "**Sentiments Of the Text Found To Be :** ";


function clean_text(text){
  result = text.split("\n");
  result = result[result.length-2];
  result = result.replace('[','');
  result = result.replace(']','');
  result = result.replace("'",'');
  result = result.replace("'",'');
  result = result.replace('\n','');
  return result;
}
// Python Sentiment Analysis...
function py_api(data,model_path){
    return new Promise((resolve, reject) => {
    const pythonPath = 'C://Users//naray//OneDrive//Desktop//Devlopment//webdev//NeuroLinguo_WEB//.venv//Scripts//python.exe';
    const model_path = path.join(__dirname,'Aimodel',model_path);
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
async function sentiment_api_call(userMessage){
    try{
      const output = await py_api(userMessage,'Sentiment_Analyzer.py');
      const result = clean_text(output);
      return default_sentiment_Text + result;
    }
    catch(error){
      console.error('Error running Python script:', error);
    }
}
// PDF Analyzer
async function PDF_Analyzer_api_call(userMessage){
  try{
    console.log("PDF Analyzer Called...");
    console.log(userMessage);
    const output = await py_api(userMessage,'PDF_Analyzer.py');
    console.log(output);
    return 'Conducted Success-fully';
  }
  catch(error){
    console.error('Error running Python script:', error);
  }

  return "NOT Available Yet";
}


// Gemini API
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { type } = require('os');
async function gemini_api_call(prompt){
      const API_KEY = "AIzaSyDrGvN9uOgi4P5bSsITkjEIhYKR-ER_A0c";
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
}

// Web Scrapper
async function Link_Analyzer_api_call(prompt){
  const scrapped = await scrapeWebsite(prompt);
  if(scrapped.success == true){
    return scrapped.data;
  }
  else{
    console.log(scrapped.message);
    return "Something Went Wrong!!!";
  }

}
async function call_user_choice(choice, prompt) {
  if (choice === 'Sentiment') return await sentiment_api_call(prompt);
  else if (choice === 'Gemini') return await gemini_api_call(prompt);
  else if (choice === 'Link_Analyzer') return await Link_Analyzer_api_call(prompt);
  else return await PDF_Analyzer_api_call(prompt);
}




module.exports = {
  call_user_choice,
  gemini_api_call,
  sentiment_api_call,
  Link_Analyzer_api_call,
  PDF_Analyzer_api_call
}