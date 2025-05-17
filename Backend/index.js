require('dotenv').config(); // ✅ Load environment variables

const connectToMongo = require('./db');
connectToMongo();

const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

const cors = require('cors');
const router = require('./Routes/router');

app.use(cors());
app.use(express.json());
app.use(router);

app.listen(port, () => {
  console.log(`✅ Backend server running on port ${port}`);
});
