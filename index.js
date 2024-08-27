//SERVER SETUP

const express = require("express");
const cors = require("cors");
require("dotenv").config();
// const cookieParser = require("cookie-parser");

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
    // "https://y-pi-opal.vercel.app",
    // "https://y-bithes-projects.vercel.app",
    // "https://zendesk-survey-client.web.app",
    // "https://zendesk-survey-client.firebaseapp.com",
     "https://easy-bookings-server-3yx66f4nv-bithes-projects.vercel.app",
    "https://easy-bookings-server.vercel.app"
  ],
  credentials: true,
};
app.use(cors(corsConfig));
app.use(express.json());
// app.use(cookieParser());


// CONNECT TO DB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mfawfp8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const productsCollection = client.db("easyBookingDb").collection("productsLists");

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();

    // Route to get products with pagination, sorting, and filtering
    app.get('/products', async (req, res) => {
      try {
        const { page = 1, limit = 10, search = '', sort, category, brand, priceMin, priceMax } = req.query;
        console.log('Received query params:', req.query);


        const query = { name: { $regex: search, $options: 'i' } };

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

        const products = await productsCollection.find(query)
          .sort(sortOptions)
          .limit(parseInt(limit))
          .skip((page - 1) * limit)
          .toArray();

        const count = await productsCollection.countDocuments(query);

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

    // Route to add a product (for testing purposes)
    app.post('/products', async (req, res) => {
      try {
        const newProduct = {
          ...req.body,
          createdAt: new Date(),
        };
        const result = await productsCollection.insertOne(newProduct);
        res.json(result.ops[0]);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
      }
    });

    console.log("Connected to MongoDB successfully!");
  } finally {
    // Ensure that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

// ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Easybooking server is running");
});

// START SERVER
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
