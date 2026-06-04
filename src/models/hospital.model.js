import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { userSchema } from "./user.model.js";

const hospitalSchema = new Schema({
    name: String,
    location: String,
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE"
    },
    creation_date: {
      type: Date,
      default: Date.now
    },
    admin: {
        type:userSchema,
        default: null
    },
    doctors: {
        type:[userSchema],
        default: null
    },
})

export default mongoose.model("hospital", hospitalSchema);