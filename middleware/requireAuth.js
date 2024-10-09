
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const requireAuth = async function(request, response, next) {

    // is auth true?
    const { authorization } = request.headers // passed as a string jwt token where it is split in 2 parts

    if (!authorization){
        return response.status(401).json({error: 'You are not Authorized'})
    }

    // it looks like Bearer dsajiohduioashuadshouhasod.jdoiasjo stored in user._id
    // gets rid of the Bearer part
    const token = authorization.split(' ')[1]

    try {
        const {_id} = jwt.verify(token, process.env.USER_SECRET)

        request.user = await User.findOne({_id}).select('_id') // slims down the document to just _id
        next()
    } catch (error){
        console.log(error)
        response.status(401).json({error: 'Authorization request failed'})
    }

}

module.exports = requireAuth