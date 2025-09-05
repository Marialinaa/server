const net = require('net');
const socket = new net.Socket();
socket.setTimeout(3000);
socket.on('connect', () => {
  console.log('TCP connect OK');
  socket.end();
});
socket.on('timeout', () => {
  console.error('TCP connect TIMEOUT');
  socket.destroy();
});
socket.on('error', (err) => {
  console.error('TCP connect ERROR:', err && err.message, err && err.code);
});
socket.connect(3005, '127.0.0.1');
