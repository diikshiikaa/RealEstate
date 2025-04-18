import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  addPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
  getMultiplePosts,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/multiple", getMultiplePosts); // Move this ABOVE
router.get("/:id", getPost); // So this doesn't catch "multiple"
router.post("/", verifyToken, addPost);
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);

export default router;
