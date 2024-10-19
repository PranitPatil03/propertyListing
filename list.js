// import axios from "axios";

// // Your ActiveCampaign API key and API URL
// const ACTIVE_CAMPAIGN_API_KEY =
//   "1efc219e5755cf968f8cea66e1ce149f895b6ef18fde957590de461eea9218d20c609120";
// const ACTIVE_CAMPAIGN_API_URL =
//   "https://patilpranit3112.activehosted.com/api/3";

// // Function to fetch user data from your API
// const fetchUserData = async () => {
//   try {
//     const response = await axios.get(
//       "https://lumioadmin.ritesh.live/get-all-users"
//     );
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
//           sender_url: "https://yourwebsite.com",
//           sender_reminder:
//             "You are receiving this email because you signed up on our website.",
//           sender_name: "Your Company",
//           sender_addr1: "123 Street",
//           sender_city: "City",
//           sender_zip: "12345",
//           sender_country: "Country",
//         },
//       },
//       {
//         headers: {
//           "Api-Token": ACTIVE_CAMPAIGN_API_KEY,
//         },
//       }
//     );
//     return response.data.list.id;
//   } catch (error) {
//     console.error(
//       "Error creating list:",
//       error.response?.data || error.message
//     );
//     throw new Error("Failed to create list.");
//   }
// };

// // Function to add a contact to a list in ActiveCampaign
// const addContactToList = async (listId, contact) => {
//   try {
//     const response = await axios.post(
//       `${ACTIVE_CAMPAIGN_API_URL}/contacts`,
//       {
//         contact: {
//           email: contact.email,
//           firstName: contact.firstName,
//           lastName: contact.lastName,
//           phone: contact.phone,
//           listid: [listId], // Adding contact to the specific list
//         },
//       },
//       {
//         headers: {
//           "Api-Token": ACTIVE_CAMPAIGN_API_KEY,
//         },
//       }
//     );
//     return response.data.contact.id;
//   } catch (error) {
//     console.error(
//       `Error adding contact ${contact.email} to list:`,
//       error.response?.data || error.message
//     );
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
//         console.log(
//           `Skipping user with missing email: ${user.firstName} ${user.lastName}`
//         );
//       }
//     }

//     console.log(`All contacts have been added to the list: ${listName}`);
//   } catch (error) {
//     console.error(
//       "Error during the list creation and contact addition process:",
//       error.message
//     );
//   }
// };
