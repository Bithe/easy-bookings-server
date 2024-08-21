//SERVER SETUP

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//CONFIG
const app = express();
const port = process.env.PORT || 5000;

// //MIDDLEWARE

const corsConfig = {
  origin: [
    "*",
    "http://localhost:5174",
    "http://localhost:5173",
    "http://localhost:5175",
    "https://y-pi-opal.vercel.app",
    "https://y-bithes-projects.vercel.app",
    "https://zendesk-survey-client.web.app",
    "https://zendesk-survey-client.firebaseapp.com",
  ],
  credentials: true,
};
app.use(cors(corsConfig));
app.use(express.json());
// app.use(cookieParser());

// CONNECT TO DB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mfawfp8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "strict",
};
//localhost:5000 and localhost:5173 are treated as same site.  so sameSite value must be strict in development server.  in production sameSite will be none
// in development server secure will false .  in production secure will be true

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    //------------------------ DB CREATE
    const surveyCollection = client
      .db("zendeskDb")
      .collection("surveyQuestions");

  
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    });
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' });
        }
        req.decoded = decoded;
        next();
      });
    };
    
    
    //clearing Token
    app.post("/logout", async (req, res) => {
      const user = req.body;
      // console.log("logging out", user);
      res
        .clearCookie("token", { ...cookieOptions, maxAge: 0 })
        .send({ success: true });
    });
   
    

    // DATA
    // --------------------------------------------------- STARTS

    app.get('/', async (req, res) => {
        try {
          const db = getDB();
          const { page = 1, limit = 10, search = '', sort, category, brand, priceMin, priceMax } = req.query;
      
          const query = {
            name: { $regex: search, $options: 'i' },
          };
      
          if (category) {
            query.category = category;
          }
          if (brand) {
            query.brand = brand;
          }
          if (priceMin) {
            query.price = { ...query.price, $gte: parseFloat(priceMin) };
          }
          if (priceMax) {
            query.price = { ...query.price, $lte: parseFloat(priceMax) };
          }
      
          const sortOptions = {};
          if (sort === 'priceLowToHigh') {
            sortOptions.price = 1;
          } else if (sort === 'priceHighToLow') {
            sortOptions.price = -1;
          } else if (sort === 'newest') {
            sortOptions.createdAt = -1;
          }
      
          const products = await db.collection('products')
            .find(query)
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip((page - 1) * limit)
            .toArray();
      
          const count = await db.collection('products').countDocuments(query);
      
          res.json({
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
          });
        } catch (error) {
          console.error(error.message);
          res.status(500).send('Server error');
        }
      });
      
      // @route POST /api/products
      // @desc Add a product (for testing purposes)
      app.post('/', async (req, res) => {
        try {
          const db = getDB();
          const newProduct = {
            ...req.body,
            createdAt: new Date(),
          };
          const result = await db.collection('products').insertOne(newProduct);
          res.json(result.ops[0]);
        } catch (error) {
          console.error(error.message);
          res.status(500).send('Server error');
        }
      });

    //    DATA END

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//ROOT
app.get("/", (req, res) => {
  res.send("Easybooking server is running");
});

app.listen(port, () => {
  console.log(`Easybooking server is running on port: ${port}`);
});
