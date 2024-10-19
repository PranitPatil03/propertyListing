import axios from "axios";

const ACTIVE_CAMPAIGN_API_KEY =
  "1efc219e5755cf968f8cea66e1ce149f895b6ef18fde957590de461eea9218d20c609120";
const ACTIVE_CAMPAIGN_API_URL =
  "https://patilpranit3112.activehosted.com/api/3";

const fetchUserData = async () => {
  try {
    const response = await axios.get(
      "https://lumioadmin.ritesh.live/get-all-users"
    );
    const { users } = response.data;
    if (!Array.isArray(users)) {
      throw new Error("Invalid user data format");
    }
    return users.map((user) => ({
      email: user.emailAddresses[0]?.emailAddress || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      account: user.publicMetaData?.trialStatus
        ? "free"
        : user.publicMetaData?.paymentInfo
        ? "paid"
        : "free"
    }));
  } catch (error) {
    console.error("Error fetching user data:", error);
    return [];
  }
};

const getLists = async () => {
  try {
    const response = await axios.get(`${ACTIVE_CAMPAIGN_API_URL}/lists`, {
      headers: {
        "Api-Token": ACTIVE_CAMPAIGN_API_KEY,
      },
    });
    return response.data.lists;
  } catch (error) {
    console.error(
      "Error fetching lists:",
      error.response?.data || error.message
    );
    return [];
  }
};

const createList = async (listName) => {
  try {
    const existingLists = await getLists();
    const listExists = existingLists.some((list) => list.name === listName);

    if (listExists) {
      console.log(
        `List with name "${listName}" already exists. Skipping creation.`
      );
      return existingLists.find((list) => list.name === listName).id;
    }

    const response = await axios.post(
      `${ACTIVE_CAMPAIGN_API_URL}/lists`,
      {
        list: {
          name: listName,
        },
      },
      {
        headers: {
          "Api-Token": ACTIVE_CAMPAIGN_API_KEY,
        },
      }
    );
    return response.data.list.id;
  } catch (error) {
    console.error(
      "Error creating list:",
      error.response?.data || error.message
    );
    throw new Error("Failed to create list.");
  }
};

const addContactToList = async (listId, contactId) => {
  try {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "Api-Token": ACTIVE_CAMPAIGN_API_KEY,
      },
      body: JSON.stringify({
        contactList: {
          list: listId,
          contact: contactId,
          status: 1,
        },
      }),
    };

    const response = await fetch(
      `${ACTIVE_CAMPAIGN_API_URL}/contactLists`,
      options
    );
    const data = await response.json();
    if (response.ok) {
      console.log(`Added contact ${contactId} to list ${listId}.`);
    } else {
      console.error(`Failed to add contact to list: ${data}`);
    }
  } catch (error) {
    console.error("Error adding contact to list:", error);
  }
};

const createContact = async (contact) => {
  console.log(contact);
  try {
    const response = await axios.post(
      `${ACTIVE_CAMPAIGN_API_URL}/contacts`,
      {
        contact: {
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          phone: contact.phone,
          account: contact.account,
        },
      },
      {
        headers: {
          "Api-Token": ACTIVE_CAMPAIGN_API_KEY,
        },
      }
    );
    return response.data.contact.id;
  } catch (error) {
    if (error.response?.data?.errors?.some((e) => e.code === "duplicate")) {
      console.log(
        `Contact with email ${contact.email} already exists. Skipping.`
      );
      return null;
    }
    console.error(
      `Error creating contact for ${contact.email}:`,
      error.response?.data || error.message
    );
    throw new Error("Failed to create contact.");
  }
};

export const createListAndAddContacts = async (listName) => {
  try {
    const userList = await fetchUserData();

    if (userList.length === 0) {
      console.log("No users to add.");
      return;
    }

    const listId = await createList(listName);

    for (const user of userList) {
      if (user.email) {
        const contactId = await createContact(user);
        if (contactId) {
          await addContactToList(listId, contactId);
        }
      } else {
        console.log(
          `Skipping user with missing email: ${user.firstName} ${user.lastName}`
        );
      }
    }

    console.log(`All contacts have been added to the list: ${listName}`);
  } catch (error) {
    console.error(
      "Error during the list creation and contact addition process:",
      error.message
    );
  }
};
