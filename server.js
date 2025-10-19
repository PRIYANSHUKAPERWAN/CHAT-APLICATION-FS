// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // allow requests for testing with frontend on different port

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET","POST"]
  }
});

// Optional root endpoint
app.get('/', (req, res) => {
  res.send('Socket.io chat server is running.');
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Store username on socket after 'join' event
  socket.on('join', (name) => {
    socket.username = name || 'Anonymous';
    // Announce to others
    socket.broadcast.emit('systemMessage', {
      text: `${socket.username} joined the chat.`,
      time: new Date().toISOString()
    });
    // Optionally send welcome to the new user
    socket.emit('systemMessage', {
      text: `Welcome, ${socket.username}!`,
      time: new Date().toISOString()
    });
  });

  // Handle incoming chat messages
  socket.on('chatMessage', (msg) => {
    const message = {
      text: msg,
      name: socket.username || 'Anonymous',
      time: new Date().toISOString()
    };
    // broadcast to ALL clients including sender
    io.emit('chatMessage', message);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id} (${reason})`);
    if (socket.username) {
      socket.broadcast.emit('systemMessage', {
        text: `${socket.username} left the chat.`,
        time: new Date().toISOString()
      });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
