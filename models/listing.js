const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const ListingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
  },
  image: {
    filename: {
      type: String,
    },
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1782397161807-9bab207b6d00?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review", //* No need to require the model here
      //* fakt model ch nav barobar  asl pahije
    },
  ],
});

ListingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});
    console.log("deletd the review after deleting the listing ");
  }
})

const Listing = mongoose.model("Listing", ListingSchema);
module.exports = Listing;
