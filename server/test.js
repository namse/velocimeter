const io = require('socket.io-client')

const socket = io('http://ec2-13-124-203-7.ap-northeast-2.compute.amazonaws.com:3000');

// socket.emit('velocity', 20);

socket.on('connect', () => {
  console.log('connect');
});
socket.on('disconnect', () => {
  console.log('disconnect');
});
