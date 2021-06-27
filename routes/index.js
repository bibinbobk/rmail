const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const Rmail = require('../models/Rmail')

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
    res.render('login',{
        layout: 'login'
    })
})

// @desc    Register page
// @route   GET /
router.get('/register', ensureGuest, (req, res) => {
    res.render('register',{
        layout: 'login'
    })
})

// @desc    Login/Landing page & shows the list of all mails scheduled for fututre
// @route   GET /home
router.get('/home', ensureAuth, async (req, res) => {
    try {
        const rmails = await Rmail.find({ user: req.user.id }).sort({ createdAt: 'desc'}).lean()
        res.render('home', {
            name: req.user.displayName,
            image: req.user.image,
            rmails
        })
    } catch (error) {
        console.log('error :>> ', error);
        res.render('error/500')
    }
    
    
})

// @desc    Process Create R-mail Form
// @route   POST /add
router.post('/add', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        console.log(req.body)
        await Rmail.create(req.body)
        res.redirect('/home')
    } catch (error) {
        console.log('error :>> ', error);
        res.render('error/500')
    }
})

// @desc    Shows the list of mails sent
// @route   GET /
router.get('/history', ensureAuth, (req, res) => {
    res.render('history', {
        name: req.user.displayName,
        image: req.user.image,
    })
})

// @desc    To Create a Recurring email
// @route   GET /create
router.get('/create', ensureAuth, (req, res) => {
    res.render('create', {
        name: req.user.displayName,
        image: req.user.image,
    })
})

// @desc    To Edit a Recurring email
// @route   GET /edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    console.log(req.body)
    try {
        const rmail = await Rmail.findOne({
            _id: req.params.id
        }).lean()
        
        if (!rmail) {
            console.log('error :>> ', error);
            res.render('error/404')
        }
    
        if (rmail.user != req.user.id) {
            res.redirect('/')
        } else {
            res.render('edit', {
                name: req.user.displayName,
                image: req.user.image,
                rmail,
            })
        }
    } catch (error) {
        console.log('error :>> ', error);
        res.render('error/500')
    }
    
})

// @desc    Processing edit Rmail
// @route   PUT /edit/:id
router.put('/edit/:id', ensureAuth, async (req, res) => {
    console.log(req.body)
    try {
        let rmail = await Rmail.findById(req.params.id).lean()

        if (!rmail) {
            console.log('error :>> ', error);
            res.render('error/404')
        }

        if (rmail.user != req.user.id) {
            res.redirect('/')
        } else {
            rmail = await Rmail.findOneAndUpdate({_id: req.params.id },
                req.body,
                {
                    new: true,
                    runValidators: true
                })
            
            res.redirect('/home')
        }
    } catch (error) {
        console.log('error :>> ', error);
        res.render('error/500')
    }
    
    
})

// @desc    Process Delete Recurring email
// @route   DELETE /delete/:id
router.delete('/delete/:id', ensureAuth, async (req, res) => {
    console.log(req.body)
    try {
        await Rmail.findOneAndRemove({_id: req.params.id})
        res.redirect('/home') 
    } catch (error) {
        console.log('error :>> ', error);
        res.render('error/500')
    }
    
})

module.exports = router