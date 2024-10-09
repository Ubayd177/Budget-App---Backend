
const express =  require("express")
const {response} = require("express");
const mongoose = require('mongoose')

const router = express.Router();

const Transaction = require('../models/Transaction')


// sync transactions with plaid API
const getAllTransactions = async(request, response) => {
    const userId = request.user._id
    const transactions = await Transaction.find({ userId }).sort({date: -1}) // returning in order

    response.status(200).json(transactions)
};


const getOneTransaction = async(request, response) => {
    try {
        const transactionId = request.params.id
        const userId = request.user.id
        const transaction = await Transaction.findById({ _id: transactionId, userId: userId })
        response.status(200).json({transaction})
    } catch (error) {
        response.json(error)
    }

}

const updateOneTransaction = async(request, response) => {
    const transactionId = request.params.id
    const userId = request.user.id
    const transactions = request.body

    if (!mongoose.Types.ObjectId.isValid){
        return response.status(400).json({error: 'Transaction does not exist'})
    }
// we are only updating the fields that were given to us
    const transaction = Transaction.updateOne({_id: transactionId, userId: userId}, {$set: transactions}).then(
        result => {
            response.status(200).json(result)
        }) .catch(error => {
            response.status(500).json({error: `Could not update the transaction `})
    })


}

const deleteOneTransaction = async(request, response) => {
    const transactionId = request.params.id
    const userId = request.user.id

    if (!mongoose.Types.ObjectId.isValid){
        return response.status(400).json({error: 'Transaction does not exist'})
    }

    const transaction = Transaction.deleteOne({_id: transactionId, userId: userId}).then(
        result =>
        {response.status(200).json("Deleted successfully")}
    ).catch(error =>{
        {
            response.status(400).json("No transaction found")
        }
    })

}

module.exports = {
    getAllTransactions,
    getOneTransaction,
    updateOneTransaction,
    deleteOneTransaction
}