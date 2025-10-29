

// ...existing code...
const User = require("../model/user.model");
const fs = require("fs");
const path = require("path");
const canvas = require("canvas");
const { v4: uuid } = require("uuid");
const storageServices = require('../services/storage.services')
const fetch = require("node-fetch");

const registercontroller = async (req, res) => {
  try {
    const { fullname, email } = req.body;
    const file = req.file;

    if (!fullname || !email || !file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Upload image to ImageKit
    const fileUploadResult = await storageServices.uploadFile(file);

    // Save user to DB
    const newUser = await User.create({
      fullname,
      email,
      image: fileUploadResult.url,
    });

    return res.status(201).json({ message: "User registered", user: newUser });
  } catch (error) {
    console.error("Error in registration:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
    registercontroller
}