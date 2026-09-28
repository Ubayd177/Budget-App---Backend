# Budget-App---Backend
The Backend to BudgetFyn (Budgeting Web Application). Used simulated/testing data.

### 🛠️ Tech Stack (Backend): 
**Database:** MongoDB
**Backend framework:** Node.js, Express.js
**API:** Plaid API for retrieving transaction data
**Authentication:** JWT tokens
**Other tools:** Mongoose, Dotenv

### Explanation:
Transaction data is fetched using PlaidAPI. It is then stored into the MongoDB database after data truncation. Mongoose is used to interact between the database and the backend. For login and register authentication JWT tokens are used for authorisation.


This project is not hosted for personal privacy/security purposes as it is a test simulation of banking information and not meant for real use.
This is just a showcase of how the backend would work if dependencies, API keys etc were installed and the backend server was up.


