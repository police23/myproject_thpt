const mongoose = require('mongoose');


const VisitsCounterSchema = new mongoose.Schema({
  date: { type: String, required: true }, // yyyy-mm-dd
  count: { type: Number, default: 0 }
});

module.exports = mongoose.model('VisitsCounter', VisitsCounterSchema);
