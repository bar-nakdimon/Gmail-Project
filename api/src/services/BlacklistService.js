const { sendTcpCommand } = require('../utils/tcpClient');
const Blacklist = require('../models/Blacklist');

class BlacklistService {
  async addUrl(url) {
    try {
      const existing = await Blacklist.findOne({ url });
      if (existing) return existing.id;

      const doc = new Blacklist({ url });
      const saved = await doc.save();
      return saved._id.toString();
    } catch (err) {
      throw new Error('Failed to add URL to DB');
    }
  }

  async getUrlById(id) {
    try {
      const doc = await Blacklist.findById(id);
      return doc ? doc.url : null;
    } catch {
      return null;
    }
  }
  async getByUrl(url) {
  try {
    return await Blacklist.findOne({ url }).lean();
  } catch {
    return null;
  }
}


  async deleteUrlById(id) {
    try {
      const doc = await Blacklist.findByIdAndDelete(id);
      return !!doc;
    } catch {
      return false;
    }
  }
async checkUrl(url) {
  try {
    const rawResponse = await sendTcpCommand(`GET ${url}`);
    console.log(`🧪 GET ${url} →`, JSON.stringify(rawResponse));
    const lines = rawResponse.split('\n').map(line => line.trim());
    return lines.includes('true true');
  } catch (err) {
    console.error(`Blacklist check failed for ${url}:`, err.message);
    return false;
  }
}
}

module.exports = new BlacklistService();
