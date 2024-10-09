require('dotenv').config()

const express = require('express')
// app
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const { plaidClient } = require("../backend/plaid-require")
// allowance of the port 3000 to communicate
app.use(cors({ origin: 'http://localhost:3000' }))

// Plaid API keys and environmental configurations taken from .env

const PLAID_ENV = process.env.PLAID_ENV || 'sandbox'
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID
const PLAID_SECRET = process.env.PLAID_SECRET
const PLAID_COUNTRY_CODES = process.env.PLAID_COUNTRY_CODES
const PLAID_PRODUCTS = process.env.PLAID_PRODUCTS


// models
const Account = require('./models/Account')
const User = require('./models/User')
const Item = require('./models/Item')
const Transaction = require('./models/Transaction')

app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})


//connect to db
mongoose.connect(process.env.MONGO_URI, {
})
    .then(() => {
        app.listen(process.env.PORT, () => {console.log('Connected to DB and listening on port', process.env.PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    })


// router to routes
const transactionsRoutes = require('./routes/transactions')
const userRoutes = require('./routes/user')
const plaidRoutes = require('./routes/plaidLink')

//routes usage with api call
app.use("/api/transactions", transactionsRoutes)
app.use("/api/user", userRoutes)
app.use("/api/plaid-link", plaidRoutes)


const {response, urlencoded, json} = require("express");

const webHookApp = express() //our ngrok server webhook

webHookApp.use(urlencoded({ extended: false})) // filters body out
webHookApp.use(json());
WEBHOOK_PORT = process.env.WEBHOOK_SERVER_PORT

const plaidLinkController = require('./controllers/plaidLinkController');

const webhookServer = webHookApp.listen(WEBHOOK_PORT, function(){
    console.log("Server is up and running on ", process.env.WEBHOOK_SERVER_PORT)
})


webHookApp.post("/server/receive_webhook", async (request, response, next) =>{
    try {

        let code = request.body.webhook_code
        let product = request.body.webhook_type
        console.log(product)

        const itemId = request.body.item_id
        if (code == "SYNC_UPDATES_AVAILABLE" && product == "TRANSACTIONS"){
            const userId = await webHookGetUserIdByPlaidId(itemId)
            const transactionFill = await plaidLinkController.populateTransactionsWebhook(itemId,userId)
        } else {
            console.log("Not applicable webhook")
        }

    }catch(error) {
        console.log(error)
    }
})

const webHookGetUserIdByPlaidId = async(itemId) => {
    try {
        const userId = await Item.findOne({plaidItemId:itemId}, {userId: 1})
        return userId
    } catch (error){
        console.log(error)
    }

}
function webHookHandler(webhookBody) {

}







//BOILERPLATE TAKEN FROM PLAID API AND THEN EDITED FOR NEEDS
// MODULARISATION USING ROUTER


