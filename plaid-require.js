

const { Configuration, PlaidEnvironments, PlaidApi } = require('plaid')
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox'
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID
const PLAID_SECRET = process.env.PLAID_SECRET

// BOILERPLATE TAKEN FROM PLAID API AND EDITED
const configuration = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
            'PLAID-SECRET': PLAID_SECRET,
            'Plaid-Version': '2020-09-14',
        },
    },
})

const plaidClient = new PlaidApi(configuration)

// for exporting to server.js the plaid request configs

module.exports = { plaidClient }