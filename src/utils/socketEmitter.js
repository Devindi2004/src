const { getIO } = require("../sockets");

const sendSocketEvent = (event, payload, room = null) => {
  const io = getIO();
  if (!io) return false;

  if (room) {
    io.to(room).emit(event, payload);
  } else {
    io.emit(event, payload);
  }

  return true;
};

module.exports = { sendSocketEvent };
