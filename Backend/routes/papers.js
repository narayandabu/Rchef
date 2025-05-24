const express = require('express');
const router = express.Router();
const db = require('../controllers/paperscontroller'); // SQLite database connection
const  verifyToken  = require('../middleware/verifyToken'); // Middleware for token verification
const getUserDB = require('../controllers/userdbcontroller'); // Function to get user-specific database
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

router.post('/toggleLike/:paperId', verifyToken , (req, res) => {
  const email = req.user.email;
  const paperId = req.params.paperId;
  const userDB = getUserDB(email);

  userDB.get(`SELECT * FROM liked_papers WHERE paper_id = ?`, [paperId], (err, row) => {
    if (err) return res.status(500).json({ error: 'User DB error' });

    if (row) {
      // Already liked → UNLIKE
      userDB.run(`DELETE FROM liked_papers WHERE paper_id = ?`, [paperId], (err) => {
        if (err) return res.status(500).json({ error: 'Unlike failed (user db)' });

        db.run(
          `UPDATE papers SET like_count = CASE WHEN like_count > 0 THEN like_count - 1 ELSE 0 END WHERE id = ?`,
          [paperId],
          (err) => {
            if (err){ 
               console.log('ERROR :', err);
              return res.status(500).json({ error: 'Unlike failed (main db)' });
                         }
            return res.json({ success: true, liked: false });
          }
        );
      });
    } else {
      // Not liked → LIKE
      userDB.run(
        `INSERT INTO liked_papers (paper_id,is_liked) VALUES (?, 1)`,
        [paperId],
        (err) => {
          if (err) return res.status(500).json({ error: 'Like failed (user db)' });

          db.run(
            `UPDATE papers SET like_count = like_count + 1 WHERE id = ?`,
            [paperId],
            (err) => {
              if (err) {
                console.log('ERROR :', err);
                return res.status(500).json({ error: 'Like failed (main db)' });
            }
              return res.json({ success: true, liked: true });
            }
          );
        }
      );
    }
    
    
  });
});
router.get('/liked', verifyToken , async (req, res) => {
  const userEmail = req.user.email;
  const Userdb = getUserDB(userEmail);

  try {
    Userdb.all(`SELECT paper_id FROM liked_papers`, [], async (err, likedRows) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!likedRows || likedRows.length === 0) return res.json([]);

      const paperIds = likedRows.map(row => row.paper_id);

      const fetchPaperById = (paperId) => {
        return new Promise((resolve, reject) => {
          db.get(`SELECT * FROM papers WHERE id = ?`, [paperId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      };

      try {
        const paperDetails = await Promise.all(paperIds.map(fetchPaperById));
        res.json(paperDetails.filter(p => p)); // Remove nulls if any
      } catch (fetchErr) {
        res.status(500).json({ error: fetchErr.message });
      }
    });
  } catch (outerErr) {
    res.status(500).json({ error: outerErr.message });
  }
});



router.get('/isLiked/:paperId',verifyToken , (req, res) => {
  const email = req.user.email;
  // console.log('Checking like status for paperId:', email);
  const paperId = req.params.paperId;
  const userDB = getUserDB(email);
  userDB.get(`SELECT * FROM liked_papers WHERE paper_id = ?`, [paperId], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ liked: !!row });
  });
  // res.json({ liked: false });
});
// TODO: Make the Recommendation system next
// Curently, it returns a static list of recommended papers
// This is a placeholder for the recommendation system
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
