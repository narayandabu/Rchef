const fetch = require('node-fetch');
const { parseString } = require('xml2js');
const sqlite3 = require('sqlite3').verbose(); // Enable verbose mode for better error messages

// Path to the SQLite database file
const dbPath = 'C:/Users/naray/Desktop/Devlopment/MyPython-Ai-ml-Projects/NeuroLinguo_WEB/Backend/database/arxiv_papers.db';
let db;

async function connectDB(){
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error connecting to SQLite:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database.');
      resolve(db);
    });
  });
}

async function createTableIfNotExists(db) {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS papers (
        search_query TEXT,
        arxiv_id TEXT PRIMARY KEY,
        title TEXT,
        authors TEXT,
        summary TEXT,
        pdf_link TEXT,
        published TEXT,
        updated TEXT,
        primary_category TEXT,
        categories TEXT,
        comment TEXT,
        journal_ref TEXT,
        doi TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
        reject(err);
        return;
      }
      console.log('Papers table created or already exists.');
      resolve();
    });
  });
}

async function storePapersInDB(db, papers, searchQuery) {
  if (papers && papers.length > 0) {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO papers (search_query, arxiv_id, title, authors, summary, pdf_link, published, updated, primary_category, categories, comment, journal_ref, doi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    try {
      for (const paper of papers) {
        stmt.run(
          searchQuery,
          paper.id,
          paper.title,
          paper.authors.join(', '), 
          paper.summary,
          paper.pdfLink,
          paper.published,
          paper.updated,
          paper.primaryCategory,
          paper.categories.join(','),
          paper.comment,
          paper.journalRef,
          paper.doi
        );
      }
      await new Promise((resolve, reject) => {
        stmt.finalize((err) => {
          if (err) {
            console.error('Error finalizing statement:', err.message);
            reject(err);
            return;
          }
          console.log(`Stored ${papers.length} papers for query "${searchQuery}" in SQLite.`);
          resolve();
        });
      });
    } catch (error) {
      console.error(`Error inserting papers for query "${searchQuery}":`, error);
    }
  } else {
    console.log(`No papers to store for query "${searchQuery}".`);
  }
}

async function closeDB(db) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error('Error closing SQLite database:', err.message);
        reject(err);
        return;
      }
      console.log('Closed SQLite database connection.');
      resolve();
    });
  });
}

async function fetchArxivData(searchQuery, maxResults = 10) {
  const baseUrl = 'http://export.arxiv.org/api/query?';
  const queryParams = new URLSearchParams({
    search_query: `all:${searchQuery}`, // Search in all fields
    start: 0,
    max_results: maxResults,
  });
  const apiUrl = baseUrl + queryParams.toString();

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const xmlData = await response.text();

    return new Promise((resolve, reject) => {
      parseString(xmlData, { explicitArray: false }, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result.feed.entry || []); // Handle case with no results
      });
    });
  } catch (error) {
    console.error(`Error fetching data for "${searchQuery}":`, error);
    return [];
  }
}

async function scrapeMultipleSearches(searchQueries, n = 10) {
  let dbConnection;
  try {
    dbConnection = await connectDB();
    await createTableIfNotExists(dbConnection);
    const allResults = {};

    for (const query of searchQueries) {
      console.log(`Searching arXiv for: "${query}" (Top ${n} results)`);
      const papers = await fetchArxivData(query, n);
      const processedPapers = papers.map(paper => ({
        id: paper.id,
        title: paper.title,
        authors: Array.isArray(paper.author)
          ? paper.author.map(a => a.name)
          : [paper.author.name],
        summary: paper.summary,
        pdfLink: Array.isArray(paper.link)
          ? paper.link.find(link => link.$.title === 'pdf')?.$.href
          : paper.link.$.href,
        published: paper.published,
        updated: paper.updated,
        primaryCategory: paper['arxiv:primary_category']?.$.term,
        categories: Array.isArray(paper.category)
          ? paper.category.map(cat => cat.$.term)
          : [paper.category.$.term],
        comment: paper['arxiv:comment'],
        journalRef: paper['arxiv:journal_ref'],
        doi: paper['arxiv:doi']?._,
      }));
      allResults[query] = processedPapers;
      await storePapersInDB(dbConnection, processedPapers, query);
      console.log(`Processed and stored ${processedPapers.length} papers for "${query}".`);
    }

    await closeDB(dbConnection);
    return allResults;
  } catch (error) {
    console.error("Scraping and storage failed:", error);
    if (dbConnection) {
      await closeDB(dbConnection);
    }
    throw error;
  }
}
const queriesToSearch = [
    "deep learning", 
    "quantum computing",
    "black holes",
    "neural networks",
    "natural language processing",
    "physics",
    "chemistry",
    "biology",
    "astronomy",
    "mathematics",
    "bioinformatics",
    "biochemistry",
    "computer vision",
    "machine learning",
    "artificial intelligence",
    "data science",
    "statistics",
    "economics",
    "finance",
    "social sciences",
    "psychology",
    "mechanics",
    "robotics",
    "materials science",
    "environmental science",
    "climate change",
    "genomics",
    "neuroscience",
    "genetics",
    "cell biology",
    "biophysics",
    "atomic physics",
    "particle physics",
    "astrophysics",
    "theoretical physics",
    "applied physics",
    "condensed matter physics",
    "optics",
    "photonics",
    "nanotechnology",
    "semiconductors",
    "quantum mechanics",
    "quantum information",
    "quantum optics",
    "quantum computing",
    "quantum cryptography",
    "quantum algorithms",
];
const queriesToSearch2 = ["biorobotics",
   "bioinformatics", 
   "biochemistry",
   
   ];
const numberOfPapersPerQuery = 10000;

scrapeMultipleSearches(queriesToSearch, numberOfPapersPerQuery)
  .then(results => {
    console.log("\n--- All Search Results ---");
    console.log(JSON.stringify(results, null, 2));
  })
  .catch(error => {
    console.error("Scraping failed:", error);
  });