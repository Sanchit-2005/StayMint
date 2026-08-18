const Listing = require("../models/listing");
const Booking = require("../models/booking");
const User = require("../models/user");

module.exports.index = async (req, res) => {
  let category = req.query.category;
  let filter = {};
  if (category) {
    filter.category = category;
  }
  let listingInfo = await Listing.find(filter);
  if (listingInfo.length === 0) {
    req.flash("fail", `No listing found for  ${category} ! `);
    return res.redirect("/listings");
  }
  // console.log(listingInfo);
  res.render("listings/index", { listingInfo });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;

  // console.log(id);
  const listedgData = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "reviewAuthor" } })
    .populate("owner");
  if (!listedgData) {
    req.flash("fail", "cannot found the listing");
    return res.redirect("/listings");
  }
  let isFavorite = false;

if (req.user) {
  isFavorite = req.user.favaorateListings.some((favId) =>
    favId.equals(listedgData._id)
  );
}
  // console.log(listedgData);
  res.render("listings/show", { listedgData,isFavorite });
};

module.exports.addNewListing = async (req, res, next) => {
  // console.log(req.user);
  let filename = req.file.filename;
  let url = req.file.path;
  let listing = req.body.listing;

  listing.owner = req.user._id;
  const list = new Listing(listing);
  list.image = { filename, url };
  // console.log(list);
  await list.save();
  req.flash("success", "Added the new listing");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  // console.log(id);

  let listing = await Listing.findById(id);

  // console.log(Hoteldata);
  res.render("listings/edit", { listing });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let updateListing = await Listing.findByIdAndUpdate(id, req.body.listing);
  if (typeof req.file !== "undefined") {
    let filename = req.file.filename;
    let url = req.file.path;
    updateListing.image = { filename, url };
    updateListing.save();
  }

  req.flash("success", "updated the listing");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id).then((res) => {
    // console.log("deleted the listing");
  });

  req.flash("success", "deleted  the listing");
  res.redirect("/listings");
};

module.exports.renderBookingPage = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("fail", "cannot found the listing");
    return res.redirect("/listings");
  }
  let listingData = await listing.populate("owner");
  res.render("listings/booking", { listingData });
};

module.exports.addBooking = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  const book = req.body.bookings;
  
  let newBooking = new Booking({
    ...book,
    listing: listing._id,
    user: req.user._id,
  });
  newBooking.paymentStatus = "completed";
  await newBooking.save();

  req.flash("success", "Booking Completed");
  res.redirect(`/listings/${id}`);
};

module.exports.favorateListing = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);
  const listing = await Listing.findById(id);
  const index = user.favaorateListings.indexOf(listing._id);
  if (index === -1) {
    user.favaorateListings.push(listing._id);
    await user.save();
    return res.json({ message: "Added to favorate" });
  } else {
    user.favaorateListings.splice(index, 1);
    await user.save();
    return res.json({ message: "Removed from favorate" });
  }
};


module.exports.showMyFavorateListings = async (req, res) => {
  const user = await User.findById(req.user._id).populate("favaorateListings");
  const favorateListings = user.favaorateListings;
  res.render("listings/myFavorateListings", { favorateListings });
};