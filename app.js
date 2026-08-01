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
const { isLoggin } = require("./middleware");
const {
  saveRedirectTo,
  checkOwner,
  validateListing,
  validateReview,
  checkReviewAuthor,
} = require("./middleware");
const listingController = require("./controllers/listings");
const reviewController=require("./controllers/reviews");
const userController=require("./controllers/users")

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
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
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

app.get("/", (req, res) => {
  res.send("Welcome to hote route");
});

//*listing all hotels
app.get("/listing", asyncWrap(listingController.index));

//* adding new hotel to listing
app.get("/listing/new", isLoggin, listingController.renderNewForm);

app.post(
  "/listings",
  validateListing,
  asyncWrap(listingController.addNewListing),
);

//*update route- will update the info of hotel which is listed
app.get(
  "/listing/edit/:id",
  isLoggin,
  checkOwner,
  asyncWrap(listingController.renderEditForm),
);

app.patch(
  "/listings/:id",
  validateListing,
  asyncWrap(listingController.updateListing),
);

//*delete route- will delete the info of hotel which is listed

app.delete(
  "/listings/:id",
  checkOwner,
  isLoggin,
  asyncWrap(listingController.destroyListing)
);

//*  detailed info of each hotel
app.get(
  "/listing/:id",
  asyncWrap(listingController.showListing),
);

//*for post an reviews
app.post(
  "/listings/:id/reviews",
  isLoggin,
  validateReview,
  asyncWrap(reviewController.createNewReview)
);

//* for delete an review
app.delete(
  "/listings/:listing_id/review/:review_id",
  isLoggin,
  checkReviewAuthor,
  asyncWrap(reviewController.destroyReview),
);

//* for signup
app.get("/signup",userController.renderSignupForm );

app.post(
  "/signup",
  asyncWrap(userController.signup),
);

//*login

app.get("/login",userController.renderLoginForm);

app.post(
  "/login",
  saveRedirectTo,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login
);

//* logout
app.get("/logout", userController.logout);

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
