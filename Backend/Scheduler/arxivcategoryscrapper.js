// arxiv-scraper-fixed.js
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://arxiv.org/category_taxonomy';

async function scrapeArxivCategories() {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const categories = [];
    let currentMainCategory = null;

    $('div#category_taxonomy dl').children().each((_, el) => {
      if (el.tagName === 'dt') {
        // Top-level category (main group)
        currentMainCategory = $(el).text().trim();
      } else if (el.tagName === 'dd' && currentMainCategory) {
        const subCategories = [];

        $(el).find('span.subject-full').each((__, subEl) => {
          const fullText = $(subEl).text().trim();
          const codeMatch = fullText.match(/\[(.*?)\]/);
          if (codeMatch) {
            const code = codeMatch[1];
            const name = fullText.replace(/\s*\[.*?\]\s*/, '').trim();
            subCategories.push({ code, name });
          }
        });

        if (subCategories.length > 0) {
          categories.push({
            mainCategory: currentMainCategory,
            subCategories,
          });
        }
      }
    });

    fs.writeFileSync('categories.json', JSON.stringify(categories, null, 2));
    console.log('✅ Fixed: Category data saved to categories.json');
  } catch (err) {
    console.error('❌ Scraping failed:', err.message);
  }
}

scrapeArxivCategories();
