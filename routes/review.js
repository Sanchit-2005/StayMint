const express = require("express");
const router = express.Router({ mergeParams: true });
const asyncWrap = require("../utils/asyncWrap.js");
const { schema: listingSchema, reviewJoiSchema } = require("../JoiSchema.js");
const listingController = require("../controllers/listings");
const reviewController = require("../controllers/reviews");
const { isLoggin } = require("../middleware.js");
const {
  saveRedirectTo,
  checkOwner,
  validateListing,
  validateReview,
  checkReviewAuthor,
} = require("../middleware.js");
//*for post an reviews
router.post(
  "/",
  isLoggin,
  validateReview,
  asyncWrap(reviewController.createNewReview),
);

//* for delete an review
router.delete(
  "/:review_id",
  isLoggin,
  checkReviewAuthor,
  asyncWrap(reviewController.destroyReview),
);

module.exports=router;