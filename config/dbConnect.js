const mongoose = require("mongoose");
mongoose.set("strictQuery", true)

// Function to Connect to Database
const dbConnect = async () => {
  try {

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB connected successfully");
  } catch (error) {
    console.log(error.message);
//    process.exit(1);
  }
};

dbConnect();
