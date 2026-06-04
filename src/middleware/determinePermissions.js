import Student from '../models/Students.js';
import Settings from '../models/Settings.js';
import Personnels from '../models/Personnels.js';

const getSettings = async () => {
    return await Settings.findById('64ce4f216e5d2cf878be1c55');
}

const getRole = async (model, id) => {
    try {
        const user = await model.findById(id).select('roles');
        console.log(user);
        return user ? user.roles : null;
    } catch (error) {
        console.error(`Error fetching ${model.modelName}'s roles: `, error);
        throw error;
    }
}

const hasPermissionForResource = (roleDetails, permissionType, resource) => {
    if (!roleDetails || !roleDetails[permissionType]) return false;
    return Boolean(roleDetails[permissionType][resource]);
};

export const determinePermissions = async (req, res, next) => {
    const settings = await getSettings();
    const globalPermissions = settings.permissions.filter(permission => permission.status);
    const globalRoles = settings.roles.filter(role => role.status);
    // console.log("Settings:", settings);  // Debug line

    // console.log("Account Type and User ID:", req.accountType, req.userId);  // Debug line
    const roleModelMap = {
        "Student": Student,
        "Personnel": Personnels
    };
    console.log("Role Model Map:", roleModelMap);  // Debug line
    const roleModel = roleModelMap[req.accountType];
    if (!roleModel) return res.status(401).send({ message: "Access Denied" });
    
    const roles = await getRole(roleModel, req.userId);
    console.log(roles);
    console.log(globalPermissions);
    if (!roles) return res.status(404).send({ message: `${req.accountType} roles not found` });

    // const resource = "Manage Concour";
    const resource = req.body.resource;
    const reqsettings = req.body.settings;
    const dashboard = req.body.dashboard;
    console.log("Dashboard:",dashboard);
    if (!resource) {
        if (reqsettings) {
            // Fetch settings where read is true
            let userSettings = [];

            for (const userRoleName of roles) {
                const relevantRole = globalRoles.find(r => r.name === userRoleName.name);
                
                if (relevantRole && relevantRole.settings) {
                    for (const setting in relevantRole.settings.read) {
                        if (relevantRole.settings.read[setting]) {
                            userSettings.push(setting);
                        }
                    }
                }
            }
            // Return the unique settings where read is true
            return res.status(200).send({ settings: [...new Set(userSettings)] });
        }else if(dashboard){
            let userdashboard = [];
            console.log(roles)
            console.log(globalRoles)
            for (const userRoleName of roles) {
                const relevantRole = globalRoles.find(r => r.name === userRoleName.name);
                
                if (relevantRole && relevantRole.permissions) {
                    for (const setting in relevantRole.permissions.read) {
                        if (relevantRole.permissions.read[setting]) {
                            userdashboard.push(setting);
                        }
                    }
                }
            }
            // Return the unique settings where read is true
            return res.status(200).send({ dashboard: [...new Set(userdashboard)] });

        }else {
            return res.status(404).send({ message: "Please Specify the Resource" });
        }
    }


    // Determine the attribute to check based on resource
    const roleAttribute = req.body.settings ? 'settings' : 'permissions';

    const permissions = {};

    for (const globalPermission of globalPermissions) {
        let hasPermission = false;

        for (const userRoleName of roles) {
            const relevantRole = globalRoles.find(r => r.name === userRoleName.name);
            
            if (relevantRole && hasPermissionForResource(relevantRole[roleAttribute], globalPermission.name, resource)) {
                hasPermission = true;
                break;  // break out of user roles loop if permission found
            }
        }

        permissions[globalPermission.name] = hasPermission;
    }

    console.log(permissions);
    if (!permissions.read) return res.status(401).send({ message: "Access Denied"});
    req.permissions = permissions;
    next();
}

