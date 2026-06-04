import * as hospitalService from "../services/hospital.service.js"
import userSchema from '../models/user.model.js';
import InMemorySessionStore from "../utils/sessionStore.js";
import crypto from "crypto"
import path from "path"
import * as userService from "../services/user.service.js";
import __dirname from "../../helper.js";
import fs from "fs"
import {uploadFile} from "./src/utils/saveFile.js"

async function getAndSaveObject(id, data) {
    try {
    const hospitals = await hospitalService.getAllHospitals()
    var userObject = null
    var selectedHospital
    for (let hospital of hospitals) {
        selectedHospital = hospital
        userObject = hospital.doctors.find(doc => doc._id==id)
        if (!userObject){
            if (id == selectedHospital.admin._id) {
                userObject = selectedHospital.admin
                break
            }
        }
    }
    if (!userObject)
    {
        userObject = await userSchema.findById(id)
        userObject.notifications.push(data)
        userObject.save()
    }
    else{
        userObject.notifications.push(data) 
       await selectedHospital.save()
    }
    return userObject
    }
    catch(error) {
        console.log("GET SAVE OBJECT ERR: ", error)
    }
}

const randomId = () => crypto.randomBytes(8).toString("hex");
const sessionStore = new InMemorySessionStore();

export function handleChatMobileAndWebDiscussion(serverio) {
    serverio.on('connection', (socket) => {
        sessionStore.saveSession(socket.sessionID, {
            userID: socket.userID,
            connected: true
        })
        socket.emit("session", {
            sessionID: socket.sessionID,
            userID: socket.userID
        })
        socket.on("send-id", async(data) => {
            const room = randomId()
            if (data.userRole=="PATIENT") {
                const updated = await userSchema.findByIdAndUpdate(data._id, {socket:room})
            }
            else if (data.userRole == "DOCTOR") {
                const hospital = await hospitalService.getHospitalById(data.hospital_id);
                hospital.doctors.forEach(doctor => {
                    if (doctor._id == data._id){
                        doctor.socket = room
                    }
                })
                const saved = await hospital.save()
            }
            socket.join(room)
        })
        socket.on("send-mobile-socket", async(data) => {
            const room = randomId()
            if (data.userRole=="PATIENT") {
                const updated = await userSchema.findByIdAndUpdate(data._id, {mobileSocket:socket.userID})
            }
            else if (data.userRole == "DOCTOR") {
                const hospital = await hospitalService.getHospitalById(data.hospital_id);
                hospital.doctors.forEach(doctor => {
                    if (doctor._id == data._id){
                        doctor.mobileSocket = socket.userID
                    }
                })
                const saved = await hospital.save()
            }
            socket.join(socket.userID)
        })
        socket.on("attach-document", async (data) => {
                const relativePath = "/src/uploads/"+data.sender+"/chat/"
                const uploadsDir = __dirname+relativePath;
                const documents = []
                if (!fs.existsSync(uploadsDir))
                    fs.mkdirSync(uploadsDir, {recursive:true})
                for (let i=0;i<data.length;i++)
                {
                    const fullPath = uploadsDir+data.filenames[i]
                    documents.push(relativePath+data.filenames[i]);
                    fs.writeFileSync(fullPath, data.files[i], {encoding: "base64"}, err => {
                        console.log("message: ", err ? "failure":"success")
                    })
                }
                const receiverObject = await getAndSaveObject(data.receiver, {...data, date: new Date(data.time), documents})
                const receiverSocketId = receiverObject.socket
                const senderObject = await getAndSaveObject(data.sender, {...data, date: new Date(data.time), documents});
                serverio.to(receiverSocketId).to(receiverObject.mobileSocket).emit("private-message", {sender:data.sender, message:data.message, time:data.time, documents})
         })
        socket.on("send-message", async(data) => {
            const sender = data?.sender
            const receiver = data?.receiver
            const message = data?.message
            const time = data?.time
            try {
                const receiverObject = await getAndSaveObject(receiver, {...data, date: new Date(time)})
                const receiverSocketId = receiverObject.socket
                const senderObject = await getAndSaveObject(sender, {...data, date: new Date(time)});
                serverio.to(receiverSocketId).to(receiverObject.mobileSocket).emit("private-message", {sender, message, time})
            }
            catch(error) {
                console.log(error)
            }    
        })
        socket.on("send-mobile-message", async(data) => {
            const sender = data?.sender
            const receiver = data?.receiver
            const message = data?.message
            const time = data?.time
            try {
                const receiverObject = await getAndSaveObject(receiver, {...data, date: new Date(time)})
                const receiverSocketId = receiverObject.mobileSocket
                serverio.to(receiverSocketId).to(receiverObject.socket).emit("private-message", {sender, message, time})
                const senderObject = await getAndSaveObject(sender, {...data, date: new Date(time)});
                console.log("Success !", data)
            }
            catch(error) {console.log(error)}    
        })
    })
}