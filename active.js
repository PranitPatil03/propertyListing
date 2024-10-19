import axios from "axios";

const url = "https://patilpranit3112.activehosted.com";
const activeCampaignUrl =
  "https://patilpranit3112.activehosted.com/api/3/contacts";
const apiKey =
  "1efc219e5755cf968f8cea66e1ce149f895b6ef18fde957590de461eea9218d20c609120";

const fetchUserData = async () => {
  try {
    const response = await fetch(
      "https://lumioadmin.ritesh.live/get-all-users"
    );
    const data = await response.json();
    console.log("****user data ***", data.users);
    if (!Array.isArray(data.users)) {
      throw new Error("Invalid user data format");
    }
    const formattedUsers = data.users.map((user) => ({
      email: user.emailAddresses[0].emailAddress || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
    }));

    return formattedUsers;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return [];
  }
};

const addUserToActiveCampaign = async (user) => {
  const { email, firstName, lastName, phone } = user;
  const data = {
    contact: {
      email,
      firstName,
      lastName,
      phone,
    },
  };

  try {
    const response = await axios.post(activeCampaignUrl, data, {
      headers: {
        "Api-Token": apiKey,
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error(
      `Error adding user ${email}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const addMultipleUsers = async () => {
  try {
    const users = await fetchUserData();
    console.log("user herer", users);
    if (!Array.isArray(users) || users.length === 0) {
      console.log("No users data available or invalid data format");
      return;
    }
    const responses = await Promise.all(
      users.map((user) => addUserToActiveCampaign(user))
    );

    responses.forEach((response, index) => {
      console.log(
        `User ${users[index].email} added successfully:`,
        response.data
      );
    });
  } catch (error) {
    console.error("Error adding users:", error);
  }
};
