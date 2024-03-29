const express = require("express");
const colors = require("colors");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();
const cron = require("node-cron");
console.log("heroku");
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const userRouter = require("./routes/user.route");
app.use("/api/user", userRouter);

const trackRouter = require("./routes/track.route");
const { updatePrices } = require("./util/updatePrices");    
app.use("/api/dashboard", trackRouter);

const port = process.env.PORT || 5000;
app.listen(port, console.log(`Server started on port ${port}`));

cron.schedule("0 14 * * *", updatePrices);
