const {model, Schema} = require('mongoose')


// the transactions schema that is refined from the PLaid API

module.exports = model(
    "Transaction",
    new Schema({
        transactionId: {
            type: String,
            required: true
        },
        userId: {
            type: String,
            required: true
        },
        accountId: {
            type: String,
            required: true
        },
        personalFinanceCategory: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        authorizedDate: String,
        name: String,
        amount: {
            type: Number,
            required: true
        },
        currencyCode: String,
        pendingTransactionId: String

    })
)

