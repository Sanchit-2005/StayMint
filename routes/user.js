const express = require("express");
const router = express.Router();

const passport = require("passport");
const asyncWrap = require("../utils/asyncWrap");
const userController = require("../controllers/users");
const { saveRedirectTo } = require("../middleware");

// Signup
router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(asyncWrap(userController.signup));

// Login
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectTo,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login,
  );

// Logout
router.get("/logout", userController.logout);

module.exports = router;
