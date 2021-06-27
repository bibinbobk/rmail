const GoogleStrategy = require('passport-google-oauth20').Strategy
const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const User = require('../models/User')
const bcrypt = require('bcrypt')

module.exports = function(passport) {
    passport.use('google',
        new GoogleStrategy({
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/auth/google/callback'
            },
            async (accessToken, refreshToken, profile, done) => {
                // console.log(profile);
                const newUser = {
                    googleid: profile.id,
                    email: profile.emails[0].value,
                    displayName: profile.displayName,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    image: profile.photos[0].value,
                }
                // console.log("newUSER => ", newUser);
                try {
                    let user = await User.findOne({ googleid: profile.id})
                    
                    if (user) {
                        done(null, user)
                    } else {
                        user = await User.create(newUser)
                        done(null, user)
                    }
                } catch (error) {
                    console.error(error)
                }
            }
        )
    )

    passport.use('local',
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {

            User.findOne({ email: email})
                .then(user => {
                    // Match User
                    if(!user) {
                        return done(null, false, { message: 'User not found'})
                    }

                    // Match pass
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if(err) throw err

                        if(isMatch) {
                            return done(null, user)
                        } else {
                            return done(null, false, { message: 'Incorrect password' })
                        }
                    })
                })
                .catch(err => console.log(err)) 
        })
    )
    
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user))
    })
}