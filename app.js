const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");




app.use(methodOverride("_method"));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname, "public")));

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


  app.get("/",(req,res)=>{
    res.send("Welcome to hote route")
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
  // console.log(listing);
  const list=new Listing(listing);
  // console.log(list);
  await list.save();
  res.redirect("/listing")
})


//*update route- will update the info of hotel which is listed 
app.get("/listing/edit/:id",async(req,res)=>{
  let{id}=req.params;
  // console.log(id);

  let listing=await Listing.findById(id);
  // console.log(Hoteldata);
  res.render("listings/edit",{listing})

})

app.patch("/listings/:id", async (req, res) => {
    const {id} = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing);
    res.redirect(`/listing/${id}`);
});

//*delete route- will delete the info of hotel which is listed 

app.delete("/listings/:id", async (req, res) => {
    const {id} = req.params;
    await Listing.findByIdAndDelete(id)
    .then((res)=>{
      console.log("deleted the listing")
    })
    res.redirect("/listing");
});


//*  detailed info of each hotel
app.get("/listing/:id", async (req, res) => {
  let { id } = req.params;
  // console.log(id);
  const listedgData = await Listing.findById(id);
  // console.log(listedgData);
  res.render("listings/show", { listedgData });
});






app.listen(port, (req, res) => {
  console.log("listing on port 3000");
});
