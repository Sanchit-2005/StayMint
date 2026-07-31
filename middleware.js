const Listing = require("./models/listing");
const { schema: listingSchema, reviewJoiSchema } = require("./JoiSchema.js");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/expressError.js");
const Review = require("./models/review.js");

module.exports.isLoggin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("fail", "you must be login first   ");
        req.session.redirectTo = req.get("Referrer");
   
  return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectTo = (req, res, next) => {
  if (req.session.redirectTo) {
    res.locals.redirectTo = req.session.redirectTo;
  }     
  next();
};

module.exports.checkOwner=async(req,res,next)=>{
  let {id}=req.params;
  let listing=await Listing.findById(id);
  console.log(listing.owner,res.locals.currUser._id);
  if(!listing.owner.equals(res.locals.currUser._id)){
    req.flash("fail","you are not authorized to do this action");
    return res.redirect(`/listing/${id}`);
  }
  next();

}


module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }
  next();
};


module.exports.validateReview = (req, res, next) => {
  let { error } = reviewJoiSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }
  next();
};



module.exports.checkReviewAuthor=async(req,res,next)=>{
  let {listing_id,review_id}=req.params;
  let review=await Review.findById( review_id);
  
  if(!review.reviewAuthor.equals(res.locals.currUser._id)){
    req.flash("fail","you are not allowed to delete the review");
    return res.redirect(`/listing/${listing_id}`);
  }
  next();

}