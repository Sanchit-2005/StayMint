const mongoose = require("mongoose");
const Listing=require("../models/listing.js");
const  Info=require("./data.js");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/STAYMINT");
}
main()
  .then((res) => {
    console.log("connection successfull");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

  const initDB=async()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(Info.data);
  }
  initDB();

  module.exports=Listing;