const User = require("../model/user.model");
const fs = require("fs");
const path = require("path");
const canvas = require("canvas");

const fetch = require("node-fetch");

// face-api.js
let faceapi;
try {
  faceapi = require("face-api.js");
  if (!faceapi) throw new Error("face-api.js not available");
} catch (e) {
  try {
    faceapi = require("@vladmandic/face-api");
  } catch (err) {
    console.error("Please install face-api.js or @vladmandic/face-api:", err);
    faceapi = null;
  }
}

const { Canvas, Image, ImageData } = canvas;
if (faceapi && faceapi.env && typeof faceapi.env.monkeyPatch === "function") {
  faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
}

const MODEL_URL = path.join(__dirname, "../models");
let modelsLoaded = false;

// Load models once at server start
async function loadModelsIfNeeded() {
  if (modelsLoaded) return;
  if (!faceapi || !faceapi.nets) throw new Error("face-api library not available");

  // Check for SSD MobileNet manifest
  const manifest = path.join(MODEL_URL, "ssd_mobilenetv1_model-weights_manifest.json");
  if (!fs.existsSync(MODEL_URL) || !fs.existsSync(manifest)) {
    throw new Error(`Face-api models not found in: ${MODEL_URL}`);
  }

  // Load models
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);

  modelsLoaded = true;
  console.log("✅ Face-api.js models loaded");
}

// Call this **once at server startup**
loadModelsIfNeeded().catch((err) => console.error("Failed to load face-api models:", err));

const logincontroller = async (req, res) => {
  try {
    // Ensure models are loaded
    if (!modelsLoaded) {
      return res.status(503).json({
        success: false,
        message: "Face recognition models are not loaded. Try again later.",
      });
    }

    const { email } = req.body;
    const file = req.file; // Multer memoryStorage

    if (!email || !file) {
      return res.status(400).json({ success: false, message: "Email and image are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Load stored image from ImageKit URL
    const imgResponse = await fetch(user.image);
    const storedBuffer = await imgResponse.arrayBuffer();
    const storedImg = await canvas.loadImage(Buffer.from(storedBuffer));

    // Load captured image from memory
    const capturedImg = await canvas.loadImage(file.buffer);

    // Detect faces and descriptors
    const storedDetections = await faceapi
      .detectSingleFace(storedImg)
      .withFaceLandmarks()
      .withFaceDescriptor();

    const capturedDetections = await faceapi
      .detectSingleFace(capturedImg)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!storedDetections || !capturedDetections) {
      return res.status(400).json({ success: false, message: "Face not detected" });
    }

    // Compare descriptors
    const distance = faceapi.euclideanDistance(
      storedDetections.descriptor,
      capturedDetections.descriptor
    );

    const THRESHOLD = 0.6;
    if (distance < THRESHOLD) {
      return res.json({ success: true, message: "Login successful!" });
    } else {
      return res.status(401).json({ success: false, message: "Face not recognized" });
    }
  } catch (err) {
    console.error("Face login error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

module.exports = logincontroller;
