const mongoose = require("mongoose");
const RateSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  unitsConsumed: {
    type: Number,
    required: true,
  },
  slabUsed: {
    slabValues: {
      type: Array,
      required: true,
    },
    slabId: {
      type: String,
      required: true,
    },
  },
  totalRate: {
    type: Number,
    required: true,
  },
  billedMonth: {
    month: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("rates", RateSchema);
