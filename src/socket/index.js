const { getIO, initSocket } = require("../sockets");

const emitOrderUpdate = (order) => {
  const io = getIO();
  if (!io) return;

  io.to("kitchen").emit("order-updated", { order });
  io.to("kitchen").emit("order:update", { order });
  io.to(`order:${order._id}`).emit("order-updated", { order });
  io.to(`order:${order._id}`).emit("order:update", { order });
  if (order.customer) {
    io.to(`customer:${order.customer}`).emit("order-updated", { order });
    io.to(`customer:${order.customer}`).emit("order:update", { order });
  }
};

const emitReservationUpdate = (reservation) => {
  const io = getIO();
  if (!io) return;

  io.to("admin").emit("reservation-updated", { reservation });
  io.to("kitchen").emit("reservation-updated", { reservation });
  if (reservation.customer) {
    io.to(`customer:${reservation.customer}`).emit("reservation-updated", { reservation });
  }
};

const emitInventoryAlert = (item) => {
  const io = getIO();
  if (!io) return;

  io.to("admin").emit("inventory-alert", { item });
  io.to("kitchen").emit("inventory-alert", { item });
};

module.exports = { emitInventoryAlert, emitOrderUpdate, emitReservationUpdate, getIO, initSocket };
