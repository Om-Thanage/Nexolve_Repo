const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dotenv.config();
connectDB();


app.get("/", (req, res) => {
    res.json({ message: "Hello World!" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});