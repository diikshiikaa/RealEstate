import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const register = async (req, res) => {
  // db operations
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log(newUser);

    // Generate JWT token
    const age = 1000 * 60 * 60 * 24 * 7; // 7 days expiration
    const token = jwt.sign(
      {
        id: newUser.id,
        isAdmin: false, // Set this based on your app's user role logic
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: age,
      }
    );

    // Set the JWT token in a cookie
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Only secure cookies in production (HTTPS)
        sameSite: "None", // Important for cross-origin requests
        maxAge: age, // Set the cookie expiration time
      })
      .status(201)
      .json({ message: "User created successfully!", userInfo: newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create user!" });
  }
};
export const login = async (req, res) => {
  // db operations
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT token
    const age = 1000 * 60 * 60 * 24 * 7; // 7 days expiration
    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin, // Set this based on your app's user role logic
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: age,
      }
    );

    const { password: userPassword, ...userInfo } = user;

    // Set the JWT token in a cookie
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Only secure cookies in production (HTTPS)
        sameSite: "None", // Important for cross-origin requests
        maxAge: age, // Set the cookie expiration time
      })
      .status(200)
      .json(userInfo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to login" });
  }
};
export const logout = (req, res) => {
  //db operations
  res.clearCookie("token").status(200).json({ message: "Logout Successful" });
};
