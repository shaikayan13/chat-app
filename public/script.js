const socket = io();

// DOM elements
const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const usersList = document.getElementById("usersList");
const messagesEl = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const typingIndicator = document.getElementById("typingIndicator");
const chatTitle = document.getElementById("chatTitle");

let myName = null;
let typingTimeout = null;

// Helpers
function addMessage(text, meta = {}) {
  const li = document.createElement("li");
  if (meta.system) {
    li.className = "system";
    li.textContent = text;
  } else {
    li.className = "msg" + (meta.me ? " me" : "");
    const metaDiv = document.createElement("div");
    metaDiv.className = "meta";
    metaDiv.textContent = `${meta.user} • ${new Date(meta.time).toLocaleTimeString()}`;
    const txt = document.createElement("div");
    txt.textContent = text;
    li.appendChild(metaDiv);
    li.appendChild(txt);
  }
  messagesEl.appendChild(li);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function updateUserList(list) {
  usersList.innerHTML = "";
  list.forEach(u => {
    const li = document.createElement("li");
    li.textContent = u;
    usersList.appendChild(li);
  });
}

// Join
joinBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (!name) return alert("Please enter your name to join.");
  myName = name;
  socket.emit("join", name);
  chatTitle.textContent = `Global Chat — ${myName}`;
  usernameInput.disabled = true;
  joinBtn.disabled = true;
  messageInput.focus();
});

// Receive user list
socket.on("user-list", (list) => {
  updateUserList(list);
});

// System messages
socket.on("system-message", (txt) => {
  addMessage(txt, { system: true });
});

// Chat messages from server
socket.on("chat-message", (payload) => {
  const me = payload.user === myName;
  addMessage(payload.text, { user: payload.user, time: payload.time, me });
});

// Typing indicator
socket.on("typing", (data) => {
  if (data.typing) {
    typingIndicator.textContent = `${data.user} is typing...`;
  } else {
    typingIndicator.textContent = "";
  }
});

// Send message
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  // locally render immediate message
  addMessage(text, { user: myName || "You", time: new Date().toISOString(), me: true });
  socket.emit("chat-message", { text });
  messageInput.value = "";
  socket.emit("typing", false);
});

// Typing detection
messageInput.addEventListener("input", () => {
  if (!myName) return;
  socket.emit("typing", true);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("typing", false);
  }, 900);
});
