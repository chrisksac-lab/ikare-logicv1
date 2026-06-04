import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import * as userService from '../services/user.service.js'
import * as hospitalService from "../services/hospital.service.js"
import { SENDMAIL } from "../utils/sendmail.js";
import { generateString,mailMessages } from "../utils/helper.js";
import { getOneToken,createToken } from "../services/token.service.js";
import { config } from "../config/app.config.js";
import * as roleService from "../services/role.service.js";
import * as fs from "fs";
import __dirname from "../../helper.js";

export const loginUser= async (req,res)=>{
    var user = null
    var userExist = false
    var doctorHospital = null
    if(req.body.auth){
        if(req.body.auth.toLowerCase()==='google' || req.body.auth.toLowerCase()==='facebook'
        || req.body.auth.toLowerCase()==='apple'){
        
            if(!req.body.authToken) return res.status(400).json({ error: 'No user found with these credentials' });
            
            user = await userService.getUserByAuthToken(req.body?.authToken)
            if(!user) return res.status(400).json({ error: 'No user found with these credentials' });

            //generate jwt
        }else if(req.body.auth.toLowerCase()==='email_and_password'){
            var user = null
            let userExist = false
            var doctorHospital = null
            const hospitals = await hospitalService.getAllHospitals()
            for (var hospital of hospitals) {
                user = hospital.doctors.find(doc => doc.email==req.body.email)
                if (user) {
                    const doctorPass = user.password;
                    const isDoctorPassValid = await bcrypt.compare(req.body.password, doctorPass)
                    if (!isDoctorPassValid) return res.status(400).json({ message: 'No user found with these credentials' })
                    userExist = true
                    doctorHospital = hospital
                    const token = jwt.sign({ user },process.env.JWT_TOKEN_KEY,
                        {
                            // expiresIn: config.JWT_EXPIRE_TIME,
                            expiresIn: 6*60*60,
                        }
                      );
                      const roleObject = await roleService.getRole({_id: user?.role})
                     //removing password from user object
                     
                      const { password, ...responseUser } = user._doc;
                      req.session.doctor = user._id;
                      return res.status(200).json({ data: {
                        user:responseUser,token, role:roleObject.label, hospital: doctorHospital ?? null
                      },status:'success',message:'User Login successfull' });
                }
            }
            if (!userExist){
                user = await userService.getUserByEmail(req.body.email)
                if(!user) return res.status(400).json({ message: 'No user found with these credentials' });
                    const isPasswordValid = await bcrypt.compare(req.body.password, user.password)
                    if(!isPasswordValid) return res.status(400).json({ message: 'No user found with these credentials' });
                }
                const token = jwt.sign({ user },process.env.JWT_TOKEN_KEY,
                    {
                        // expiresIn: config.JWT_EXPIRE_TIME,
                        expiresIn: 6*60*60,
                    }
                  );
                  const roleObject = await roleService.getRole({_id: user?.role})
                  if (roleObject.label == "PATIENT") {
                        const absolute_path = __dirname + "/vitals/"
                        if (!fs.existsSync(absolute_path)) {
                            fs.mkdirSync(absolute_path, {recursive:true});
                        }
                        if (!fs.existsSync(absolute_path+user._id+".txt")) {
                            fs.openSync(absolute_path+user._id+".txt", "w");
                        }
                        req.session.patient = user._id;
                        req.session.save(function(err) {
                            if (err) console.log(err)
                        })
                  }
                 //removing password from user object
                 
                  const { password, ...responseUser } = user._doc;
            
                  return res.status(200).json({ data: {
                    user:responseUser,token, role:roleObject.label, hospital: doctorHospital ?? null
                  },status:'success',message:'User Login successfull' });       
            }
    }else{
        return res.status(400).json({ message: 'Please enter auth type' });
    }
}

export const forgotPassword = async (req,res)=>{
    const { email } = req.body;
    const user = await userService.getUserByEmail(email)
    if(!user.email_verified)
        return res.status(403).json({ error: "Sorry this user email is not  verified" });
    
    let token = ''
    let isTokenExist = true
    do{
        token = generateString()
        const result = await getOneToken({token})
        if(!result) 
            isTokenExist = false

    }while(isTokenExist)

    const isSave = await createToken({token,email})
    if(isSave){
        const msg = {
            to:email,
            subject: "Instant Job",
            content: mailMessages('forgot-password',token),
            html: true
        }

        SENDMAIL(msg,(info)=>{
            if(info.messageId){
                return res.status(200).json({data: {token}, status:'success',message:`Token Send to ${email} successfully !!!` });
            }else{
                return res.status(500).json({ error: 'An error occured while sending OTP' });
            }
        })
    }else{
        return res.status(500).json({ error: 'An error occured while saving token' });
    }
}

export const resetPassword = async (req,res)=>{
    const {email,password} = req.body
    let user = await userService.getUserByEmail(email)
    
    if(!user.verified)
        return res.status(403).json({ error: "Sorry this user email is not  verified" });

    //hashing the passwords
    const saltRounds = 10
    const salt = await bcrypt.genSalt(saltRounds)
    const hash = await bcrypt.hash(password, salt)

    user = await userService.updateUser(user.id,{password: hash})
    if(user){
        return res.status(200).json({status:'success',message:"Password changes successfully !!! " });
    }else{
        return res.status(500).json({ error: 'An error occured while updating password' });
    }
}


export const changePassword = async (req,res)=>{
    try {
        const {email,oldPassword,newPassword, role} = req.body
    var user;
        switch(role) {
          case "DOCTOR":
              const hospital = await hospitalService.getHospitalById(req.body?.hospital_id);
              user = hospital.doctors.find(doc => doc.email == email);
              break;
          case "PATIENT":
            user = await userService.getUserByEmail(email);
             break;
          case "SUPER":
             user = await userService.getUserByEmail(email);
             break;
          case "ADMIN":
              const hospital_ = await hospitalService.getHospitalById(req.body?.hospital_id);
              user = hospital_.admin;
              break;
        }
    
    // if(!user.email_verified)
    //     return res.status(403).json({ message: "Sorry this user email is not  verified" });

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password)
    if(!isPasswordValid) return res.status(400).json({ message: 'Incorrect Password Try again' });

    //hashing the passwords
    const saltRounds = 10
    const salt = await bcrypt.genSalt(saltRounds)
    const hash = await bcrypt.hash(newPassword, salt)

    user = await userService.updateUser(user._id,{password: hash})
    return res.status(200).json({status:'success',message:"Password Updated successfully !!! " });
    } catch(error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
}


export const confirmAccount= async(req,res)=>{
    const { token,email } = req.body
    let user = await userService.getUserByEmail(email)
    if (user.otp === token){
        user = await userService.updateUser(user._id, {email_verified: true})
        if(user)  return res.status(200).json({status:'success',message:"Email Confirmed " });
    }
    return res.status(500).json({ error: 'An error occured while trying to confirm account try again' });
}

export const resendOtpCode = async (req,res)=>{
    const { email, _id, validation, message } = req.body;
    const token = generateString();
    const isSave = await userService.updateUser(_id, {otp:token});
    if(isSave){
        const msg = {
            to:email,
            subject: validation,
            content: mailMessages(message,token),
            html: true
        }

        SENDMAIL(msg,(info)=>{
            if(info.messageId){
                return res.status(200).json({data: {token}, status:'success',message:`Token Send to ${email} successfully !!!` });
            }else{
                return res.status(500).json({ error: 'An error occured while sending OTP' });
            }
        })
    }else{
        return res.status(500).json({ error: "Sorry couldn't send OTP" });
    }
}

export const validateOtpCode = async (req, res) => {
    const {email, otp} = req.body;
    const user = await userService.getUserByEmail(email); 
    const isUserOtpValid = user.otp === otp;
    if (isUserOtpValid) {
        return res.status(200).json({message: "User verified successfully !", data:user});
    } 
    return res.status(400).json({message: "User OTP Verification failed !"});
}