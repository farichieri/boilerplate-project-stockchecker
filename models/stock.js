const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  stock: {
    type: String,
    required: true,
    unique: true,
  },
  likes: {
    type: Number,
    required: true,
    defaultValue: 0,
  },
  ips: {
    type: Array,
    required: true,
  },
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
