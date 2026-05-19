const mongoose = require("mongoose");
const connectDB = require("../config/db");
const MenuItem = require("../models/MenuItem");
const sampleMenu = require("./sampleMenu");

const seed = async () => {
  await connectDB();
  await MenuItem.deleteMany({});
  await MenuItem.insertMany(sampleMenu);
  await mongoose.connection.close();
  console.log("DineFlow sample menu seeded.");
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
