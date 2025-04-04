// const app = require("./app");
// const db = require("./Config/DBconfig");
// // const userModel = require("./models/Usermodel");
// const express = require("express");
// const path = require("path");

// const port = process.env.PORT || 3002;
// // // const SchedulePickupModel=require("./models/SchedulePickupModel")
// // GOOGLE_APPLICATION_CREDENTIALS =
// //   "C:UserssasitDesktopProject 02Backendgoogle.json";

// app.get("/", (req, res) => {
//   res.send("Hello world !!!");
// });

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // app.listen(port, "0.0.0.0", () => {
// //   console.log(`Server is runnnig on port ${port}`);
// // });
// app.listen(port, () => {
//   console.log(`Server is runnnig on port ${port}`);
// });

const app = require("./app");
require("./Config/DBconfig"); // This will connect to MongoDB
const port = process.env.PORT || 3002;

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
