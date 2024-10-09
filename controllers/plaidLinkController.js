

const {plaidClient} = require("../plaid-require");
const User = require("../models/User");
const Item = require("../models/Item");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");


//create token
const createLinkToken = async function (request, response,next) {
            // Get the client_user_id by searching for the current user
    try {
        const plaidRequest = {
            user: {
                // Taken from process.env
                client_user_id: process.env.PLAID_CLIENT_ID,
            },
            client_name: 'Plaid Test App',
            products: process.env.PLAID_PRODUCTS.split(','),
            language: 'en',
            webhook: 'https://425e-2a02-c7c-50b3-d800-879-5539-f370-7e5c.ngrok-free.app',
            country_codes: process.env.PLAID_COUNTRY_CODES.split(','),
        };

        // Creates the link temporary token then sends to my server
        const createTokenResponse  = await plaidClient.linkTokenCreate(plaidRequest);
        response.json(createTokenResponse.data);
    } catch (error ){
        console.log(error)
    }
}

const exchangePublicToken = async function (request, response, next) {
    Promise.resolve()
        .then(async function() {
            const publicToken = request.body.public_token;
            const plaidResponse = await plaidClient.itemPublicTokenExchange({
                public_token: publicToken,
            });
            // institution Id to be used to check if item already exists
            let institutionId = plaidResponse.data.institution_id
            let ACCESS_TOKEN = plaidResponse.data.access_token

            let accessToken = plaidResponse.data.access_token
            let newUser = request.user._id
            console.log(newUser)

            const institutionFound = await getItemByPlaidId(institutionId, newUser)
            if (!institutionFound) {
                await populateItemsWithAccounts(accessToken, newUser)
                await populateTransactions(accessToken, newUser)

            }
            response.json({ accessToken })


        }).catch(next)
}

const populateItemsWithAccounts = async( accessTokenPlaid, newUser ) => {
    try {
        //item saving part
        let plaidResponse = await plaidClient.accountsGet({access_token: accessTokenPlaid})
        let item = plaidResponse.data.item
        let accounts = plaidResponse.data.accounts
        let institutionId = item.institution_id
        // saving my item
        const itemNew = await new Item({
            plaidItemId: item.item_id,
            userId: newUser._id,
            plaidAccessToken: accessTokenPlaid,
            availableProducts: item.available_products,
            billedProducts: item.billed_products,
            institutionId: item.institution_id,
            webhook: item.webhook
        }).save()

        // for every account in my accounts json object I will save it to my database
        const accountsGrouped = accounts.map( async account =>
            await new Account({
                plaidAccountId: account.account_id,
                plaidItemId: itemNew._id,
                userId: newUser._id,
                balances: account.balances,
                mask: account.mask,
                name: account.name,
                officialName: account.official_name,

            }).save()
        )
    } catch (error) {
        console.log(error)
    }
}

const populateTransactions = async( accessTokenPlaid, newUser) => {
    //BOILERPLATE CODE TAKEN FROM PLAID API DOCUMENTATIONS FOR transactions/sync/ https://plaid.com/docs/api/products/transactions/ and adding some edits for database updates
    try {
        let cursor = null
        let added = [] //going to be used for adding new transactions from database
        let modified = [] // going to be used for updating transactions from database
        let removed = [] // going to be used to delete transactions from database
        let hasMore = true // initialized
        while (hasMore) {
            const plaidTransaction = await plaidClient.transactionsSync({access_token: accessTokenPlaid, cursor: cursor})

            const data = plaidTransaction.data;

            // Add this page of results
            added = added.concat(data.added);
            modified = modified.concat(data.modified);
            removed = removed.concat(data.removed);
            hasMore = data.has_more // this checks to see whether there is any more transactions if yes then true if not then false
            cursor = data.next_cursor
        }
        // exit loop when no more transactions

        if (added) {await addNewTransactions(added, newUser)}
        if (modified) {await updateTransactions(modified, newUser)}
        if (removed) {await deleteTransactions(removed, newUser)}

    } catch (error) {
        console.log(error)
    }
}

const addNewTransactions = async (transactionsAdded, newUser) => {
    // going through each transaction in the transactionsAdded array with a promise
    const savedTransactions = await Promise.all(
        transactionsAdded.map(async transaction => {
            const newTransaction = new Transaction({
                transactionId: transaction.transaction_id,
                userId: newUser._id,
                accountId: transaction.account_id,
                personalFinanceCategory: transaction.personal_finance_category.primary,
                date: transaction.date,
                authorizedDate: transaction.authorized_date,
                name: transaction.merchant_name ?? transaction.name,
                amount: transaction.amount,
                currencyCode: transaction.iso_currency_code,
                pendingTransactionId: transaction.pending_transaction_id
            });

            // saving the new transaction
            await newTransaction.save();
        })
    );

    return savedTransactions;
};


const updateTransactions = async (transactionsModified, newUser) => {
    try {
        const addedTransactions = transactionsModified.map( async transaction =>
            Transaction.findOneAndUpdate({transactionId: transaction.transaction_id, userId: newUser._id},
                {
                    personalFinanceCategory: transaction.personal_finance_category.primary,
                    date: transaction.date,
                    authorizedDate: transaction.authorized_date,
                    name: transaction.merchant_name ?? transaction.name,
                    amount: transaction.amount,
                    currencyCode: transaction.iso_currency_code,
                    pendingTransactionId: transaction.pending_transaction_id
                }
            )
        )
    } catch (error) {
        console.error('Error with updating transaction', error)
    }
}

const deleteTransactions = async (transactionsRemoved, newUser) => {
    try {
        const addedTransactions = transactionsRemoved.map( async transaction =>
            Transaction.findOneAndDelete({transactionId: transaction.transaction_id, userId: newUser._id})
        )
    } catch (error) {
        console.error('Error with deleting transaction', error)
    }
}

const getItemByPlaidId = async (plaidInstitution, newUser) => {
    const items = await Item.findOne({plaidInstitutionId: plaidInstitution, userId: newUser._id})
    return items !== null;
    // if not empty return true, if empty return false
}

const populateTransactionsWebhook = async( accessTokenPlaid, userId) => {
    //BOILERPLATE CODE TAKEN FROM PLAID API DOCUMENTATIONS FOR transactions/sync/ https://plaid.com/docs/api/products/transactions/ and adding some edits for database updates
    try {
        let cursor = null
        let added = [] //going to be used for adding new transactions from database
        let modified = [] // going to be used for updating transactions from database
        let removed = [] // going to be used to delete transactions from database
        let hasMore = true // initialized
        while (hasMore) {
            const plaidTransaction = await plaidClient.transactionsSync({access_token: accessTokenPlaid, cursor: cursor})

            const data = plaidTransaction.data;

            // Add this page of results
            added = added.concat(data.added);
            modified = modified.concat(data.modified);
            removed = removed.concat(data.removed);
            hasMore = data.has_more // this checks to see whether there is any more transactions if yes then true if not then false
            cursor = data.next_cursor
        }
        // exit loop when no more transactions

        if (added) {await addNewTransactionsWebhook(added, userId)}
        if (modified) {await updateTransactionsWebhook(modified, userId)}
        if (removed) {await deleteTransactionsWebhook(removed, userId)}

    } catch (error) {
        console.log(error)
    }
}

const addNewTransactionsWebhook = async (transactionsAdded, userId) => {
    // going through each transaction in the transactionsAdded array with a promise
    const savedTransactions = await Promise.all(
        transactionsAdded.map(async transaction => {
            const newTransaction = new Transaction({
                transactionId: transaction.transaction_id,
                userId: userId,
                accountId: transaction.account_id,
                personalFinanceCategory: transaction.personal_finance_category.primary,
                date: transaction.date,
                authorizedDate: transaction.authorized_date,
                name: transaction.merchant_name ?? transaction.name,
                amount: transaction.amount,
                currencyCode: transaction.iso_currency_code,
                pendingTransactionId: transaction.pending_transaction_id
            });

            // saving the new transaction
            await newTransaction.save();
        })
    );

    return savedTransactions;
};


const updateTransactionsWebhook = async (transactionsModified, userId) => {
    try {
        const addedTransactions = transactionsModified.map( async transaction =>
            Transaction.findOneAndUpdate({transactionId: transaction.transaction_id, userId: userId},
                {
                    personalFinanceCategory: transaction.personal_finance_category.primary,
                    date: transaction.date,
                    authorizedDate: transaction.authorized_date,
                    name: transaction.merchant_name ?? transaction.name,
                    amount: transaction.amount,
                    currencyCode: transaction.iso_currency_code,
                    pendingTransactionId: transaction.pending_transaction_id
                }
            )
        )
    } catch (error) {
        console.error('Error with updating transaction', error)
    }
}

const deleteTransactionsWebhook = async (transactionsRemoved, userId) => {
    try {
        const addedTransactions = transactionsRemoved.map( async transaction =>
            Transaction.findOneAndDelete({transactionId: transaction.transaction_id, userId: userId})
        )
    } catch (error) {
        console.error('Error with deleting transaction', error)
    }
}


module.exports = {
    createLinkToken,
    exchangePublicToken
}