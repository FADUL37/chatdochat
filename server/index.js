const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let users = {};

io.on("connection", (socket) => {
  console.log("Novo usuário conectado:", socket.id);

  // Recebe apelido do cliente
  socket.on("set_nickname", (nickname) => {
    users[socket.id] = { nickname, autoReply: false };
    io.emit("user_list", Object.values(users).map(u => u.nickname));
    console.log(`Usuário ${nickname} entrou no chat.`);
  });

  // Recebe mensagem do cliente
  socket.on("send_message", (msg) => {
    const user = users[socket.id];
    if (!user) return;

    console.log(`Mensagem de ${user.nickname}: ${msg}`);

    // Broadcast para todos
    io.emit("receive_message", { nickname: user.nickname, message: msg });

    // Auto reply para quem marcou checkbox
    if (user.autoReply) {
      setTimeout(() => {
        io.to(socket.id).emit("receive_message", {
          nickname: "AutoReply Bot",
          message: "Estamos verificando sua solicitação, aguarde!"
        });
      }, 60 * 1000); // 1 minuto depois
    }
  });

  // Atualiza autoReply (checkbox)
  socket.on("set_auto_reply", (status) => {
    if (users[socket.id]) users[socket.id].autoReply = status;
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      console.log(`Usuário ${user.nickname} saiu.`);
      delete users[socket.id];
      io.emit("user_list", Object.values(users).map(u => u.nickname));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
