const socket = io();

socket.emit('subscribe');
socket.on('velocity', (velocity) => {
  updateVelocity(velocity);
});
