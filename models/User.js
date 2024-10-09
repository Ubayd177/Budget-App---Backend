const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator")
const Schema = mongoose.Schema

const userSchema = new Schema({
        email: { // user schema
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            minLength: 4
        }
    })
userSchema.statics.signUp = async function(email, password){

    if (!email && !password){
        throw Error("Please fill both fields")
    }
    if (!email && password) { // validation using validator
        throw Error("Enter email field")
    }
    if (email && !password) {
        throw Error("Enter password field")
    }
    if (!validator.isEmail(email)){
        throw Error("Enter a valid email")
    }
    if (!validator.isStrongPassword(password)){
        throw Error("Enter strong password")
    }

    const exists = await this.findOne({ email }) // finding if the email is already existing

    if (exists) {
        throw Error("Email already in use")
    }
    const salt = await bcrypt.genSalt(10) //salting password - string of char added to end (10)
    const hash = await bcrypt.hash(password, salt) // hashing the password

    const user = await this.create({ email, password: hash })
    return user
}


userSchema.statics.login = async function(email, password){

    if (!email && !password){
        throw Error("Please fill both fields")
    }
    if (!email && password) { // validation using validator
        throw Error("Enter email field")
    }
    if (email && !password) {
        throw Error("Fill in password field")
    }

    const user = await this.findOne({ email })

    if (!user){
        throw Error('Email is incorrect')
    }

    const tokenMatch = await bcrypt.compare(password, user.password) //

    if (!tokenMatch){
        throw Error('Password is incorrect')
    }
    return user
}


module.exports = mongoose.model('User', userSchema)



