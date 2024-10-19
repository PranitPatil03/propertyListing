import { createClerkClient } from "@clerk/backend";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Check if the secret key is present
if (!process.env.CLERK_SECRET_KEY) {
  throw new Error(
    "Missing Clerk Secret Key. Go to https://dashboard.clerk.com and get your key for your instance."
  );
}

// Create Clerk client with secret key
export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const getAllUsersController = async (req, res) => {
  try {
    // Fetch user list from Clerk
    const { data } = await clerkClient.users.getUserList();

    console.log("my Data -> ", data);

    // Send response with user data
    res.status(200).json({
      success: true,
      users: data,
      totalUsers: data.length,
    });
  } catch (error) {
    // Log and respond with error
    console.error("Internal server error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred.",
    });
  }
};
