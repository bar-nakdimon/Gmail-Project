// Import the reusable TCP command function from utils
const { sendTcpCommand } = require('../utils/tcpClient');

/**
 * Service to check whether a URL is blacklisted via the TCP Bloom filter server.
 */
class BlacklistService {
  constructor() {
    this.urlMap = new Map(); // id -> url
    this.counter = 1;
  }

  addUrl(url) {
    const id = this.counter++;
    this.urlMap.set(id, url);
    return id;
  }

  getUrlById(id) {
    return this.urlMap.get(id);
  }

  deleteUrlById(id) {
    return this.urlMap.delete(id);
  }

  /**
   * Sends a "GET <url>" command to the TCP server and interprets the result.
   * @param {string} url - The URL to check.
   * @returns {Promise<boolean>} - true if blacklisted, false otherwise.
   */
  async checkUrl(url) {
    try {
      // Send the GET command to the TCP server and wait for the response (e.g., "true true\n")
      const rawResponse = await sendTcpCommand(`GET ${url}`);

      // Split the response by lines and trim whitespace (in case of multiple lines or trailing \n)
      const lines = rawResponse.split('\n').map(line => line.trim());

      // Check if the response contains the exact string "true true"
      // This means: Bloom filter matched AND the URL is in the actual blacklist set
      return lines.includes('true true');

    } catch (err) {
      // In case of a connection error or any unexpected issue, log and safely return false
      console.error(`Blacklist check failed for ${url}:`, err.message);
      return false;
    }
  }
}

// Export an instance of the service so it can be used elsewhere in the app
module.exports = new BlacklistService();
