const express = require('express')
const router = express.Router()
const { plaidClient } = require("../plaid-require")

const requireAuth = require("../middleware/requireAuth")
const transactionsController = require('../controllers/transactionsController')


// router.get('/sync', controller.sync)

router.use(requireAuth)
//get all items
router.get('/', transactionsController.getAllTransactions)


// get one
router.get('/:id', transactionsController.getOneTransaction)

//update item
router.patch('/:id', transactionsController.updateOneTransaction)

//delete item
router.delete('/:id', transactionsController.deleteOneTransaction)


module.exports = router
