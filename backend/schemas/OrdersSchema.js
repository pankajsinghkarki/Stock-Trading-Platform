const { Schema } = require("mongoose");

const OrdersSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  mode: {
    type: String,
    enum: ["BUY", "SELL"],
    default: "BUY",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = { OrdersSchema };
