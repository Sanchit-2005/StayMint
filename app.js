if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

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
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const {
  saveRedirectTo,
  checkOwner,
  validateListing,
  validateReview,
  checkReviewAuthor,
} = require("./middleware");
const listingController = require("./controllers/listings");
const reviewController = require("./controllers/reviews");
const userController = require("./controllers/users");

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



app.use("/listings", listingsRouter);
app.use("/listings/:listing_id/reviews", reviewsRouter);
app.use("/", userRouter);

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
