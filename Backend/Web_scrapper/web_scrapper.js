const axios = require("axios");
const cheerio = require("cheerio");

const scrapeWebsite = async (url) => {
  try {
    if (!url.startsWith("http")) {
      throw new Error("Invalid URL: URL must start with http or https.");
    }
    const response = await axios.get(url, { timeout: 10000 }); // 10s timeout
    if (response.status !== 200) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const $ = cheerio.load(response.data);
    const title = $("title").text();
    const paragraphs = $("p").map((i, el) => $(el).text()).get();
    const articles = $("article").map((i, el) => $(el).text().trim()).get(); 
    let str = '';
    for(let i = 0;i<Math.min(100,paragraphs.length);++i){
        if(paragraphs[i] == '\n')paragraphs[i]='';
        str+=paragraphs[i];
        if(str.length >=300)break;
    }
    return {success: true, data:str};
    
  } catch (error) {
    return { success: false, message: error.message || "Unknown error occurred" };
  }
};
module.exports = {
  scrapeWebsite
};
