import mongoose from "mongoose";
const Schema = mongoose.Schema;
import {userSchema} from "./user.model.js";

const documentSchema = new Schema({
    type: String,
    url: String
});

const drugSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    quantity: {
        type: Number,
        min: 0
    }
});

const PharmacySchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    location: String,
    documents: [documentSchema],
    drugs: [drugSchema],
    admin: {
        type: userSchema
    },
    status: {
        type: String,
        enum: ["ACTIVE", "SUSPENDED"],
        default: "ACTIVE"
    }
}, {timestamps: true});

export default mongoose.model("Pharmacies", PharmacySchema);