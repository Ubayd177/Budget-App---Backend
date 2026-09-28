# Budget-App-Backend
The Backend to BudgetFyn (Budgeting Web Application). Used simulated/testing data.

### 🛠️ Tech Stack (Backend): 
**Database:** MongoDB<br>
**Backend framework:** Node.js, Express.js<br>
**API:** Plaid API for retrieving transaction data<br>
**Authentication:** JWT tokens<br>
**Other tools:** Mongoose, Dotenv<br>

### Explanation:
Transaction data is fetched using the Plaid API. It is stored in the MongoDB database after data truncation, using Mongoose to interface between the database and backend. For authentication, JWT tokens are used for route authorization. When connecting a bank, a public_token is returned from the frontend and exchanged for an access_token, which is stored in MongoDB via Mongoose. transactionsSync is then called to fetch the transaction data.

### Disclaimer:
This project is not hosted for personal privacy/security purposes as it is a test simulation of banking information and not meant for real use.
This is just a showcase of how the backend would work if dependencies, API keys etc were installed and the backend server was up.


