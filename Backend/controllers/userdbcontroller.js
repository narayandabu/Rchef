const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

function getUserDB(email) {
  // Sanitize and encode the email to use as a folder name
  const userFolder = email; // in case you ever use characters needing escaping
  const dbPath = path.join(__dirname, '../database', userFolder, 'main.db');
  // console.log("User DB Path:", dbPath);
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database not found for user: ${email}`);
  }

  return new sqlite3.Database(dbPath);
}

module.exports = getUserDB;
