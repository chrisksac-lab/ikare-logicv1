import bcrypt from "bcrypt";
import * as userService from "../services/user.service.js";
import userSchema from "../models/user.model.js"
import { generateString, mailMessages } from "../utils/helper.js";
import { getOneToken,createToken } from "../services/token.service.js";
import { SENDMAIL } from "../utils/sendmail.js";
import * as roleService from "../services/role.service.js"
import * as hospitalService from "../services/hospital.service.js";
import validator from "validator";

const saltRound = 10;

export const updateSignature = async (req,res) => {
  try {
      const hospital = await hospitalService.getHospitalById(req.body?.hospital);
      const doctor = hospital.doctors.find(dt => dt._id == req.body?._id);
      doctor.signature = req.body.signature;
      await hospital.save()
      return res.status(200).json({message: "Success !"})
  } catch(error) {
      return res.status(500).json({message:error.message})
  }
}

export const registerSuperAdmin = async (req, res) => {
  const {fullname, email, password, tel, gender} = req.body;
  try {
      if (validator.isEmpty(fullname) || validator.isEmpty(email) || validator.isEmpty(password)
      || validator.isEmpty(tel) || validator.isEmpty(gender)) {
        return res.status(400).json({message: "Fill out the empty fields !"})
    }
    else {
        if (!validator.isEmail(email))return res.status(400).json({message: "Provide a valid value for email !"})
        // if (!validator.isAlphaLocales())return res.status(400).json({message: "Provide a valid value for name !"})
        const salt = await bcrypt.genSalt(saltRound)
        const role = "66808d377e25e98b34e915af"
        const hashedPassword = await bcrypt.hash(password, salt)
        const superExists = await userService.getUserByEmail(email);
        if(superExists)
          return res.status(400).json({message: "Email already taken !"})
        const user = {
          fullname, email, tel, password:hashedPassword, gender, role
        }
        try {
          const created = await userService.createUser(user)
          if (created) return res.status(200).json({message: "Super Admin created successfully !"})
        }
      catch(error) {
        return res.status(500).json({message: "Server error"})
      }

    }
  }
  catch(error) {
    return res.status(500).json({message:"Internal Server Error"})
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const patientsAndSuper = await userService.getAllUsers();
    const hospitals = await hospitalService.getAllHospitals()
    var doctorsAdmins = [];
    for (let hospital of hospitals) {
        doctorsAdmins.push(hospital.admin)
        doctorsAdmins = [...doctorsAdmins, ...hospital.doctors]
    }
    var allUsers = [...patientsAndSuper, ...doctorsAdmins]
   return res.json({ data: allUsers, status: "success", message: 'Fetch users successfully !!!' })?.status(200);
  } catch (err) {
    return res.json({ error: err.message })?.status(500);
  }
};

export const createUser = async (req, res) => {
  const {email, fullname, password, tel, gender} = req.body
  try {
    if (validator.isEmpty(fullname) || validator.isEmpty(email) || validator.isEmpty(password)
      || validator.isEmpty(tel) || validator.isEmpty(gender)) {
        return res.status(400).json({message: "Fill out the empty fields !"})
    }
    if (req.body.email) {
      const isUserFound = await userService.getUserByEmail(req.body.email)
      if (isUserFound) return res.status(400).json({ message: "Sorry user with this email exist already" })
    }
    if (!validator.isEmail(email))return res.status(400).json({message: "Provide a valid value for email !"})
      // if (!validator.isAlphaLocales())return res.status(400).json({message: "Provide a valid value for name !"})
      const salt = await bcrypt.genSalt(saltRound)
      const roleLabel = "PATIENT"
      const role = await roleService.getRoleByLabel(roleLabel)
      const hashedPassword = await bcrypt.hash(password, salt)
      const patientExists = await userService.getUserByEmail(email);
      if(patientExists)
        return res.status(400).json({message: "Email already taken !"})
      const user = {
        fullname, email, tel, password:hashedPassword, gender, role:role._id
      }
      try {
        const created = await userService.createUser(user)
        if (created) return res.status(200).json({message: "Registration successful !"})
      }
    catch(error) {
      return res.status(500).json({message: "Server error"})
    }

    return res.json({ data: user, status: "success", message: 'User created successfully' }).status(201);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    if (req.body?.role == "PATIENT" || req.body?.role == "SUPER"){
    const user = await userService.getUserById(req.body.id);
    if (user !== null) return res.json({ data: user, status: "success", message: 'User found !!!' })?.status(204);
    return res.json({ data: user, status: "success", message: `No user found with id: ${id}` })?.status(401);
    }
    else {
       const hospital = await hospitalService.getHospitalByName(req.body.hospitalName);
       const doctor = hospital.doctors.find(doc => doc._id==req.body.id);
       return res.json({data: doctor, message:"Success"})?.status(200);
    }
  } catch (err) {
     return res.json({ error: err.message })?.status(500);
  }
};

export const getPatients = async(req, res) => {
    try {
        const patients = await userService.getAllUsers();
        return res.status(200).json({message: "Success !", data: patients});
    } catch(error) {
        return res.status(500).json({message: error.message});
    }
};

export const updateUser = async (req, res) => {
  try {
    let user = await userService.updateUser(req.params.id, req.body);
    if (user !== null) {
      user = await userService.getUserById(req.params.id);
    }
    res.json({ data: user, status: "success" }).status(200);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    res.json({ data: user, status: "success" }).status(200);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const bookAppointment = async (req, res) => {
    const {date, details, patient, doctor, hospital} = req.body;
    try {
      const patientObject = await userService.getUserByEmail(patient?.email);
      const hospitalObj = await hospitalService.getHospitalByName(hospital);
      const doctorObj = hospitalObj.doctors.find(doc => doc.email === doctor?.email);
      const patientAppointments = patientObject.appointments;
      const parseDate = new Date(date).toISOString();
      patientAppointments.forEach(appt => {
        const apptDate = new Date(appt.date).toISOString();
        if (parseDate === apptDate)
        {
          res.status(400).json({message: "An appointment has been booked at the chosen date and time"});
          return
        }
      })
      const commonId = "appointment"+new Date().getTime();
      const patientAppointmentObject = {
        date, details, user:doctor?.email, commonId
      }
      const doctorAppointmentObject = {
        date, details, user:patient?.email, commonId
      }
      patientObject.appointments.push(patientAppointmentObject);
      doctorObj.appointments.push(doctorAppointmentObject);
      try {
          const booked = patientObject.save();
          const isBooked = hospitalObj.save();
          return res.status(200).json({message: "Appointment booked successfully !"});
      }catch(error) {
        console.error(error);
        res.status(500).json({message: "Retry again, an error occurred !"})
      }
    }catch(error) {
      console.error(error);
      res.status(500).json({message: "Retry again, an error occurred !"})
    }
}

export const respondToAppointment = async(req, res) => {
  const {patient, doctor, hospital, appointment, response} = req.body;
  try {
    const patientObject = await userService.getUserByEmail(patient?.email);
    const hospitalObj = await hospitalService.getHospitalById(hospital?._id);
    const doctorObj = hospitalObj.doctors.find(doc => doc._id == doctor?._id);
    patientObject.appointments.forEach(appt => {
      if (appointment?.commonId === appt.commonId)
        appt.status = response;
    })
    doctorObj.appointments.forEach(appt => {
      if(appointment?.commonId === appt.commonId)
        appt.status = response;
    })
    try {
        const responded = hospitalObj.save()
        const receivedResponse = patientObject.save()
        return res.status(200).json({message: `Appointment ${response} successfully !`});
    } catch(error) {
      console.error(error);
    }
  }catch(error) {
    return res.json({message: error.message}).status(500);
  }
}

export const deleteAppointment = async(req, res) => {
    const {appointment, doctor, hospital} = req.body;
    try {
      const patientObject = await userService.getUserByEmail(patient?.email);
      const hospitalObj = await hospitalService.getHospitalById(hospital?._id);
      const doctorObj = hospitalObj.doctors.find(doc => doc._id === doctor?._id);
      patientObject.appointments = patientObject.appointments.filter(appt => appt.commonId === appointment?.commonId);
      doctorObj.appointments = doctorObj.appointments.filter(appt => appt.commonId===appointment?.commonId)
      try {
          const deleted = hospitalObj.save()
          const receivedDeletion = patientObject.save()
          return res.status(200).json({message: `Appointment deleted successfully !`});
      } catch(error) {
        console.error(error);
      }
    }catch(error) {
      console.error(error);
      return res.json({message: error.message}).status(500);
    } 
}

export const updateAppointmentDetails = async (req, res) => {
  const {appointment, details, date, doctor, patient, hospital} = req.body;
  try {
    const patientObject = await userService.getUserByEmail(patient?.email);
    const hospitalObj = await hospitalService.getHospitalById(hospital?._id);
    const doctorObj = hospitalObj.doctors.find(doc => doc._id === doctor?._id);
    const patientAppointments = patientObject.appointments;
    const parseDate = new Date(date).toISOString();
    patientAppointments.forEach(appt => {
      const apptDate = new Date(appt.date).toISOString();
      if (parseDate === apptDate)
        return res.status(400).json({message: "You got an appointment at the chosen date and time"});
    })
    patientObject.appointments.forEach(appt => {
        if (appt.commonId === appointment?.commonId)
          {
            appt.date = date;
            appt.details = details;
          }
    });
    doctorObj.appointments.forEach(appt => {
        if (appt.commonId === appointment){
          appt.date = date;
          appt.details = details;
        }
    });
    try {
        const booked = patientObject.save();
        const isBooked = hospitalObj.save();
        return res.status(200).json({message: "Appointment details modified successfully !"});
    }catch(error) {
      console.error(error);
      return res.json({message: error.message}).status(500);
    }
  }catch(error) {
    console.error(error);
    return res.json({message: error.message}).status(500);
  } 
}

async function saveObject(sender, receiver){
  try {
    const hospitals = await hospitalService.getAllHospitals()
  var userObject = null
  var selectedHospital
  for (let hospital of hospitals) {
    selectedHospital = hospital
    userObject = hospital.doctors.find(doc => doc._id==sender)
      if (!userObject){
          if (sender == selectedHospital.admin._id) {
              userObject = selectedHospital.admin
              break
          }
      }
  }
  if (!userObject)
    {
        userObject = await userSchema.findById(sender)
        userObject?.notifications.forEach(notif => {
          if (notif.receiver == receiver)
          {
            notif.status = "READ"
          }
        })
        userObject.save()
    }
    else{
        userObject?.notifications.forEach(notif => {
          if (notif.receiver == receiver)
          {
            notif.status = "READ"
          }
        }) 
      await selectedHospital.save()
    }
    return userObject
  }
  catch(error) {
    console.log(error)
    return res.json({message: error.message}).status(500);
  }
}

export const setReadMessages = async (req, res) => {
  try {
      const {sender, receiver} = req.body;
      const senderObject = await saveObject(sender, receiver)
      const receiverObject = await saveObject(receiver, sender)
      return res.status(200).json({message: "Success !", data:receiverObject.notifications.filter(not => not.sender == sender && not.status=="PENDING").length})
  } catch(error) {
    console.log(error)
    return res.status(500).json({message: error.message})
  }
}