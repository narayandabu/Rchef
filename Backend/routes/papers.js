const express = require('express');
const router = express.Router();
const db = require('../controllers/paperscontroller'); // SQLite database connection

// Helper function to insert paper into the database


router.get('/arxiv', async (req, res) => {
  db.all(`SELECT * FROM papers WHERE source = 'arXiv' ORDER BY year DESC LIMIT 30`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

router.get('/pubmed', async (req, res) => {
  db.all(`SELECT * FROM papers WHERE source = 'PubMed' ORDER BY year DESC LIMIT 30`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// TODO: Make the Recommendation system next
router.get('/recommended', (req, res) => {
  const samplePapers = [
    {
      title: "A Survey on Transformer Architectures",
      authors: "Jane Doe, John Smith",
      abstract: "This paper provides a comprehensive overview of transformer-based architectures...",
      journal: "IEEE Transactions on Neural Networks",
      year: 2024,
      link: "https://arxiv.org/abs/2401.12345",
      source: "arXiv",
      tags: []
    },
    {
      title: "Efficient NLP with Low-Rank Adaptation",
      authors: "Emily Zhang",
      abstract: "Low-rank adaptation has shown promise in fine-tuning language models with fewer parameters...",
      journal: "ACL 2023",
      year: 2023,
      link: "https://arxiv.org/abs/2305.45678",
      source: "arXiv",
      tags: []
    }
  ];

  res.json(samplePapers);
});

module.exports = router;
