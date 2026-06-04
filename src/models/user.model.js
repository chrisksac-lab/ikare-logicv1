import moment from "moment";
import mongoose from "mongoose";
import validator from "validator";
const Schema = mongoose.Schema;

const questionAnswer = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  question: String,
  answer: String
})

const followupSchema = new Schema({
  source: String,
  communication: [questionAnswer]
})

const vitalSchema = new Schema({
    temperature: Number,
    bloodPressure: Number,
    bloodGlucose: Number,
    heartBeat: Number,
    concentration: Number
}, {timestamps:true});

const notifications = new Schema({
    message: String,
    date: {
      type: Date,
      default: Date.now
    },
    sender: String,
    receiver: String,
    documents: {
      type: [String],
      default: null
    },
    status: {
      type: String,
      enum: ["PENDING","READ"],
      default: "PENDING"
    }
})

const ehrSchema = new Schema({
    details: String,
    complains: String,
    prescription: String,
    documents: {
      type: [String],
      default: null
    },
    test_date: {
      type: Date,
      default: Date.now
    },
    lab: String,
    doctor: String,
    vitals: vitalSchema
})

const prescriptionSchema = new Schema({
  drug: String,
  quantity: Number,
  diagnosis: String,
  vitals: String,
  info: String,
  prescription_date: {
    type: Date,
    default: Date.now
  },
  followup: [followupSchema]
})

const consultationSchema = new Schema({
    date: {
      type: Date,
      default: Date.now
    },
    room: String,
    status: {
      type: String,
      enum: ["ONGOING","DONE"],
      default: "ONGOING"
    },
    prescription: {
      type: prescriptionSchema,
      default: null
    },
    user: String
})

const appointmentSchema = new Schema({
  date: Date,
  details: String,
  commonId: String,
  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "DENIED"],
    default: "PENDING"
  },
  user: String,
  consultation: {
    type: consultationSchema,
    default: null
  }
});
 
export const userSchema = new Schema({
  fullname: String,
  email: String,
  tel: String,
  password:String,
  socket: {
    type: String,
    default: null
  },
  mobileSocket: {
    type: String,
    default: null
  },
  botSocket: {
    type: String,
    default: null
  },
  mobileBotSocket: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'INACTIVE'],
    default: 'PENDING'
  },
  gender: {
    type: String,
    enum: ['male','female'],
    default: 'male'
  },
  authToken: String,
  auth:{
    type: String,
    enum:['google','facebook','apple','email_and_password'],
    default: 'email_and_password'
  },
  image: {
    type: String,
    default: null
  },
  signature: {
    type: String,
    default: null
  },
  otp: {
    type:String,
    default: null
  },
  email_verified:{
    type: Boolean,
    default: false
  },
  role:{
          type: mongoose.Schema.Types.ObjectId,
          rel: "Role",
  },
  availability: {
    type: [Date],
    default: null
  },
  appointments: {
    type: [appointmentSchema],
    default: null
  },
  notifications: {
    type: [notifications],
    default: null
  },
  ehr: {
    type: [ehrSchema],
    default: null
  },
  vitals: {
    type: vitalSchema
  },
  ehrPermission: {
    type:Boolean,
    default:false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Users", userSchema);