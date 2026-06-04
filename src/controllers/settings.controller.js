import __dirname from "../../helper.js";
import fs from "fs"
import {uploadFile} from "../utils/saveFile.js"
import * as userService from "../services/user.service.js";
import * as hospitalService from "../services/hospital.service.js";

export const changePicture = async (req, res) => {
    try {
        const {user_id, role} = req.body;
        var user, hospital;
        switch(role) {
          case "DOCTOR":
              hospital = await hospitalService.getHospitalById(req.body?.hospital_id);
              user = hospital.doctors.find(doc => doc._id == user_id);
              break;
          case "PATIENT":
            user = await userService.getUserById(user_id);
             break;
          case "SUPER":
             user = await userService.getUserById(user_id);
             break;
          case "ADMIN":
              hospital = await hospitalService.getHospitalById(req.body?.hospital_id);
              user = hospital.admin;
              break;
        }
        const relativePath = "/src/uploads/"+user?._id+"/avatar/";
        const uploadsDir = __dirname+relativePath;
        var image_path;
        const files = req.files;
        if (req.body.platform == "web") {
            const avatar = files["avatar"];
            const fileUploadPath = uploadsDir + avatar?.name;
            image_path = relativePath + avatar?.name;
            const uploaded= uploadFile(avatar, fileUploadPath, uploadsDir);
        }
        else {
          const {base64} = req.body;
          if (!fs.existsSync(uploadsDir))
              fs.mkdirSync(uploadsDir, {recursive:true});
              const avatar_name = new Date().getTime()+"."+req.body.extension
              const fileUploadPath = uploadsDir+avatar_name;
              image_path = relativePath + avatar_name;
              fs.writeFileSync(fileUploadPath, base64, {encoding:"base64"});
        }
        user.image = image_path;
        if (role == "DOCTOR" || role == "ADMIN")
        await hospital.save()
        else
        await user.save();
        return res.status(200).json({message:"Image uploaded successfully !"});
    } catch(error) {
        console.log(error)
        res.status(500).json({message: error.message});
    }
};