
import Student from '../models/Students.js';
import Settings from '../models/Settings.js';
import Personnel from '../models/personnel.js'
// Define a function to get the global permissions from the settings


const getGlobalPermissions = async () => {
    const settings = await Settings.findById('64ce4f216e5d2cf878be1c55'); // or whatever method you use to fetch settings
    return settings.permissions;
}
const getGlobalRoles = async () => {
    const settings = await Settings.findById('64ce4f216e5d2cf878be1c55'); // or whatever method you use to fetch settings
    return settings.roles;
}
const getStudentRole = async (studentId) => {
    try {
        const student = await Student.findById(studentId).select('roles');
        return student ? student.roles : null;
    } catch (error) {
        console.error("Error fetching student's roles: ", error);
        throw error; // or return some error object or message.
    }
}
const getPersonnelRole = async (personnelId) => {
    try {
        const personnel = await Personnel.findById(personnelId).select('roles');
        return personnel ? personnel.roles : null;
    } catch (error) {
        console.error("Error fetching Personnel's roles: ", error);
        throw error; // or return some error object or message.
    }
}

export const determinePermissions = async (req, res, next) => {
    // Fetch global permissions from the database
    const globalPermissions = await getGlobalPermissions();
    const globalRoles = await getGlobalRoles();
    // console.log(req.userId);
    // console.log(req.accountType);
    // console.log(globalPermissions);

    let roles = [];
   if (req.accountType === "Student") {
        const studentRoles = await getStudentRole(req.userId);
        // console.log(studentRoles);
        if (!studentRoles) {
            return res.status(404).json({ message: "Student roles not found" });
        }
        roles = studentRoles;
    } else if (req.accountType === "Personnel") {
        const personnelRoles = await getPersonnelRole(req.userId);
        if (!personnelRoles) {
            return res.status(404).json({ message: "Personnel roles not found" });
        }
        roles = personnelRoles;
    } else {
        return res.status(401).json({ message: "Access Denied" });
    }
    function getRoleStatus(roleName) {
        const role = globalRoles.find(r => r.name === roleName);
        return role ? role.status : false;
    }
    const resource = req.body.resource;
    // console.log(roles);
    // console.log(req.body.resource);
    if (!resource) {
        return res.status(404).json({ message: "Please Specify the Resource" });
    }
    let permissions = {};

    globalPermissions.forEach(globalPermission => {
        if (globalPermission.status) {
            permissions[globalPermission.name] = false;  // Default to false
    
            roles.forEach(role => {
                let status = getRoleStatus(role.name);
                if(status){
                    if (role.permissions[globalPermission.name]) {
                        if (Array.isArray(role.permissions[globalPermission.name]) && role.permissions[globalPermission.name].includes(resource)) {
                            
                            permissions[globalPermission.name] = true;
                            // console.log('array');
                        } else if (role.permissions[globalPermission.name][resource]) {
                            permissions[globalPermission.name] = true;
                            // console.log('object');
                        }
                    }
                }
            });
        }
    });
    
    console.log(permissions);
    req.permissions = permissions;  // Attach permissions to the request object
    next();
}