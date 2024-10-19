import { createClerkClient } from "@clerk/backend";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error(
    "Missing Clerk Secret Key. Go to https://dashboard.clerk.com and get your key for your instance."
  );
}

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const getAllUsersController = async (req, res) => {
  try {
    let allUsers = [];
    const limit = 100;
    let offset = 0;
    let hasMoreUsers = true;

    while (hasMoreUsers) {
      const response = await clerkClient.users.getUserList({
        limit,
        offset,
      });

      if (!response.data || response.data.length === 0) {
        hasMoreUsers = false;
      } else {
        allUsers = [...allUsers, ...response.data];
        offset += response.data.length;
      }

      console.log(
        `Fetched ${response.data ? response.data.length : 0} users. Total: ${
          allUsers.length
        }`
      );
    }

    console.log("Fetched all users:", allUsers.length);

    res.status(200).json({
      success: true,
      users: allUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while fetching users.",
      error: error.message,
    });
  }
};
