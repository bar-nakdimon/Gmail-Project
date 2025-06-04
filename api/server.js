const app = require('./app');
const PORT = process.env.PORT || 3000;

// Start the Express server listening on specified port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});