const socket = io();
let username = '';

function setNickname() {
  const input = document.getElementById('nicknameInput');
  username = input.value.trim();
  if (username) {
    socket.emit('setUsername', username);
    document.getElementById('nicknamePrompt').style.display = 'none';
    document.getElementById('chatArea').style.display = 'block';
  }
}

function sendMessage() {
  const input = document.getElementById('m');
  const message = input.value.trim();
  if (message) {
    socket.emit('chat message', message);
    input.value = '';
  }
}

socket.on('chat message', (msg) => {
  const item = document.createElement('li');
  item.textContent = msg;
  document.getElementById('messages').appendChild(item);
  item.scrollIntoView();
});
