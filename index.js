//SERVER SETUP

const express = require("express");
const cors = require("cors");
require("dotenv").config();
// const cookieParser = require("cookie-parser");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//CONFIG
const app = express();
const port = process.env.PORT || 5000;


// MIDDLEWARE ------------------------

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mfawfp8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    
    const roomsCollection = client.db("easyBookingDb").collection("roomsCollection");


    // GET ALL THE ROOMS DATA
    app.get('/rooms', async(res, req)=>{
      const rooms = await roomsCollection.find().toArray();
      res.send(rooms);
    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);




// ----------------------------------


app.get('/', (req, res)=>{
  res.send('easy booking server running');
})

app.listen(port, ()=>{
console.log(`Easy booking server is running on port ${port}`);
})


