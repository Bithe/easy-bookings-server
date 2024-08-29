//SERVER SETUP

const express = require("express");
const cors = require("cors");
require("dotenv").config();
// const cookieParser = require("cookie-parser");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//CONFIG
const app = express();
const port = process.env.PORT || 5000;


app.get('/', (req, res)=>{
  res.send('easy booking server running');
})

app.listen(port, ()=>{
console.log(`Easy booking server is running on port ${port}`);
})


