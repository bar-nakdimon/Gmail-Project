const { sendTcpCommand } = require('../utils/tcpClient');
const blacklistService = require('../services/BlacklistService');

async function addToBlacklist(req, res) {
  const url = req.body.url;
  if (!url) return res.status(400).json({ error: 'Missing url' });

  try {
    const response = await sendTcpCommand(`POST ${url}`);
    if (response.startsWith('201')) {
      const id = await blacklistService.addUrl(url);
      return res.status(201).json({
        message: `url '${url}' added to blacklist.`,
        id
      });
    } else {
      return res.status(400).json({ error: response });
    }
  } catch (err) {
    return res.status(500).json({ error: 'TCP error', details: err.message });
  }
}

async function removeFromBlacklist(req, res) {
  const id = req.params.id;

  const url = await blacklistService.getUrlById(id);
  if (!url) return res.status(404).json({ error: 'URL not found in mapping' });

  try {
    const response = await sendTcpCommand(`DELETE ${url}`);
    if (response.startsWith('204')) {
      await blacklistService.deleteUrlById(id);
      return res.status(204).send();
    } else if (response.startsWith('404')) {
      return res.status(404).json({ error: 'URL not found in blacklist' });
    } else if (response.startsWith('400')) {
      return res.status(400).json({ error: 'Bad request' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'TCP error', details: err.message });
  }
}

module.exports = {
  addToBlacklist,
  removeFromBlacklist
};
