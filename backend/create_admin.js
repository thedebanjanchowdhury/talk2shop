const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const adminEmail = "admin@talk2shop.com";
    const adminPassword = "admin123";

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin user already exists:");
      console.log(`Email: ${adminEmail}`);
      console.log("Password: (as previously set)");
      if (!existingAdmin.isAdmin) {
          existingAdmin.isAdmin = true;
          await existingAdmin.save();
          console.log("Updated existing user to Admin.");
      }
    } else {
      const newAdmin = new User({
        name: "Admin User",
        email: adminEmail,
        password: adminPassword,
        isAdmin: true,
      });

      await newAdmin.save();
      console.log("Admin user created successfully!");
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    }

    mongoose.disconnect();
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
