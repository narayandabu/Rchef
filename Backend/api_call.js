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
function api(data, model) {
  return new Promise((resolve, reject) => {
    const pythonPath = 'C://Users//naray//Desktop//Devlopment//MyPython-Ai-ml-Projects//NeuroLinguo_WEB//.venv//Scripts//python.exe';
    const modelPath = path.join(__dirname, 'Aimodel', model);

    const pythonProcess = spawn(pythonPath, [modelPath]);

    pythonProcess.stdin.write(JSON.stringify(data));
    pythonProcess.stdin.end();

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
      }
    });

    pythonProcess.on('error', (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });
  });
}
async function sentiment_api_call(userMessage){
    try{
      const output = await api(userMessage,'Sentiment_Analyzer.py');
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
    const output = await api(userMessage,'PDF_Analyzer.py');
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





module.exports = {
  gemini_api_call,
  sentiment_api_call,
  Link_Analyzer_api_call,
  PDF_Analyzer_api_call
}