// Function to extract URLs from text
function extractUrls(text) {
// Match all URLs with or without http/https, optionally starting with www,
// and containing a valid domain and optional path after the domain.
const urlRegex = /((https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?)/g;

  // Find and return all matches, or an empty array if none found
  return text.match(urlRegex) || [];
}

// Export the function so other modules (e.g., MailController) can use it
module.exports = {
  extractUrls
};
