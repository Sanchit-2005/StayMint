const Review = require("../models/review");
const Listing = require("../models/listing");


module.exports.createNewReview=async (req, res) => {
    let { listing_id } = req.params;
    let listing = await Listing.findById(listing_id);
    let review = req.body.review;
    let newReview = new Review(review);
    newReview.reviewAuthor = res.locals.currUser._id;
    listing.reviews.push(newReview);
    console.log(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "posted a review ");
    res.redirect(`/listings/${listing_id}`);
  }


  module.exports.destroyReview=async (req, res, next) => {
      const { listing_id, review_id } = req.params;
  
      await Listing.findByIdAndUpdate(listing_id, {
        $pull: { reviews: review_id }, //* pull out the item in array which follow given condition
      });
  
      await Review.findByIdAndDelete(review_id);
  
      // console.log("Deleted review");
      req.flash("success", "deleted the review");
  
      res.redirect(`/listings/${listing_id}`);
    }