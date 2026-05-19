let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    socket.emit("socket:connected", { socketId: socket.id });

    socket.on("join:admin", () => socket.join("admin"));
    socket.on("join:kitchen", () => socket.join("kitchen"));
    socket.on("join:customer", (customerId) => {
      if (customerId) socket.join(`customer:${customerId}`);
    });
    socket.on("join:order", (orderId) => {
      if (orderId) socket.join(`order:${orderId}`);
    });
    socket.on("leave:order", (orderId) => {
      if (orderId) socket.leave(`order:${orderId}`);
    });
  });

  return io;
};

const getIO = () => ioInstance;

module.exports = { getIO, initSocket };
