import mongoose from "mongoose";
const Schema = mongoose.Schema;
 
const RoleSchema = new Schema({
 label: {
	    type:String,
	    default:"PATIENT",
	}
});

export default mongoose.model("Role", RoleSchema);