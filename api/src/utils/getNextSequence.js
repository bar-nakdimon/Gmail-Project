const Counter = require('../models/Counter');

/**
 * Returns the next sequence number for a given entity (e.g. 'mail', 'user', 'blacklist')
 * Creates a new counter if it doesn't exist yet.
 * @param {string} entityName - The _id of the counter document (e.g. 'mail')
 * @returns {Promise<number>} - The next sequence number
 */
async function getNextSequence(entityName) {
  const counter = await Counter.findByIdAndUpdate(
    { _id: entityName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

module.exports = getNextSequence;
