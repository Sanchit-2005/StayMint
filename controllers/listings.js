const Listing = require("../models/listing");

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
  // console.log(listedgData);
  res.render("listings/show", { listedgData });
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
