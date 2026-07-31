const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
  createdAt:{
    type:Date,
    default:Date.now()
  },
  reviewAuthor: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Review = new mongoose.model("Review", reviewSchema);
module.exports = Review;
