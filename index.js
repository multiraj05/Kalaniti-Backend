const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require('cors');
const colors = require('colors');
require("dotenv").config({ path: ".env" });
const path = require("path");
const morgan = require('morgan')

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const Routes = require("./routes/index.route");
app.use(Routes);

app.use(express.static(path.join(__dirname, "public")));
app.use("/storage", express.static(path.join(__dirname, "storage")));

// -------------------- start mongodb connection ----------------------------

mongoose.set('strictQuery', true);

mongoose.connect(
  
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.z2otguk.mongodb.net/${process.env.MONGODB_DB_NAME}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
  );
  
  const db = mongoose.connection;
  
  db.on("error", console.error.bind(console,"connection error:"));
  db.once("open", () => { 
    console.log("MONGO: successfully connected to db".yellow.underline);
});
  
// -------------------- end mongodb connection ----------------------------

app.listen(process?.env.PORT, () => {
    console.log(`Server is listening on port ${process?.env.PORT}`.blue.underline);
});