const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

// Store users
let users = {}; // socket.id -> username

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // When user joins
  socket.on("join", (username) => {
    users[socket.id] = username;
    socket.broadcast.emit("system-message", `${username} joined the chat`);
    io.emit("user-list", Object.values(users));
  });

  // Receive chat message
  socket.on("chat-message", (message) => {
    io.emit("chat-message", {
      user: users[socket.id],
      text: message
    });
  });

  // When user disconnects
  socket.on("disconnect", () => {
    if (users[socket.id]) {
      io.emit("system-message", `${users[socket.id]} left the chat`);
      delete users[socket.id];
      io.emit("user-list", Object.values(users));
    }
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
