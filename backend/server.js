const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const { app, server } = require("./lib/socket");
const port = 3000;
const cors = require("cors");
const connectDB = require("./config/mongodb");
const schedulerService = require("./services/schedulerService");

// Routes
const userRoutes = require("./routes/userRoutes");
const driverRoutes = require("./routes/driverRoutes");
const tripRoutes = require("./routes/tripRoutes");
const rideRequestRoutes = require("./routes/rideRequestRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const messageRoutes = require("./routes/messageRoutes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();
schedulerService.init(); // Initialize recurring ride scheduler

// Mount Routes
app.use("/api/users", userRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/requests", rideRequestRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
