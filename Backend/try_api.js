const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const usersDir = path.join(__dirname, 'database');

function initializeUserLikeTables() {
  const userFolders = fs.readdirSync(usersDir).filter(folder => {
    const stats = fs.statSync(path.join(usersDir, folder));
    return stats.isDirectory();
  });

  userFolders.forEach((userFolder) => {
    const userDbPath = path.join(usersDir, userFolder, 'main.db');
    if (fs.existsSync(userDbPath)) {
      const db = new sqlite3.Database(userDbPath);

      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS liked_papers (
            paper_id TEXT PRIMARY KEY,
            is_liked BOOLEAN DEFAULT 0
          )
        `, (err) => {
          if (err) {
            console.error(`Failed to create table for ${userFolder}:`, err.message);
          } else {
            console.log(`Initialized liked_papers for ${userFolder}`);
          }
        });
      });

      db.close();
    } else {
      console.warn(`main.db not found for ${userFolder}`);
    }
  });
}

initializeUserLikeTables();
