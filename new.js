import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ACTIVE_CAMPAIGN_API_KEY = process.env.ACTIVE_CAMPAIGN_API_KEY;
const ACTIVE_CAMPAIGN_API_URL = process.env.ACTIVE_CAMPAIGN_API_URL;

const fetchUserData = async () => {
  try {
    const response = await axios.get("http://localhost:4000/api/users");
    const { users } = response.data;
    console.log("users", users.length);

    if (!Array.isArray(users)) {
      throw new Error("Invalid user data format");
    }

    return users.map((user) => {
      const isFreeUser = user.publicMetadata?.trialStatus === "active";
      const isPaidUser = !!user.publicMetadata?.paymentInfo;
      return {
        email: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        account: isFreeUser ? "free" : isPaidUser ? "paid" : "free",
      };
    });
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
    const existingList = existingLists.find((list) => list.name === listName);

    if (existingList) {
      console.log(
        `List with name "${listName}" already exists. Using existing list.`
      );
      return existingList.id;
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
    console.log(
      `Created new list "${listName}" with ID ${response.data.list.id}`
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
    const response = await axios.post(
      `${ACTIVE_CAMPAIGN_API_URL}/contactLists`,
      {
        contactList: {
          list: listId,
          contact: contactId,
          status: 1,
        },
      },
      {
        headers: {
          "Api-Token": ACTIVE_CAMPAIGN_API_KEY,
        },
      }
    );
    if (response.status === 201) {
      console.log(`Added contact ${contactId} to list ${listId}.`);
    } else {
      console.log(`Failed to add contact to list: ${response.data}`);
    }
  } catch (error) {
    console.error(
      "Error adding contact to list:",
      error.response?.data || error.message
    );
  }
};

const createContact = async (contact) => {
  console.log("Creating contact:", contact);
  try {
    const response = await axios.post(
      `${ACTIVE_CAMPAIGN_API_URL}/contacts`,
      {
        contact: {
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          phone: contact.phone,
          fieldValues: [
            {
              field: "1",
              value: contact.account,
            },
          ],
        },
      },
      {
        headers: {
          "Api-Token": ACTIVE_CAMPAIGN_API_KEY,
        },
      }
    );
    console.log(
      `Created contact for ${contact.email} with ID ${response.data.contact.id}`
    );
    return response.data.contact.id;
  } catch (error) {
    if (error.response?.data?.errors?.some((e) => e.code === "duplicate")) {
      console.log(
        `Contact with email ${contact.email} already exists. Updating instead.`
      );
      return await updateContact(contact);
    }
    console.error(
      `Error creating contact for ${contact.email}:`,
      error.response?.data || error.message
    );
    throw new Error("Failed to create contact.");
  }
};

const updateContact = async (contact) => {
  try {
    const searchResponse = await axios.get(
      `${ACTIVE_CAMPAIGN_API_URL}/contacts?email=${encodeURIComponent(
        contact.email
      )}`,
      {
        headers: {
          "Api-Token": ACTIVE_CAMPAIGN_API_KEY,
        },
      }
    );

    if (searchResponse.data.contacts.length === 0) {
      throw new Error(`No contact found with email ${contact.email}`);
    }

    const existingContact = searchResponse.data.contacts[0];
    const updateResponse = await axios.put(
      `${ACTIVE_CAMPAIGN_API_URL}/contacts/${existingContact.id}`,
      {
        contact: {
          firstName: contact.firstName,
          lastName: contact.lastName,
          phone: contact.phone,
          fieldValues: [
            {
              field: "1",
              value: contact.account,
            },
          ],
        },
      },
      {
        headers: {
          "Api-Token": ACTIVE_CAMPAIGN_API_KEY,
        },
      }
    );
    console.log(
      `Updated contact for ${contact.email} with ID ${existingContact.id}`
    );
    return existingContact.id;
  } catch (error) {
    console.error(
      `Error updating contact for ${contact.email}:`,
      error.response?.data || error.message
    );
    throw new Error("Failed to update contact.");
  }
};

export const createListAndAddContacts = async () => {
  try {
    const userList = await fetchUserData();

    if (userList.length === 0) {
      console.log("No users to add.");
      return;
    }

    const freeUserListId = await createList("Free Users");
    const paidUserListId = await createList("Paid Users");

    for (const user of userList) {
      if (user.email) {
        const contactId = await createContact(user);
        if (contactId) {
          if (user.account === "free") {
            await addContactToList(freeUserListId, contactId);
          } else if (user.account === "paid") {
            await addContactToList(paidUserListId, contactId);
          }
        }
      } else {
        console.log(
          `Skipping user with missing email: ${user.firstName} ${user.lastName}`
        );
      }
    }

    console.log("All contacts have been added to the respective lists.");
  } catch (error) {
    console.error(
      "Error during the list creation and contact addition process:",
      error.message
    );
  }
};
