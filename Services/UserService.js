const User = require("../Models/Usermodel");
const RegSVC = require("../Models/RegSVC");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class UserService {
  static async registerUser(
    fullName,
    officerSVC,
    officerRank,
    policeStation,
    Password
  ) {
    try {
      // First, check if the officer's SVC number exists in the RegSVC table
      const validSVC = await RegSVC.findOne({ officerSVC: officerSVC });

      if (!validSVC) {
        console.log("Officer SVC not found in authorized list");
        return {
          success: false,
          message: "Officer SVC number is not authorized for registration",
        };
      }

      // Check if user already exists in the User table
      const existingUser = await User.findOne({
        officerSVC: officerSVC,
      });

      if (existingUser) {
        console.log("User already exists");
        return { success: false, message: "User already exists" };
      }

      console.log("Creating new user with password length:", Password.length);
      const newUser = new User({
        fullName,
        officerSVC,
        officerRank,
        policeStation,
        Password,
      });

      // Save and log the result
      const savedUser = await newUser.save();

      const token = jwt.sign(
        { id: savedUser._id, officerSVC: savedUser.officerSVC },
        process.env.JWT_SECRET,
        { expiresIn: "48h" }
      );

      console.log(
        "User saved. Password hash:",
        savedUser.Password.substring(0, 20) + "..."
      );
      return {
        success: true,
        message: "Officer registered successfully",
        data: {
          token,
          officerSVC: savedUser.officerSVC,
          fullName: savedUser.fullName,
          policeStation: savedUser.policeStation,
        },
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error("Error while registering user");
    }
  }

  static async checkUser(officerSVC) {
    try {
      console.log("Checking user:", officerSVC);
      const user = await User.findOne({ officerSVC });
      console.log("User found:", !!user);
      if (user) {
        console.log(
          "Password hash in DB:",
          user.Password.substring(0, 20) + "..."
        );
      }
      return user;
    } catch (error) {
      console.error("checkUser error:", error);
      throw error;
    }
  }

  static async comparePassword(user, password) {
    try {
      const isMatch = await bcrypt.compare(user, password);
      console.log(isMatch);
      return isMatch;
    } catch (error) {
      console.error("Error comparing password:", error);
      return false;
    }
  }

  static async comparePassword(user, password) {
    try {
      const isMatch = await bcrypt.compare(user, password);
      console.log(isMatch);
      return isMatch;
    } catch (error) {
      console.error("Error comparing password:", error);
      return false;
    }
  }

  static async authenticateToken(authHeader, next) {
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    try {
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        });
      });
      console.log("Token decoded:", decoded);
      return { success: true, message: "Valid Token" };
    } catch (err) {
      console.log("Token verification error:", err.message);
      return { success: false, message: "Invalid or expired token" };
    }
  }

  static async updateProfile(
    officerSVC,
    fullName,
    policeStation,
    contactNumber,
    email,
    officerRank
  ) {
    try {
      if (!officerSVC) {
        return { success: false, message: "Officer SVC is required" };
      }

      const updateData = {};
      if (fullName) updateData.fullName = fullName;
      if (policeStation) updateData.policeStation = policeStation;
      if (contactNumber) updateData.phone = contactNumber;
      if (email) updateData.email = email;
      if (officerRank) updateData.officerRank = officerRank;

      const updatedUser = await User.findOneAndUpdate(
        { officerSVC },
        { $set: updateData },
        { new: true }
      );

      if (!updatedUser) {
        return { success: false, message: "User not found" };
      }

      return {
        success: true,
        message: "Profile updated successfully",
        data: {
          officerSVC: updatedUser.officerSVC,
          fullName: updatedUser.fullName,
          policeStation: updatedUser.policeStation,
        },
      };
    } catch (error) {
      console.error("Error in updateProfile service:", error);
      return { success: false, message: error.message };
    }
  }

  static async getUserById(officerSVC) {
    try {
      console.log("Getting user details for:", officerSVC);
      const user = await User.findOne({ officerSVC });

      if (!user) {
        return { success: false, message: "User not found" };
      }

      return {
        success: true,
        data: {
          officerSVC: user.officerSVC,
          fullName: user.fullName,
          policeStation: user.policeStation,
          officerRank: user.officerRank,
          contactNumber: user.phone || "",
          email: user.email || "",
        },
      };
    } catch (error) {
      console.error("getUserById error:", error);
      return { success: false, message: error.message };
    }
  }

  static async genarateToken(data, secretkey, jwtExp) {
    return jwt.sign(data, secretkey, { expiresIn: jwtExp });
  }
}

module.exports = UserService;
