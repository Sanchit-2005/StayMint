const mongoose = require("mongoose");
const Schema = mongoose.Schema;
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
    },
},
  location: {
    type: String,
  },
  country: {
    type: String,
  },
});

const Listing = mongoose.model("Listing", ListingSchema);
module.exports = Listing;
