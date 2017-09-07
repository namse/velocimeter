const socket = io('http://13.124.203.7:3000/');

socket.emit('subscribe');

socket.on('velocity', (velocity) => {
  updateVelocity(velocity);
});

socket.on('cadence', (cadence) => {
  updateCadence(cadence);
});
