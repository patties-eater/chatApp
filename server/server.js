// server/server.js

require('dotenv').config();
import Message, { find } from "./models/Message";
console.log('🔍 Mongo URI:', process.env.MONGO_URI); // Debug log

import express from "express";
import { createServer } from "http";
import cors from "cors";
import { connect } from "mongoose";
import { Server } from "socket.io";
import Message from "./models/Message";

const app = express();
app.use(cors());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React frontend origin
    methods: ["GET", "POST"]
  }
});

// 💾 MongoDB Connection
connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

// ⚡ Socket.IO
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // 1️⃣ Send all previous messages
  find({})
    .then(messages => {
      socket.emit("previous_messages", messages);
    })
    .catch(err => console.log("❌ Error fetching messages:", err));

  // 2️⃣ Handle new message from client
  socket.on("send_message", async (data) => {
    try {
      const newMessage = new Message({ message: data.message });
      await newMessage.save();

      io.emit("receive_message", data);
    } catch (err) {
      console.log("❌ Error saving message:", err);
    }
  });

  // 3️⃣ Handle disconnect
  socket.on("disconnect", () => {
    console.log("⛔ User disconnected:", socket.id);
  });
});

// 🟢 Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
