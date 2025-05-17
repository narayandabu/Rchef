const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();
const fs = require('node:fs/promises'); // For asynchronous file writing (optional logging)

async function scrapeWebsite(url, keyword, db) {
  console.log(`Scraping: ${url} for keyword: ${keyword}`);
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'YourBot/1.0', // Be polite and identify your bot
      },
    });
    if (response.status >= 400) {
        throw new Error(`Request failed with status code ${response.status}`);
      }
    const $ = cheerio.load(response.data);
    const results = [];

    $('article').each((i, el) => { // Example: Assuming articles contain paper info
      const titleElement = $(el).find('h2 a'); // Example: Title in h2 with a link
      const abstractElement = $(el).find('.abstract p'); // Example: Abstract in a paragraph with class 'abstract'
      const authorsElement = $(el).find('.authors'); // Example: Authors in a div with class 'authors'
      const linkElement = $(el).find('a[href*="paper/"]'); // Example: Link containing 'paper/'

      const title = titleElement ? titleElement.text().trim().replace(/\n/g, ' ') : null;
      const abstract = abstractElement ? abstractElement.text().trim().replace(/\n/g, ' ') : null;
      const authorsText = authorsElement ? authorsElement.text().trim().replace(/\n/g, ' ') : null;
      const link = linkElement ? new URL(linkElement.attr('href'), url).href : null; // Make absolute URL

      if (title && abstract && link && title.toLowerCase().includes(keyword.toLowerCase())) {
        const authors = authorsText ? authorsText.split(',').map(a => a.trim()) : [];
        results.push({ title, abstract, authors, link });
      }
    });

    // --- End of website-specific extraction ---

    // Store the scraped data in the database
    for (const item of results) {
      await insertData(db, item, keyword);
    }

    return results.length;

  } catch (error) {
    console.error(`Error scraping ${url}: ${error.message}`);
    return 0;
  }
}

async function insertData(db, data, keyword) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR IGNORE INTO papers (title, authors, abstract, link, tag) VALUES (?, ?, ?, ?, ?)`,
      [data.title, JSON.stringify(data.authors), data.abstract, data.link, keyword],
      (err) => {
        if (err) {
          console.error('Error inserting data:', err.message);
          reject(err);
        } else {
          console.log(`Inserted: ${data.title}`);
          resolve();
        }
      }
    );
  });
}

async function main(websites, keywords) {
  const db = new sqlite3.Database('C:/Users/naray/Desktop/Devlopment/MyPython-Ai-ml-Projects/NeuroLinguo_WEB/Backend/database/scraped_papers.db', (err) => {
    if (err) {
      console.error('Failed to connect to the database:', err.message);
      process.exit(1);
    }
    console.log('Connected to the SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS papers (
        title TEXT,
        authors TEXT,
        abstract TEXT,
        link TEXT UNIQUE,
        tag TEXT
      )
    `);
  });

  let totalScraped = 0;

  for (const url of websites) {
    for (const keyword of keywords) {
      totalScraped += await scrapeWebsite(url, keyword, db);
      // Be respectful and add a delay between requests, especially to the same domain
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
  }

  db.close((err) => {
    if (err) {
      console.error('Failed to close the database connection:', err.message);
    } else {
      console.log('Closed the database connection.');
    }
  });

  console.log(`Successfully scraped and stored ${totalScraped} papers.`);
}

// --- Configuration ---
const targetWebsites = [
  "https://arxiv.org/search/", // Example: arXiv search page (will need to adapt scraping logic)
  "https://www.crossref.org/documentation/public-api/", // Crossref REST API
  "https://datadryad.org/stash/api/v2/",        // Dryad (Research Data Repository with API)
  "https://zenodo.org/oai2d/", 
  "https://www.ncbi.nlm.nih.gov/pmc/",
  "https://www.semanticscholar.org/api/",        // Semantic Scholar API (Check API documentation)
  "https://core.ac.uk/services/api/",           // CORE API (Check API documentation)
  "https://www.base-search.net/",               // BASE (Explore if they have an API)
  "https://oai.openaire.eu/",                  // OpenAIRE API (OAI-PMH)
  "https://pubmed.ncbi.nlm.nih.gov/api/",       // PubMed E-utilities API (Check documentation)
  "https://www.scienceopen.com/",               // ScienceOpen (Explore if they have an API)
  "https://doaj.org/api/v1/",                   // DOAJ API
  "https://api.ies.ed.gov/ERIC/",                // ERIC API
  "https://api.openalex.org/",   
  // Add more websites here
];

const searchKeywords = [
  "machine learning",
  "artificial intelligence",
  "quantum computing",
  "physics",
  "neuroscience",
  "genomics",
  "bioinformatics",
  "climate change",
  "sustainability",
  "data science",
  "astronomy",
  "robotics",
  "chemistry",
  "biotechnology",
  "neuroimaging",
  
  // Add your list of keywords
];

// --- Run the scraper ---
main(targetWebsites, searchKeywords);