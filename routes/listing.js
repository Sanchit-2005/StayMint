const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/asyncWrap.js");
const { schema: listingSchema, reviewJoiSchema } = require("../JoiSchema.js");
const listingController = require("../controllers/listings");
const { isLoggin } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const Listing=require("../models/listing.js")

const upload = multer({ storage });

const {
  saveRedirectTo,
  checkOwner,
  validateListing,
  validateReview,
  checkReviewAuthor,
} = require("../middleware.js");

//*listing all hotels
router
  .route("/")
  .get(asyncWrap(listingController.index))
  .post(
    isLoggin,
    upload.single("listing[image]"),
    validateListing,
    asyncWrap(listingController.addNewListing),
  );

//* adding new hotel to listing
router.get("/new", isLoggin, listingController.renderNewForm);
router.get("/search", async (req, res) => {
  let { query } = req.query;

  const listings = await Listing.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { location: { $regex: query, $options: "i" } },
      { country: { $regex: query, $options: "i" } },
    ],
  });
  if (listings.length === 0) {
    req.flash("error", "No listings found for your search ");
    return res.redirect("/listings");
  }

  res.render("listings/index.ejs", { listingInfo: listings });
});


//*for getting a booking page for a listing
router.get("/book/:id", isLoggin, asyncWrap(listingController.renderBookingPage));
router.post("/book/:id",isLoggin,asyncWrap(listingController.addBooking));
//*update route- will update the info of hotel which is listed
router.get(
  "/edit/:id",
  isLoggin,
  checkOwner,
  asyncWrap(listingController.renderEditForm),
);

router
  .route("/:id")
  .patch(
    isLoggin,
    upload.single("listing[image]"),
    validateListing,
    asyncWrap(listingController.updateListing),
  )
  .delete(checkOwner, isLoggin, asyncWrap(listingController.destroyListing))
  .get(asyncWrap(listingController.showListing));

module.exports = router;
