import fs from "fs"

export const uploadFile = (file_to_upload,path_to_file,uploadDir) =>{
var uploaded = true;
if (!fs.existsSync(uploadDir))
fs.mkdirSync(uploadDir, {recursive: true})
file_to_upload.mv(path_to_file)
return uploaded
}