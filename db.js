require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);;
const mongoURI = process.env.MONGODB_URI
const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error(
      "Following error occurred while connecting to MongoDB",
      error
    );
  }
};
module.exports = connectToMongo;
