import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    reuired: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
