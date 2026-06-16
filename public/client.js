document.addEventListener("DOMContentLoaded", () => {

  import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js").then(({ initializeApp }) => {
    import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js").then(
      ({ getDatabase, ref, push, onChildAdded }) => {

        // 🔥 REAL Firebase config REQUIRED
        const firebaseConfig = {
          apiKey: "YOUR_REAL_API_KEY",
          authDomain: "YOUR_PROJECT.firebaseapp.com",
          databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
          projectId: "YOUR_PROJECT",
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const messagesRef = ref(db, "messages");

        // UI elements
        const login = document.getElementById("login");
        const chat = document.getElementById("chat");
        const joinBtn = document.getElementById("joinBtn");
        const usernameInput = document.getElementById("username");
        const form = document.getElementById("form");
        const input = document.getElementById("input");
        const messages = document.getElementById("messages");

        let myName = "";

        // Join chat
        joinBtn.onclick = () => {
          myName = usernameInput.value.trim();
          if (!myName) return alert("Enter name");

          login.classList.add("hidden");
          chat.classList.remove("hidden");
        };

        // Send message
        form.onsubmit = (e) => {
          e.preventDefault();
          if (!input.value.trim()) return;

          push(messagesRef, {
            user: myName,
            text: input.value,
          });

          input.value = "";
        };

        // Receive messages (BOTH SIDES)
        onChildAdded(messagesRef, (snapshot) => {
          const data = snapshot.val();
          const li = document.createElement("li");

          li.textContent = `${data.user}: ${data.text}`;
          if (data.user === myName) li.classList.add("me");

          messages.appendChild(li);
          messages.scrollTop = messages.scrollHeight;
        });

      });
  });

});
