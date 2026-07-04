const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const Listing = require("./models/listing");

const path = require("path");


app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/STAYMINT");
}
main()
  .then((res) => {
    // console.log("connection successfull");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

//*listing all hotels
app.get("/listing", async (req, res) => {
  let listingInfo = await Listing.find({});
  // console.log(listingInfo);
  res.render("listings/index", { listingInfo });
});


//* adding new hotel to listing 
app.get("/listing/new",(req,res)=>{
  res.render("listings/new");
})

app.post("/listings",async(req,res)=>{
  let listing=req.body.listing;
  console.log(listing);
  const list=new Listing(listing);
  console.log(list);
  await list.save();
})
//*  detailed info of each hotel
app.get("/listing/:id", async (req, res) => {
  let { id } = req.params;
  console.log(id);
  const listedgData = await Listing.findById(id);
  console.log(listedgData);
  res.render("listings/show", { listedgData });
});





app.listen(port, (req, res) => {
  console.log("listing on port 3000");
});
