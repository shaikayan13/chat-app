const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

// Keep track of users in rooms (simple)
let users = {}; // socketId -> username

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // New user joins
  socket.on("join", (username) => {
    users[socket.id] = username || "Anonymous";
    io.emit("user-list", Object.values(users));
    io.emit("system-message", `${users[socket.id]} joined the chat`);
  });

  // Receive message from client
  socket.on("chat-message", (data) => {
    // data: { text }
    const payload = {
      text: data.text,
      user: users[socket.id] || "Anonymous",
      time: new Date().toISOString()
    };
    io.emit("chat-message", payload);
  });

  // Typing indicator
  socket.on("typing", (isTyping) => {
    socket.broadcast.emit("typing", { user: users[socket.id], typing: isTyping });
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      io.emit("system-message", `${users[socket.id]} left the chat`);
      delete users[socket.id];
      io.emit("user-list", Object.values(users));
    }
    console.log("Disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
