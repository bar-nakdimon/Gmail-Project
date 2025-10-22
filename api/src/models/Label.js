const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const labelSchema = new Schema({
  id: { type: String, required: true }, 
  name: { type: String, required: true },
  description: { type: String },
  userId: { type: Number, required: true },
  order: { type: Number, default: 999 }
});

labelSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

labelSchema.index({ userId: 1, id: 1 }, { unique: true }); 

module.exports = mongoose.model('Label', labelSchema);
