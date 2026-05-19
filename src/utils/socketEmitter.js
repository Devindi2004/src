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

const emitToRooms = (events, payload, rooms = []) => {
  events.forEach((event) => {
    if (rooms.length === 0) {
      sendSocketEvent(event, payload);
      return;
    }

    rooms.forEach((room) => sendSocketEvent(event, payload, room));
  });
};

module.exports = { emitToRooms, sendSocketEvent };
