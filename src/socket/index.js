const { getIO, initSocket } = require("../sockets");

const emitOrderUpdate = (order) => {
  const io = getIO();
  if (!io) return;

  io.to("kitchen").emit("order:update", { order });
  io.to(`order:${order._id}`).emit("order:update", { order });
  if (order.customer) io.to(`customer:${order.customer}`).emit("order:update", { order });
};

module.exports = { emitOrderUpdate, getIO, initSocket };
