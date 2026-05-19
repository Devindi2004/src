const mongoose = require("mongoose");
const connectDB = require("../config/db");
const InventoryItem = require("../models/InventoryItem");
const MenuItem = require("../models/MenuItem");
const Table = require("../models/Table");
const User = require("../models/User");
const sampleMenu = require("./sampleMenu");

const demoUsers = [
  {
    name: "Demo Admin",
    email: "admin@dineflow.local",
    password: "Admin12345",
    role: "admin",
    phone: "0770000001",
  },
  {
    name: "Kitchen Staff",
    email: "kitchen@dineflow.local",
    password: "Kitchen12345",
    role: "kitchen",
    phone: "0770000002",
  },
  {
    name: "Demo Customer",
    email: "customer@dineflow.local",
    password: "Customer12345",
    role: "customer",
    phone: "0770000003",
  },
];

const inventoryItems = [
  { itemName: "Chicken Portions", stock: 40, threshold: 10, unit: "pcs" },
  { itemName: "Kottu Roti", stock: 60, threshold: 15, unit: "pcs" },
  { itemName: "Basmati Rice", stock: 35, threshold: 8, unit: "kg" },
  { itemName: "Prawns", stock: 8, threshold: 10, unit: "kg" },
  { itemName: "Mango Pulp", stock: 12, threshold: 6, unit: "pack" },
];

const tables = [
  { tableNumber: "T1", capacity: 2, section: "main" },
  { tableNumber: "T2", capacity: 4, section: "main" },
  { tableNumber: "T3", capacity: 6, section: "family" },
  { tableNumber: "OUT1", capacity: 4, section: "outdoor" },
];

const seed = async () => {
  await connectDB();

  await Promise.all([
    MenuItem.deleteMany({}),
    InventoryItem.deleteMany({}),
    Table.deleteMany({}),
    User.deleteMany({ email: { $in: demoUsers.map((user) => user.email) } }),
  ]);

  const createdInventory = await InventoryItem.insertMany(inventoryItems);
  const inventoryByName = new Map(createdInventory.map((item) => [item.itemName, item._id]));

  const menuWithInventory = sampleMenu.map((item) => {
    const inventoryItem =
      item.name.includes("Kottu")
        ? inventoryByName.get("Kottu Roti")
        : item.name.includes("Rice")
          ? inventoryByName.get("Basmati Rice")
          : item.name.includes("Prawns")
            ? inventoryByName.get("Prawns")
            : item.name.includes("Lassi")
              ? inventoryByName.get("Mango Pulp")
              : inventoryByName.get("Chicken Portions");

    return { ...item, inventoryItem };
  });

  await Promise.all([
    MenuItem.insertMany(menuWithInventory),
    Table.insertMany(tables),
    User.create(demoUsers),
  ]);

  await mongoose.connection.close();
  console.log("DineFlow demo data seeded.");
  console.log("Admin login: admin@dineflow.local / Admin12345");
  console.log("Kitchen login: kitchen@dineflow.local / Kitchen12345");
  console.log("Customer login: customer@dineflow.local / Customer12345");
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
