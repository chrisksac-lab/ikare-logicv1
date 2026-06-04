import bcrypt from "bcrypt";
import * as roleService from "../services/role.service.js"
import * as hospitalService from "../services/hospital.service.js";
import * as userService from "../services/user.service.js"
import {StreamClient} from "@stream-io/node-sdk";
import dotenv from "dotenv-flow";
dotenv.config()

// const {StreamClient} = pkg;

export const getConsultationToken = async (req, res) => {
  try {
      const client = new StreamClient(process.env.STREAM_KEY, process.env.STREAM_SECRET, {timeout: 30000});
      const userId = req.body?._id;
      const newUser = {
        id: userId,
        role: "admin",
        name: req.body?.fullname
      }
      await client.upsertUsers([newUser]);
      const token = await client.generateUserToken({user_id:userId, validity_in_seconds: 60*60*6, iat: new Date().getUTCSeconds(), exp:new Date().setHours(new Date().getHours()+6)});
      return res.status(200).json({message: "Success !", data: token});
  } catch(error) {
      // console.log(error)
      return res.status(500).json({message: error?.message})
  }
}

export const startConsultation = async(req, res) => {
    const {room, doctor, patient, appointment, hospital} = req.body;
    try {
      const emailPatient = patient
      const patientObject = await userService.getUserByEmail(emailPatient);
      const hospitalObj = await hospitalService.getHospitalById(hospital?._id);
      const doctorObj = hospitalObj.doctors.find(doc => doc._id == doctor?._id);
      doctorObj.appointments.forEach(appt => {
        appt.consultation = {}
        if (appt.commonId === appointment?.commonId) {
          appt.consultation.room=room;
          appt.consultation.user=patientObject?.fullname;
        }
      })
      patientObject.appointments.forEach(appt => {
        appt.consultation = {}
        if (appt.commonId === appointment?.commonId) {
          appt.consultation.room=room;
          appt.consultation.user = doctor?.fullname
        }
      })
      try {
        const booked = patientObject.save();
        const isBooked = hospitalObj.save();
        return res.status(200).json({message: "Consultation started successfully !"});
      }catch(error) {
        console.error(error);
        }
    }catch(error) {
        console.error(error)
    }
}

export const endConsultation = async (req, res) => {
  const {room, doctor, patient, appointment, hospital} = req.body;
  try {
    const patientObject = await userService.getOneUser({email: patient});
    const hospitalObj = await hospitalService.getHospitalById(hospital?._id);
    const doctorObj = hospitalObj.doctors.find(doc => doc._id == doctor?._id);
    doctorObj.appointments.forEach(appt => {
      if (appt.commonId === appointment?.commonId) {
        appt.consultation.status="DONE"
      }
    })
    patientObject.appointments.forEach(appt => {
      if (appt.commonId === appointment?.commonId) {
        appt.consultation.status="DONE"
      }
    })
    try {
      const booked = patientObject.save();
      const isBooked = hospitalObj.save();
      return res.status(200).json({message: "Consultation ended successfully !"});
    }catch(error) {
      console.error(error);
      }
  }catch(error) {
      console.error(error)
  } 
}

export const issuePrescription = async(req, res) => {
    try {
      const {doctor, hospital, prescription, patient, appointment, complains} = req.body;
      const patientObject = await userService.getOneUser({fullname: patient});
      const hospitalObj = await hospitalService.getHospitalById(hospital?._id);
      const doctorObj = hospitalObj.doctors.find(doc => doc._id == doctor?._id);
      patientObject.appointments.forEach(appt => {
          if(appt.commonId === appointment?.commonId) {
              appt.consultation.prescription = prescription;
          }
      })
      doctorObj.appointments.forEach(appt => {
          if (appt.commonId === appointment?.commonId) {
              appt.consultation.prescription = prescription;
          }
      })
      patientObject.ehr.push({
        details: prescription?.diagnosis,
        complains,
        prescription,
        // vitals,
        lab: doctorObj?._id,
        doctor: doctorObj?.fullname
      })
      try {
        const booked = patientObject.save();
        const isBooked = hospitalObj.save();
        return res.status(200).json({message: "Prescription issued successfully !"});
      }catch(error) {
        console.error(error);
        }
    }catch(error) {
      console.error(error)
    }
}

export const deletePrescription = async (req, res) => {
    const {doctor, hospital, patient, appointment} = req.body;
    try {
      const patientObject = await userService.getUserByEmail(patient);
      const hospitalObj = await hospitalService.getHospitalById(hospital?._id);
      const doctorObj = hospitalObj.doctors.find(doc => doc._id == doctor?._id);
      patientObject.appointments.forEach(appt => {
          if(appt.commonId === appointment?.commonId) {
              appt.consultation.prescription = [];
          }
      })
      doctorObj.appointments.forEach(appt => {
          if (appt.commonId === appointment?.commonId) {
              appt.consultation.prescription = [];
          }
      })
      try {
        const booked = patientObject.save();
        const isBooked = hospitalObj.save();
        return res.status(200).json({message: "Prescription deleted successfully !"});
      }catch(error) {
        console.error(error);
        }
    }catch(error) {
      console.error(error)
    }
}

export const sendFollowUpForm = async(req, res) => {
    try {
        const {source, destination, communication, consultation} = req.body;
        const user = await userService.getUserById(destination)
        user.appointments.forEach(userAppt => {
            if(userAppt.consultation?._id == consultation)
            {
              userAppt.consultation.prescription.followup.push({
                  source,
                  communication
              })
            }
        })
        user.save()
        return res.json({message: "Follow-up Form sent successfully"}).status(200)
    } catch(error) {
      console.log(error)
    }
}

export const responseToForm = async(req, res) => {
      const {patient, followup, consultation} = req.body;
      try {
        console.log(req.body)
          const patientObject = await userService.getUserById(patient?._id);
          patientObject?.appointments.forEach(appt => {
            if (appt.consultation?._id == consultation) {
                appt.consultation.prescription.followup = followup
                // followUps.forEach(fUp => {
                //   if (fUp._id == followup?._id)
                //   {
                //     fUp.communication = followup?.communication
                //   }
                // })
            }
          })
          await patientObject.save()
          return res.json({message: "Response sent successfully !"}).status(200);
      } catch(error) {
        console.log(error);
        return res.json({message: "An error occurred"}).status(400);
      }
}