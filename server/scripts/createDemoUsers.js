import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";

// Load environment variables
dotenv.config();

async function createDemoUsers() {
  try {
    // Connect to database
    if (!process.env.MONGO_URI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to database");

    // Demo users data
    const demoUsers = [
      {
        name: "Demo Student",
        email: "student@demo.com",
        password: "Password123!",  // Updated to meet validation requirements
        role: "student",
      },
      {
        name: "Demo Instructor",
        email: "instructor@demo.com",
        password: "Password123!",  // Updated to meet validation requirements
        role: "instructor",
      },
    ];

    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists, updating password...`);
        existingUser.password = userData.password;
        await existingUser.save();
        console.log(`✓ Updated user: ${userData.email} (${userData.role})`);
      } else {
        // Create new user (password will be hashed by the model pre-save hook)
        const user = await User.create(userData);
        console.log(`✓ Created user: ${user.email} (${user.role})`);
      }
    }

    console.log("\n✅ Demo users created/updated successfully!");
    console.log("\nDemo Credentials:");
    console.log("Student: student@demo.com / Password123!");
    console.log("Instructor: instructor@demo.com / Password123!");
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating demo users:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createDemoUsers();

