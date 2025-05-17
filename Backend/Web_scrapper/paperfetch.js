// controllers/paperFetchJobs.js
const axios = require('axios');
const xml2js = require('xml2js');
const db = require('../controllers/paperscontroller'); // SQLite connection

const insertPaperIntoDB = (paper) => {
  const insertQuery = `
    INSERT OR IGNORE INTO papers (title, authors, abstract, journal, year, link, source, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(insertQuery, [
    paper.title,
    paper.authors,
    paper.abstract,
    paper.journal,
    paper.year,
    paper.link,
    paper.source,
    JSON.stringify(paper.tags || [])
  ]);
};

async function fetchArxiv(category = 'cs.AI', maxResults = 20) {
  try {
    const arxivUrl = `http://export.arxiv.org/api/query?search_query=cat:${category}&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`;

    const response = await axios.get(arxivUrl);
    const xml = response.data;

    xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error('Error parsing arXiv XML:', err);
        return;
      }

      const entries = result.feed.entry;
      const papers = Array.isArray(entries) ? entries : [entries];

      const formattedPapers = papers.map((paper) => ({
        title: paper.title.trim(),
        authors: Array.isArray(paper.author)
          ? paper.author.map((author) => author.name).join(', ')
          : paper.author.name,
        abstract: paper.summary.trim(),
        journal: paper['arxiv:journal_ref'] || 'arXiv',
        year: new Date(paper.published).getFullYear(),
        link: paper.id,
        source: 'arXiv',
        tags: []
      }));

      formattedPapers.forEach(insertPaperIntoDB);
    });
  } catch (error) {
    console.error('Error fetching from arXiv:', error);
  }
}

async function fetchPubmed(term = 'artificial intelligence', maxResults = 20) {
  try {
    const esearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmax=${maxResults}&retmode=json`;

    const searchResponse = await axios.get(esearchUrl);
    const idList = searchResponse.data.esearchresult.idlist;

    if (!idList.length) {
      console.warn('No PubMed papers found for the term:', term);
      return;
    }

    const efetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${idList.join(',')}&retmode=xml`;
    const fetchResponse = await axios.get(efetchUrl);
    const xml = fetchResponse.data;

    xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error('Error parsing PubMed XML:', err);
        return;
      }

      const articles = result.PubmedArticleSet.PubmedArticle;
      const papers = Array.isArray(articles) ? articles : [articles];

      const formattedPapers = papers.map((paper) => {
        const article = paper.MedlineCitation.Article || {};
        const title = article.ArticleTitle || 'No title available';

        let abstract = '';
        const abstractText = article.Abstract?.AbstractText;
        if (typeof abstractText === 'string') {
          abstract = abstractText;
        } else if (Array.isArray(abstractText)) {
          abstract = abstractText.join(' ');
        } else if (typeof abstractText === 'object' && '_' in abstractText) {
          abstract = abstractText._;
        }

        let authorsList = 'Unknown';
        const authors = article.AuthorList?.Author;
        if (Array.isArray(authors)) {
          authorsList = authors
            .map((author) => (author.LastName && author.ForeName) ? `${author.ForeName} ${author.LastName}` : null)
            .filter(Boolean)
            .join(', ');
        } else if (authors?.LastName && authors?.ForeName) {
          authorsList = `${authors.ForeName} ${authors.LastName}`;
        }

        const journal = article.Journal?.Title || 'PubMed';
        const year = parseInt(article.Journal?.JournalIssue?.PubDate?.Year) || new Date().getFullYear();
        const link = `https://pubmed.ncbi.nlm.nih.gov/${paper.MedlineCitation.PMID._}`;

        return {
          title: title.trim(),
          authors: authorsList,
          abstract: abstract.trim(),
          journal,
          year,
          link,
          source: 'PubMed',
          tags: []
        };
      });

      formattedPapers.forEach(insertPaperIntoDB);
    });
  } catch (error) {
    console.error('Error fetching from PubMed:', error);
  }
}

module.exports = { fetchArxiv, fetchPubmed };
