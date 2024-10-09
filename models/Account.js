
const {model, Schema} = require('mongoose')


// many accounts within item (i.e checking, savings)
module.exports = model(
    "Account",
    new Schema({
        plaidAccountId:{
            type: String,
            required: true
        },
        plaidItemId:{ // linking the accounts to the actual item
            type: Schema.Types.ObjectId,
            required: true
        },
        userId:{
            type: String,
            required: true
        },
        balances:{
            available: Number,
            current: Number,
            limit: Number,
            iso_currency_code: String,
            unofficial_currency_code: String
        },
        mask:{
            type: String,
        },
        name:{
            type: String,
            required: true
        },
        officialName:{
            type: String,
            required: true
        }
    })
);






