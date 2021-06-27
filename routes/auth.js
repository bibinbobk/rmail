const express = require('express')
const passport = require('passport')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')


// @desc    Local Auth
// @route   GET /auth/register
router.post('/register', async (req, res) => {
    var error_text = ""
    var error_header = ""
    try {
        const { displayName, firstName, lastName, email, password } = req.body;

        let user = await User.findOne({ email: email })
        if(user) throw "Email is already registered"
        
        let newUser = await new User()    
        newUser.displayName = displayName
        newUser.firstName = firstName
        newUser.lastName = lastName
        newUser.email = email
        newUser.password = await newUser.hashPassword(password)
        console.log(newUser)
        newUser.save()
        res.redirect('/')
        
    } catch (error) {
        error_header += "Action Forbidden"
        error_text += error
        res.render('register',{ error_text, error_header, layout: 'login' })
    }
})

// @desc    Local Auth
// @route   POST /auth/login
router.post('/login', passport.authenticate('local', { failureRedirect: '/', }), 
    (req, res) => {
        res.redirect('/home')
    }
)

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['openid', 'email', 'profile'] }))

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
    '/google/callback', passport.authenticate('google', { failureRedirect: '/',}), 
    (req, res) => {
        res.redirect('/home')
    }
)

// @desc    Logout User
// @route   GET /auth/logout
router.get(
    '/logout', (req, res) => {
        req.logout()
        res.redirect('/')
    }
)

module.exports = router