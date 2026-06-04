import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    user: {
          type: mongoose.Schema.Types.ObjectId,
          rel: "User",
    },
    details: {
        type: String
    },
    amount: {
        type: Number
    },
    status: {
        type: String,
    },
    institute: {
        type: String
    },
    tel: {
        type: String
    },
    reference: {
        type: String
    },
    doctor: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model("Payments", PaymentSchema);