const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mailSchema = new Schema({
  id: {type: Number, unique: true},
  fromUserId: { type: Number, required: true },
  toUserId: { type: Number },
  ownId: { type: Number, required: true },
  subject: { type: String},
  body: { type: String},
  timestamp: { type: Date, default: Date.now },
  labels: [{ type: String }], 
  isDraft: { type: Boolean, default: false }
});

mailSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});


module.exports = mongoose.model('Mail', mailSchema);
