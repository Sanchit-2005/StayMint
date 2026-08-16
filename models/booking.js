const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BookingSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  checkInDate: {
    type: Date,
    required: true,
  },
  checkOutDate: {
    type: Date,
    required: true,
  },
    createdAt: {    
type: Date,
    default: Date.now,
  },    

  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  paymentType: {
    type: String,
    enum: ["credit_card", "upi", "bank_transfer"],
    default: "upi",
  },
});


const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking;