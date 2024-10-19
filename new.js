// import axios from "axios";

// // Your ActiveCampaign API key and API URL
// const ACTIVE_CAMPAIGN_API_KEY =
//   "1efc219e5755cf968f8cea66e1ce149f895b6ef18fde957590de461eea9218d20c609120";
// const ACTIVE_CAMPAIGN_API_URL = 'https://patilpranit3112.activehosted.com/api/3';

// // Function to fetch user data from your API
// const fetchUserData = async () => {
//   try {
//     const response = await axios.get("https://lumioadmin.ritesh.live/get-all-users");
//     const { users } = response.data;
//     if (!Array.isArray(users)) {
//       throw new Error("Invalid user data format");
//     }
//     return users.map((user) => ({
//       email: user.emailAddresses[0]?.emailAddress || "",
//       firstName: user.firstName || "",  
//       lastName: user.lastName || "",    
//       phone: user.phone || "",          
//     }));
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     return [];
//   }
// };

// // Function to create a new list in ActiveCampaign
// const createList = async (listName) => {
//   try {
//     const response = await axios.post(
//       `${ACTIVE_CAMPAIGN_API_URL}/lists`,
//       {
//         list: {
//           name: listName,
//         }
//       },
//       {
//         headers: {
//           'Api-Token': ACTIVE_CAMPAIGN_API_KEY,
//         },
//       }
//     );
//     return response.data.list.id;
//   } catch (error) {
//     console.error("Error creating list:", error.response?.data || error.message);
//     throw new Error("Failed to create list.");
//   }
// };

// // Function to add a contact to a list in ActiveCampaign
// const addContactToList = async (listId, contact) => {
//   console.log("contact here", contact);
//   try {
//     const response = await axios.post(
//       `${ACTIVE_CAMPAIGN_API_URL}/contacts`,
//       {
//         contact: {
//           email: contact.email || "", 
//           firstName: contact.firstName || "",
//           lastName: contact.lastName || "",
//           phone: contact.phone || "",
//           listid: [listId], // Adding contact to the specific list
//         },
//       },
//       {
//         headers: {
//           'Api-Token': ACTIVE_CAMPAIGN_API_KEY,
//         },
//       }
//     );
//     return response.data.contact.id;
//   } catch (error) {
//     if (error.response?.data?.errors?.some(e => e.code === 'duplicate')) {
//       console.log(`Contact ${contact.email} already exists in the system. Skipping.`);
//       return null; // Indicate that the contact was not added
//     }
//     console.error(`Error adding contact ${contact.email} to list:`, error.response?.data || error.message);
//     throw new Error("Failed to add contact.");
//   }
// };

// // Main function to create a list and add all contacts
// export const createListAndAddContacts = async () => {
//   try {
//     const listName = "New User List";
//     const userList = await fetchUserData(); // Fetch the user data

//     if (userList.length === 0) {
//       console.log("No users to add.");
//       return;
//     }

//     const listId = await createList(listName); // Create a new list

//     // Add each user to the newly created list
//     for (const user of userList) {
//       if (user.email) {
//         await addContactToList(listId, user);
//         console.log(`Added ${user.email} to list ${listName}.`);
//       } else {
//         console.log(`Skipping user with missing email: ${user.firstName} ${user.lastName}`);
//       }
//     }

//     console.log(`All contacts have been added to the list: ${listName}`);
//   } catch (error) {
//     console.error("Error during the list creation and contact addition process:", error.message);
//   }
// };

// // Run the process


import axios from "axios";

// Your ActiveCampaign API key and API URL
const ACTIVE_CAMPAIGN_API_KEY =
  "1efc219e5755cf968f8cea66e1ce149f895b6ef18fde957590de461eea9218d20c609120";
const ACTIVE_CAMPAIGN_API_URL = 'https://patilpranit3112.activehosted.com/api/3';

const fetchUserData = async () => {
  try {
    const response = await axios.get("https://lumioadmin.ritesh.live/get-all-users");
    const { users } = response.data;
    if (!Array.isArray(users)) {
      throw new Error("Invalid user data format");
    }
    return users.map((user) => ({
      email: user.emailAddresses[0]?.emailAddress || "",
      firstName: user.firstName || "",  
      lastName: user.lastName || "",    
      phone: user.phone || "",          
    }));
  } catch (error) {
    console.error("Error fetching user data:", error);
    return [];
  }
};

const createList = async (listName) => {
  try {
    const response = await axios.post(
      `${ACTIVE_CAMPAIGN_API_URL}/lists`,
      {
        list: {
          name: listName,
        }
      },
      {
        headers: {
          'Api-Token': ACTIVE_CAMPAIGN_API_KEY,
        },
      }
    );
    return response.data.list.id;
  } catch (error) {
    console.error("Error creating list:", error.response?.data || error.message);
    throw new Error("Failed to create list.");
  }
};

const addContactToList = async (listId, contactId) => {
  try {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'Api-Token': ACTIVE_CAMPAIGN_API_KEY,
      },
      body: JSON.stringify({
        contactList: {
          list: listId, 
          contact: contactId,
          status: 1 
        }
      })
    };

    const response = await fetch(`${ACTIVE_CAMPAIGN_API_URL}/contactLists`, options);
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
  try {
    const response = await axios.post(
      `${ACTIVE_CAMPAIGN_API_URL}/contacts`,
      {
        contact: {
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          phone: contact.phone,
        },
      },
      {
        headers: {
          'Api-Token': ACTIVE_CAMPAIGN_API_KEY,
        },
      }
    );
    return response.data.contact.id;
  } catch (error) {
    console.error(`Error creating contact for ${contact.email}:`, error.response?.data || error.message);
    throw new Error("Failed to create contact.");
  }
};

export const createListAndAddContacts = async () => {
  try {
    const listName = "AgentCoach Users";
    const userList = await fetchUserData(); 

    if (userList.length === 0) {
      console.log("No users to add.");
      return;
    }

    const listId = await createList(listName); 

    for (const user of userList) {
      if (user.email) {
        const contactId = await createContact(user); 
        await addContactToList(listId, contactId);
      } else {
        console.log(`Skipping user with missing email: ${user.firstName} ${user.lastName}`);
      }
    }

    console.log(`All contacts have been added to the list: ${listName}`);
  } catch (error) {
    console.error("Error during the list creation and contact addition process:", error.message);
  }
};




