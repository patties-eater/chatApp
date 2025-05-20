// server/models/Message.js
const mongoose = require("mongoose"); // ← This line was missing!

const MessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);
