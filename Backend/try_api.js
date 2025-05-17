const { GoogleGenerativeAI } = require("@google/generative-ai");
// import { GoogleGenerativeAI } from "@google/generative-ai";
async function api_call(prompt){
    const genAI = new GoogleGenerativeAI("AIzaSyDrGvN9uOgi4P5bSsITkjEIhYKR-ER_A0c");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
    // console.log(result.response.text());
}
module.exports ={
    api_call
}