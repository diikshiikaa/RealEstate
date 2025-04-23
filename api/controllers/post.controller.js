import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  const query = req.query;
  try {
    // Fetch posts with buyers relation to determine isBought
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || 0,
          lte: parseInt(query.maxPrice) || 10000000,
        },
      },
      include: {
        buyers: true, // Include buyers to check if the post is bought
      },
    });

    // Add the isBought flag based on whether there are any buyers
    const now = new Date();
    const postsWithFlag = posts.map((post) => ({
      ...post,
      isBought: post.buyers.length > 0, // Set isBought to true if there are buyers
      comingSoon: post.availableFrom && new Date(post.availableFrom) > now,
    }));

    res.status(200).json(postsWithFlag);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  const token = req.cookies?.token;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        buyers: {
          where: {
            userId: req.userId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    const isComingSoon =
      post?.availableFrom && new Date(post.availableFrom) > new Date();

    const isBought = post.buyers.length > 0; // If the current user has bought this post

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          return res.status(200).json({
            ...post,
            isSaved: !!saved,
            comingSoon: isComingSoon,
            isBought,
          });
        } else {
          return res.status(200).json({
            ...post,
            isSaved: false,
            comingSoon: isComingSoon,
            isBought,
          });
        }
      });
    } else {
      return res.status(200).json({
        ...post,
        isSaved: false,
        comingSoon: isComingSoon,
        isBought,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        availableFrom: body.postData.availableFrom
          ? new Date(body.postData.availableFrom)
          : null, // ✅ new line
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    res.status(200).json(newPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to add post" });
  }
};

export const updatePost = async (req, res) => {
  try {
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update post" });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });
    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorised" });
    }

    await prisma.post.delete({
      where: { id },
    });
    res.status(200).json({ message: "Post deleted!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

export const getMultiplePosts = async (req, res) => {
  const ids = req.query.ids?.split(",") || [];
  try {
    const posts = await prisma.post.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        user: true,
        postDetail: true,
        buyers: true, // 👈 include buyers
      },
    });

    const now = new Date();
    const postsWithFlag = posts.map((post) => ({
      ...post,
      isBought: post.buyers.length > 0, // 👈 add isBought flag
      comingSoon: post.availableFrom && new Date(post.availableFrom) > now,
    }));

    res.status(200).json(postsWithFlag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

export const buyPost = async (req, res) => {
  const userId = req.userId;
  const postId = req.params.id;

  try {
    // Check if the post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Optional: Prevent users from buying their own post
    if (post.userId === userId) {
      return res.status(403).json({ message: "You can't buy your own post" });
    }

    // Add record to BoughtPost
    await prisma.boughtPost.create({
      data: {
        userId,
        postId,
      },
    });

    res.status(200).json({ message: "Post bought successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to buy post" });
  }
};
