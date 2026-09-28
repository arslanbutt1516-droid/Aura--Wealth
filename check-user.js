const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = "mongodb+srv://arslanbutt1516_db_user:Arslan%40123@testcluter1.kkgiqzj.mongodb.net/bondwise?appName=TestCluter1";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
});

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    const user = await UserModel.findOne({ email: "admin@aurawealth.com" }).select("+passwordHash");
    if (user) {
      console.log("User found:", user.email);
      const isMatch = await bcrypt.compare("adminpassword123", user.passwordHash);
      console.log("Password match:", isMatch);
    } else {
      console.log("User not found!");
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
