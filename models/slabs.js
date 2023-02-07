const mongoose = require("mongoose");
const SlabSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  slabValues:{
   type: Array,
   required: true
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("slab", SlabSchema);
