const express = require('express');
const http = require('http');
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);


app.use(express.static('public'))

server.listen(3000);

const subscribes = [];

io.on('connection', (socket) => {
  console.log('connected');
  socket.on('subscribe', () => {
    subscribes.push(socket);
  });

  socket.on('disconnect', () => {
    const index = subscribes.indexOf(socket);

    if (index > -1) {
      subscribes.splice(index, 1);
    }
  });

  socket.on('velocity', (velocity) => {
    subscribes.forEach(subSocket => subSocket.emit('velocity', velocity));
  });
  socket.on('cadence', (cadence) => {
    subscribes.forEach(subSocket => subSocket.emit('cadence', cadence));
  });
});
