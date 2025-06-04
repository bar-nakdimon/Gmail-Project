const express = require('express');
const app = express();

app.use(express.json());  // Middleware to parse JSON request bodies automatically

// Import mail routes
const mailRoutes = require('./src/routes/mailRoutes');
// Import label routes
const labelRoutes = require('./src/routes/labelRoutes');
// Import user routes
const userRoutes = require('./src/routes/userRoutes');
// Import tokens routes
const tokenRoutes = require('./src/routes/tokenRoutes');
// Import blacklist routes
const blacklistRoutes = require('./src/routes/blacklistRoutes');
// Use mail routes for requests starting with /api/mails
app.use('/api/mails', mailRoutes);
// Use label routes for requests starting with /api/labels
app.use('/api/labels', labelRoutes);
// Use user routes for requests starting with /api/users
app.use('/api/users', userRoutes);
// Use tokens routes for requests starting with /api/tokens 
app.use('/api/tokens', tokenRoutes);
// Use user routes for requests starting with /api/blacklist
app.use('/api/blacklist', blacklistRoutes);

// Add JSON parse error handler here
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next(); // Pass to next error handler if not a JSON error
});

// Catch-all handler for unknown routes, return 404 JSON error
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Export the app object so it can be used by server.js
module.exports = app;