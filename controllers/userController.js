
// logging in
const jwt = require('jsonwebtoken')
const User = require('../models/User')


const createToken = (_id) => {
    return jwt.sign({_id}, process.env.USER_SECRET, { expiresIn: '2d' })
}

const loginUser = async(request, response) => {
    const {email, password} = request.body
    try {
        const user = await User.login(email, password) // passing to schema function

        // token save to database
        const token = createToken(user._id)
        response.status(200).json({email, token})
    } catch (error) {
        response.status(400).json({error: error.message})
    }
}


// signing up

const signupUser = async(request, response) => {
    const {email, password} = request.body

    try {
        const user = await User.signUp(email, password) // passing to schema function

        // token save to database
        const token = createToken(user._id)
        response.status(200).json({email, token}) // return status ok
    } catch (error) {
        response.status(400).json({error: error.message})  //return status not ok
    }

}

module.exports = {loginUser, signupUser}