const express = require('express')
const router = express.Router()
const requireAuth = require('../middleware/requireAuth')


const plaidController = require('../controllers/plaidLinkController')

router.use(requireAuth) // checking if user authorized beforehand

router.post('/create_link_token', plaidController.createLinkToken)

router.post('/exchange_public_token', plaidController.exchangePublicToken)

module.exports = router


