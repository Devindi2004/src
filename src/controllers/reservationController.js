const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { emitReservationUpdate } = require("../socket");

const createReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.create({
    customer: req.user?._id || null,
    name: req.body.name || req.user?.name,
    email: req.body.email || req.user?.email,
    phone: req.body.phone || req.user?.phone,
    partySize: req.body.partySize,
    dateTime: req.body.dateTime,
    notes: req.body.notes || "",
  });

  emitReservationUpdate(reservation);

  res.status(201).json({ success: true, reservation });
});

const getReservations = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const reservations = await Reservation.find(filter)
    .populate("customer", "name email phone")
    .populate("table", "tableNumber capacity section")
    .sort({ dateTime: 1 });

  res.json({ success: true, count: reservations.length, reservations });
});

const updateReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("table", "tableNumber capacity section");

  if (!reservation) throw new AppError("Reservation not found.", 404);

  if (reservation.table && ["confirmed", "seated"].includes(reservation.status)) {
    await Table.findByIdAndUpdate(reservation.table, {
      status: reservation.status === "seated" ? "occupied" : "reserved",
    });
  }

  emitReservationUpdate(reservation);

  res.json({ success: true, reservation });
});

module.exports = { createReservation, getReservations, updateReservation };
