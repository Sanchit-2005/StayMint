const Razorpay = require("razorpay");

const crypto = require("crypto");

const Listing = require("../models/listing");
const Booking = require("../models/booking");

//* Razorpay configuration */
// Create an instance of Razorpay with my  API credentials
const razorpay = new Razorpay({
  key_id: process.env.GATEWAY_API_KEY, // Replace with your Razorpay Key ID
  key_secret: process.env.GATEWAY_API_SECRET, // Replace with your Razorpay Key Secret
});
// Route to create a Razorpay order
module.exports.createOrder = async (req, res) => {
  const { id } = req.params;
   const { checkInDate, checkOutDate } = req.body;
  let listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).json({
      success: false,
      message: "Listing not found",
    });
  }
    const existingBooking = await Booking.findOne({
    listing: listing._id,
    checkInDate: { $lt: new Date(checkOutDate) },
    checkOutDate: { $gt: new Date(checkInDate) },
  });

  if (existingBooking) {
    return res.status(400).json({
      success: false,
      message: "This hotel is already booked for the selected dates.",
    });
  }
  const amount = listing.price;

  const options = {
    amount: amount * 100, // Convert amount to paise
    currency: "INR",
    receipt: "receipt#1",
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({
        success: true,
      key: process.env.GATEWAY_API_KEY,

      // Send key to the frontend
      amount: order.amount,
      currency: order.currency,
      id: order.id,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    listingId,
    checkInDate,
    checkOutDate,
  } = req.body;

  const key_secret = process.env.GATEWAY_API_SECRET;

  const generated_signature = crypto
    .createHmac("sha256", key_secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  const existingBooking = await Booking.findOne({
    listing: listingId,

    checkInDate: new Date(checkInDate),
    checkOutDate: new Date(checkOutDate),
  });
  if (existingBooking) {
    return res.status(400).json({
      success: false,
      message: "This hotel is already booked for the selected dates.",
    });
  }
  if (generated_signature === razorpay_signature) {
    const newBooking = new Booking({
      listing: listingId,
      user: req.user._id,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      paymentStatus: "completed",
    });

    await newBooking.save();
    req.flash("success", "Payment successful");

    return res.json({
      success: true,
      message: "Payment verified successfully",
    });
  }
  req.flash("error", "Payment verification failed");

  return res.status(400).json({
    success: false,
    message: "Payment verification failed",
  });
};

module.exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId }).populate("listing");
    console.log("User bookings:", bookings); // Log the bookings for debugging
    res.render("bookings/index.ejs", { bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    req.flash("error", "Failed to fetch bookings");
    res.redirect("/listings");
  }
};
