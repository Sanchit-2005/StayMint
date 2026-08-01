const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/asyncWrap.js");
const { schema: listingSchema, reviewJoiSchema } = require("../JoiSchema.js");
const listingController = require("../controllers/listings");
const { isLoggin } = require("../middleware.js");

const {
  saveRedirectTo,
  checkOwner,
  validateListing,
  validateReview,
  checkReviewAuthor,
} = require("../middleware.js");

//*listing all hotels
router.get("/", asyncWrap(listingController.index));

//* adding new hotel to listing
router.get("/new", isLoggin, listingController.renderNewForm);

router.post(
  "/",
  validateListing,
  asyncWrap(listingController.addNewListing),
);

//*update route- will update the info of hotel which is listed
router.get(
  "/edit/:id",
  isLoggin,
  checkOwner,
  asyncWrap(listingController.renderEditForm),
);

router.patch(
  "/:id",
  validateListing,
  asyncWrap(listingController.updateListing),
);

//*delete route- will delete the info of hotel which is listed

router.delete(
  "/:id",
  checkOwner,
  isLoggin,
  asyncWrap(listingController.destroyListing)
);

//*  detailed info of each hotel
router.get(
  "/:id",
  asyncWrap(listingController.showListing),
);


module.exports=router;