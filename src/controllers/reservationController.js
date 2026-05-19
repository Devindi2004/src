const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const { requireFields } = require("../utils/validators");
const { emitReservationUpdate } = require("../socket");

const createReservation = asyncHandler(async (req, res) => {
  requireFields(req.body, ["partySize", "dateTime"]);

  const reservation = await Reservation.create({
    customer: req.user?._id || null,
    name: req.body.name || req.user?.name,
    email: req.body.email || req.user?.email,
    phone: req.body.phone || req.user?.phone || "",
    partySize: req.body.partySize,
    dateTime: req.body.dateTime,
    table: req.body.table || null,
    notes: req.body.notes || "",
  });

  emitReservationUpdate(reservation);

  successResponse(res, {
    statusCode: 201,
    message: "Reservation created.",
    data: { reservation },
  });
});

const getReservations = asyncHandler(async (req, res) => {
  const { status, mine } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (req.user.role === "customer" || mine === "true") filter.customer = req.user._id;

  const reservations = await Reservation.find(filter)
    .populate("customer", "name email phone")
    .populate("table", "tableNumber capacity section")
    .sort({ dateTime: 1 });

  successResponse(res, {
    message: "Reservations fetched.",
    data: { count: reservations.length, reservations },
  });
});

const updateReservation = asyncHandler(async (req, res) => {
  const allowedCustomerFields = ["notes", "status"];
  const payload =
    req.user.role === "customer"
      ? Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedCustomerFields.includes(key)))
      : req.body;

  if (req.user.role === "customer" && payload.status && payload.status !== "cancelled") {
    throw new AppError("Customers can only cancel their own reservations.", 403);
  }

  const filter = { _id: req.params.id };
  if (req.user.role === "customer") filter.customer = req.user._id;

  const reservation = await Reservation.findOneAndUpdate(filter, payload, {
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

  successResponse(res, {
    message: "Reservation updated.",
    data: { reservation },
  });
});

module.exports = { createReservation, getReservations, updateReservation };
