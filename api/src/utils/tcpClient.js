const net = require('net');

/**
 * Sends a command string to the TCP server (C++ backend).
 * @param {string} command - Command to send (e.g., "POST example.com")
 * @returns {Promise<string>} - Resolves with the raw response string.
 */
function sendTcpCommand(command) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let response = '';

    client.connect(5555, 'tcpserver', () => {
      client.write(command + '\n');
    });

    client.on('data', (data) => {
      response += data.toString();
    });

    client.on('end', () => {
      resolve(response.trim());
    });

    client.on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = { sendTcpCommand };
