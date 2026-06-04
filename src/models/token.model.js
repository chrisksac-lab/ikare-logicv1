import mongoose from "mongoose";
const Schema = mongoose.Schema;
 
const tokenSchema = new Schema({
  token: String,
  email: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
  	type: Date
  }
});

export default mongoose.model("tokens", tokenSchema);