import express from 'express'
import mongoose from 'mongoose'
import http from 'http'
import { Server } from 'socket.io';
import fileUpload from 'express-fileupload'
import cors from 'cors';
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import * as hospitalService from "./src/services/hospital.service.js"
import userSchema from './src/models/user.model.js';
import hospitalRoutes from "./src/routes/hospital.routes.js";
import roleRoutes from "./src/routes/role.routes.js";
import pharmacyRoutes from "./src/routes/pharmacy.routes.js";
import {config} from "./src/config/db.config.js";
import dotenv from 'dotenv-flow';
import InMemorySessionStore from "./src/utils/sessionStore.js";
import crypto from "crypto"
dotenv.config({ path: 'local.env' });
import path from "path"
import { fileURLToPath } from 'url';
import fs from "fs"
import {uploadFile} from "./src/utils/saveFile.js"
import axios from 'axios';
import { decryptionRequestInterceptor, encryptionResponseInterceptor } from './src/middleware/encryption.js';
import { checkAuthenticated } from './src/middleware/auth.middleware.js';
import session from 'express-session';

const url = `mongodb://${config.dbhost}:${config.dbport}/${config.dbname}`;
//const url = process.env.MONGODB_URI;
let retries = 15;

const app = express()
const server = http.createServer(app)
export const serverio = new Server(server, {
    maxHttpBufferSize: 1e8,
    cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
        credentials: true
    }
});
app.use(cors("*"));

app.use(fileUpload());
app.use(express.json({limit: "200mb"}));
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret: "ikare-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, maxAge:24*60*60 }
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const connectWithRetry = () => {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('MongoDB connected');
        })
        .catch((err) => {
            console.error('Failed to connect to MongoDB', err);
            if (retries > 0) {
                retries -= 1;
                console.log(`Retries left: ${retries}`);
                setTimeout(connectWithRetry, 5000);
            } else {
                console.error('Max retries reached');
            }
        });
};

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

serverio.use((socket, next) => {
    const sessionID = socket.handshake.auth.sessionID;
    if (sessionID) {
      const session = sessionStore.findSession(sessionID);
      if (session) {
        socket.sessionID = sessionID;
        socket.userID = session.userID;
        return next();
      }
    }
    
    socket.sessionID = randomId();
    socket.userID = randomId();
    next();
  });

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
        console.log("Entered !", data);
        if (data.userRole=="PATIENT" || data.userRole=="SUPER") {
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
    socket.on("send-bot-id", async(data) => {
        const room = randomId()
        if (data.userRole=="PATIENT" || data.userRole=="SUPER") {
            const updated = await userSchema.findByIdAndUpdate(data._id, {botSocket:room})
        }
        else if (data.userRole == "DOCTOR") {
            const hospital = await hospitalService.getHospitalById(data.hospital_id);
            hospital.doctors.forEach(doctor => {
                if (doctor._id == data._id){
                    doctor.botSocket = room
                }
            })
            const saved = await hospital.save()
        }
        socket.join(room)
    })
    socket.on("send-mobile-socket", async(data) => {
        const room = randomId()
        if (data.userRole=="PATIENT" || data.userRole=="SUPER") {
            const updated = await userSchema.findByIdAndUpdate(data._id, {mobileSocket:room})
        }
        else if (data.userRole == "DOCTOR") {
            const hospital = await hospitalService.getHospitalById(data.hospital_id);
            hospital.doctors.forEach(doctor => {
                if (doctor._id == data._id){
                    doctor.mobileSocket = room
                }
            })
            const saved = await hospital.save()
        }
        socket.join(room)
    })
    socket.on("send-mobile-bot-socket", async(data) => {
        const room = randomId()
        if (data.userRole=="PATIENT" || data.userRole=="SUPER") {
            const updated = await userSchema.findByIdAndUpdate(data._id, {mobileBotSocket:room})
        }
        else if (data.userRole == "DOCTOR") {
            const hospital = await hospitalService.getHospitalById(data.hospital_id);
            hospital.doctors.forEach(doctor => {
                if (doctor._id == data._id){
                    doctor.mobileBotSocket = room
                }
            })
            const saved = await hospital.save()
        }
        socket.join(room)
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
     socket.on("attach-mobile-document", async (data) => {
        const relativePath = "/src/uploads/"+data.sender+"/chat/"
        const uploadsDir = __dirname+relativePath;
        const documents = []
        if (!fs.existsSync(uploadsDir))
            fs.mkdirSync(uploadsDir, {recursive:true})
        for (let i=0;i<data?.files.length;i++)
        {
            const file = data.files[i];
            const fullPath = uploadsDir+file.fileName;
            documents.push(relativePath+file.fileName);
            fs.writeFileSync(fullPath, file.base64, {encoding: "base64"}, err => {
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
            serverio.to(receiverSocketId).to(receiverObject.mobileSocket).emit("private-message", {sender, message, time, documents:[]})
            const senderObject = await getAndSaveObject(sender, {...data, date: new Date(time)});
        }
        catch(error) {
            console.log(error)
        }    
    })
    socket.on("send-bot-message", async(data) => {
        const sender = data?.sender
        const receiver = data?.receiver
        const message = data?.message
        const time = data?.time
        try {
            const djangoUrl = "http://127.0.0.1:8000/api/diseases/";
            const response = await axios.post(djangoUrl, {symptoms: message});
            const hospitals = await hospitalService.getAllHospitals()
            var receiverObject;
            for (let hospital of hospitals) {
                const receiver = hospital.doctors.find(doc => doc._id == sender);
                if (receiver) {
                    receiverObject = receiver;
                }
            }
            const receiverSocketId = receiverObject.botSocket
            // socket.join(receiverSocketId)
            // console.log("RESPONSE: ", response.data, "SENDER/RECEIVER :", receiverSocketId)
            serverio.to(receiverSocketId).emit("private-bot-message", {receiver:sender, sender:receiver, message:response.data.data.final_prediction.toString(), time, documents:[]})
        }
        catch(error) {
            console.log(error)
        }    
    })
    socket.on("send-mobile-bot-message", async(data) => {
        const sender = data?.sender
        const receiver = data?.receiver
        const message = data?.message
        const time = data?.time
        try {
            const djangoUrl = "http://127.0.0.1:8000/api/diseases/";
            const response = await axios.post(djangoUrl, {symptoms: message});
            const hospitals = await hospitalService.getAllHospitals()
            var receiverObject;
            for (let hospital of hospitals) {
                const receiver = hospital.doctors.find(doc => doc._id == sender);
                if (receiver) {
                    receiverObject = receiver;
                }
            }
            console.log("RESPONSE: ", response.data)
            const receiverSocketId = receiverObject.mobileBotSocket
            serverio.to(receiverSocketId).emit("private-bot-message", {receiver:sender, sender:receiver, message:response.data.data.final_prediction.toString(), time, documents:[]})
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
            serverio.to(receiverSocketId).to(receiverObject.socket).emit("private-message", {sender, message, time, documents:[]})
            const senderObject = await getAndSaveObject(sender, {...data, date: new Date(time)});
        }
        catch(error) {console.log(error)}    
    })
})

// app.use(decryptionRequestInterceptor);
// app.use(encryptionResponseInterceptor);

connectWithRetry();

app.get("/", (req, res) => {
    res.send("<center><h1 style='margin-top: 20%;color:#0d7dd6;'>WELCOME TO CIDRA</h1><h2 style='color:#0d7dd6;'>BACKEND API</h2></center>")
});

app.use('/',  express.static(path.join(__dirname,"/")))
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/role", roleRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/pharmacy", pharmacyRoutes);

app.get("*", (req, res)=>{
    res.status(404).json({message:`Route ${req.path} not found`})
})


export const serverInstance = server.listen(process.env.PORT, (err) => {
    console.log("Server running on port", process.env.PORT)
})

export default app;