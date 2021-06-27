const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const cron = require('node-cron')
const Rmail = require('../models/Rmail')

// @desc    Process for sending mail
// @route   POST /mail/send
router.post('/send', ensureAuth, async (req, res) => {
    
    console.log(req.body)
    console.log("from:", req.user.displayName, req.user.email)
    console.log("to: " ,req.body.to)
    console.log("body   : " ,req.body.body)

    if (req.user.googleid) {
        const oAuth2Client = new google.auth.OAuth2(
            clientId=process.env.GOOGLE_CLIENT_ID,
            clientSecret=process.env.GOOGLE_CLIENT_SECRET,
            redirectUri='http://localhost:3000/home'
        )
        oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN})
    
        try {
            const accessToken = await oAuth2Client.getAccessToken()
            const transport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    type: 'OAuth2',
                    user: `${req.user.email}`,
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                    accessToken: accessToken
                }
            })
    
            const mailOptions = {
                from: `${req.user.displayName} ${req.user.email}`,
                to: `${req.body.to}`,
                subject: `${req.body.subject}`,
                text: `${req.body.body}`,
                html: `${req.body.body}`,
                auth: {
                    user: `${req.user.email}`,
                    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                    accessToken: accessToken
                }
            }
    
            
            console.log('Email =>', mailOptions)
            const result = await transport.sendMail(mailOptions)

            try {
                req.body.user = req.user.id
                console.log(req.body)
                await Rmail.create(req.body)
                res.redirect('/home')
            } catch (error) {
                console.log('error :>> ', error);
                res.render('error/500')
            }

            console.log('Email sent...', result)
            res.redirect('/home')
        } catch (error) {
            console.log('error :>> ', error);
            res.render('error/500')
        }
    } else {
        try {
            let transport = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: 'jordan.davis@ethereal.email',
                    pass: 'XNV6rEpvgDb37P8xcR',
                },
            });

            const mailOptions = {
                from: `${req.user.displayName} ${req.user.email}`,
                to: `${req.body.to}`,
                subject: `${req.body.subject}`,
                text: `${req.body.body}`,
                html: `${req.body.body}`,
            }

            console.log('Email =>', mailOptions)
            const result = await transport.sendMail(mailOptions)

            try {
                req.body.user = req.user.id
                console.log(req.body)
                await Rmail.create(req.body)
                res.redirect('/home')
            } catch (error) {
                console.log('error :>> ', error);
                res.render('error/500')
            }

            console.log('Email sent...', result)
            res.redirect('/home')

        } catch (error) {
            console.log('error :>> ', error);
            res.render('error/500')
        }
    }
    
    



    // const {email} = req.body
    // const msg = {
    //     from: '"Fred Foo 👻" <foo@example.com>', // sender address
    //     to: "bar@example.com, baz@example.com", // list of receivers
    //     subject: "Hello ✔", // Subject line
    //     text: "Hello world?", // plain text body
    //     html: "<b>Hello world?</b>", // html body
    // }


    // // create reusable transporter object using the default SMTP transport
    // let transporter = nodemailer.createTransport({
    //     host: "smtp.ethereal.email",
    //     port: 587,
    //     secure: false, // true for 465, false for other ports
    //     auth: {
    //     user: 'jordan.davis@ethereal.email',
    //     pass: 'XNV6rEpvgDb37P8xcR',
    //     },
    // });

    // // send mail with defined transport object
    // const info = await transporter.sendMail(msg);

    // console.log("Message sent: %s", info.messageId);
    // // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

})

module.exports = router