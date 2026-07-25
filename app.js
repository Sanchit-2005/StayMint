const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const asyncWrap = require("./utils/asyncWrap.js");
const ExpressError = require("./utils/expressError.js");
const { schema: listingSchema, reviewJoiSchema } = require("./JoiSchema.js");
const Review = require("./models/review");
const session = require("express-session");
const flash = require("connect-flash");
const User = require("./models/user");
const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");

const sessionOption = {
  secret: "secretcode",
  resave: false,
  saveUninitialized: true,

  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
  },
};
app.use(methodOverride("_method"));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.fail = req.flash("fail");
  res.locals.error=req.flash("error");q
  next();
});

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/STAYMINT");
}
main()
  .then((res) => {
    // console.log("connection successfull");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }
  next();
};

const validateReview = (req, res, next) => {
  let { error } = reviewJoiSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }
  next();
};

app.get("/", (req, res) => {
  res.send("Welcome to hote route");
});

//*listing all hotels
app.get(
  "/listing",
  asyncWrap(async (req, res) => {
    let listingInfo = await Listing.find({});
    // console.log(listingInfo);
    res.render("listings/index", { listingInfo });
  }),
);

//* adding new hotel to listing
app.get("/listing/new", (req, res) => {
  res.render("listings/new");
});

app.post(
  "/listings",
  validateListing,
  asyncWrap(async (req, res, next) => {
    let listing = req.body.listing;

    const list = new Listing(listing);
    // console.log(list);
    await list.save();
    req.flash("success", "Added the new listing");
    res.redirect("/listing");
  }),
);

//*update route- will update the info of hotel which is listed
app.get(
  "/listing/edit/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    // console.log(id);

    let listing = await Listing.findById(id);

    // console.log(Hoteldata);
    res.render("listings/edit", { listing });
  }),
);

app.patch(
  "/listings/:id",
  validateListing,
  asyncWrap(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing);

    req.flash("success", "updated the listing");
    res.redirect(`/listing/${id}`);
  }),
);

//*delete route- will delete the info of hotel which is listed

app.delete(
  "/listings/:id",
  asyncWrap(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id).then((res) => {
      console.log("deleted the listing");
    });

    req.flash("success", "deleted  the listing");
    res.redirect("/listing");
  }),
);

//*  detailed info of each hotel
app.get(
  "/listing/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;

    // console.log(id);
    const listedgData = await Listing.findById(id).populate("reviews");
    if (!listedgData) {
      req.flash("fail", "cannot found the listing");
      return res.redirect("/listing");
    }
    // console.log(listedgData);
    res.render("listings/show", { listedgData });
  }),
);

//*for post an reviews
app.post("/listings/:id/reviews", validateReview, async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  let review = req.body.review;
  let newReview = new Review(review);
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  req.flash("success", "posted a review ");
  res.redirect(`/listing/${id}`);
});

//* for delete an review
app.delete(
  "/listings/:listing_id/review/:review_id",
  asyncWrap(async (req, res, next) => {
    const { listing_id, review_id } = req.params;

    await Listing.findByIdAndUpdate(listing_id, {
      $pull: { reviews: review_id }, //* pull out the item in array which follow given condition
    });

    await Review.findByIdAndDelete(review_id);

    // console.log("Deleted review");
    req.flash("success", "deleted the review");

    res.redirect(`/listing/${listing_id}`);
  }),
);

//* for signup
app.get("/signup", (req, res) => {
  res.render("users/signup");
});

app.post(
  "/signup",
  asyncWrap(async (req, res) => {
    try {
      let { username, password, email } = req.body;
      const newUser = new User({ username, email });
      await User.register(newUser, password);
      req.flash("success", "Signup successfully");
      res.redirect("/listing");
    } catch (err) {
      req.flash("fail", err.message);
      res.redirect("/signup");
    }
  }),
);

//*login 

app.get("/login",(req,res)=>{
  res.render("users/login")
})

app.post("/login",passport.authenticate("local",{
  failureRedirect:"/login",
  failureFlash:true

}),async(req,res)=>{
req.flash("success","Welcome back to StayMint");
res.redirect("/listing");
});

// //* if we reach to wrong route
app.all("/{*splat}", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("./listings/error.ejs", { message });
});

app.listen(port, (req, res) => {
  console.log("listing on port 3000");
});
