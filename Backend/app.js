const express = require('express');
const cors = require('cors');
const { initializeUserDB } = require('./utils/db_chat');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const typeRoutes = require('./routes/type');
const papersRoute = require('./routes/papers');
const analyzeRoutes = require('./routes/analyze');
const notifications = require('./routes/notifications');
const userprofile = require('./routes/userprofile');
require('./Scheduler/papersscheduler'); // This runs the job scheduler for fetching papers



// dotenv.config();
const app = express();
const PORT =  5000; //process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize users.db
initializeUserDB();

// Routes
app.use('/api', authRoutes);
app.use('/api', chatRoutes);
app.use('/api', typeRoutes);
app.use('/api/papers', papersRoute);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/notifications', notifications);
app.use('/api/profile',userprofile);
app.get('/', (req, res) => {
  res.status(200).json({ reply: 'Refreshed...' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
