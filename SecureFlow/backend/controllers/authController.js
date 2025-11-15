import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "local_dev_secret";

// ✅ REGISTER USER
export const registerUser = async (req, res) => {
  try {
    let { username, password } = req.body;

    // Normalize input
    if (username) username = username.trim().toLowerCase();

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    // Check for existing user (case-insensitive)
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword });

    // Generate token
    const token = jwt.sign({ username: newUser.username }, JWT_SECRET, { expiresIn: "7d" });

    console.log(`✅ User registered: ${newUser.username}`);
    res.status(201).json({ token });
  } catch (error) {
    console.error("❌ Register error:", error.message);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// ✅ LOGIN USER
export const loginUser = async (req, res) => {
  try {
    let { username, password } = req.body;

    if (username) username = username.trim().toLowerCase();

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "7d" });

    console.log(`✅ User logged in: ${user.username}`);
    res.status(200).json({ token });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
