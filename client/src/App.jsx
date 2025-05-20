import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  // Setup listeners
  useEffect(() => {
    socket.on("connect", () => {
      console.log("🟢 Connected to backend with ID:", socket.id);
    });

    socket.on("previous_messages", (messages) => {
      setChat(messages.map((m) => ({ message: m.message, fromSelf: false })));
    });

    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, { message: data.message, fromSelf: false }]);
    });

    return () => {
      socket.off("connect");
      socket.off("previous_messages");
      socket.off("receive_message");
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    const chatContainer = document.getElementById("chat-box");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chat]);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send_message", { message });
      setChat((prev) => [...prev, { message, fromSelf: true }]);
      setMessage("");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "1rem" }}>
      <h1 style={{ textAlign: "center" }}>💬 Chat App</h1>
      <div
        id="chat-box"
        style={{
          height: "300px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "8px",
          background: "#f9f9f9",
        }}
      >
        {chat.map((msg, idx) => (
          <p
            key={idx}
            style={{
              textAlign: msg.fromSelf ? "right" : "left",
              margin: "5px 0",
            }}
          >
            {msg.message}
          </p>
        ))}
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message"
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "5px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
