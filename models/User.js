const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
})

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;

