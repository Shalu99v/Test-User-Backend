const dotenv = require('dotenv');
const db= require("./config/db")
const express = require('express');
const cors = require('cors');
const path = require("path");
db();

const userRoute= require('./routes/userRoutes')

const app = express();
dotenv.config({ path: "./.env" });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());  
app.use(cors());

app.use("/user",userRoute);

app.listen(process.env.PORT, () => {
  console.log(`server is running @ http://localhost:${process.env.PORT}`);
});
