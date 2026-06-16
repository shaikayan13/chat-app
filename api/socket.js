// First wake up serverless function
fetch("/api/socket").then(() => {
  const socket = io({
    path: "/api/socket",
  });

  const loginDiv = document.getElementById("login");
  const chatDiv = document.getElementById("chat");
  const messages = document.getElementById("messages");
  const form = document.getElementById("form");
  const input = document.getElementById("input");
  const joinBtn = document.getElementById("joinBtn");
  const usernameInput = document.getElementById("username");

  let myName = "";

  joinBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    if (!username) return alert("Enter your name");

    myName = username;
    socket.emit("join", username);

    loginDiv.classList.add("hidden");
    chatDiv.classList.remove("hidden");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!input.value.trim()) return;

    socket.emit("chat-message", input.value);
    input.value = "";
  });

  socket.on("chat-message", (data) => {
    const li = document.createElement("li");
    li.textContent = `${data.user}: ${data.text}`;

    if (data.user === myName) {
      li.classList.add("me");
    }

    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  });

  socket.on("system-message", (msg) => {
    const li = document.createElement("li");
    li.textContent = msg;
    li.classList.add("system");
    messages.appendChild(li);
  });
});
