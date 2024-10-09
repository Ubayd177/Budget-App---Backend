
const {model, Schema} = require('mongoose')


// many accounts within item (i.e checking, savings)
module.exports = model(
    "Item",
    new Schema({
        plaidItemId:{ // linking the accounts to the actual item
            type: String,
            required: true
        },
        userId:{
            type: String,
            required: true
        },
        plaidAccessToken:{
            type: String,
            required: true
        },
        availableProducts: Array,
        billedProducts: Array,
        institutionId: String,
        webhook: String
    })
);






