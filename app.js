const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
// const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')
// const connectDB = require('./config/db')

// Load config
dotenv.config({ path: './config/config.env' })

// Passport config
require('./config/passport')(passport)


// DB Connection
// const connectDB = async() => {
//     try {
//         const conn = mongoose.connect(process.env.MONGO_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//             useFindAndModify: false
//         }).then(m => m.connection.getClient())

//         console.log(`MongoDB Connected: ${conn.connection.host}`)
//     } catch (error) {
//         console.console.error(error);
//         process.exit(1);
//     }
// }
// connectDB()

    const conn = mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }).then(m => m.connection.getClient())

console.log("MongoDB Connected")

const app = express()

// Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Method Override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
    }
}))

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Handlebars Helpers
const { formatDate,
    stripTags,
    truncate 
} = require('./helpers/hbs')

// Handlebars
app.engine('.hbs', exphbs({ helpers: {
    formatDate,
    stripTags,
    truncate,
}, defaultLayout: 'main' , extname: '.hbs' }));
app.set('view engine', '.hbs');

// Sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        clientPromise: conn,
        dbName: "rmail_db",
        stringify: false,
        autoRemove: 'interval',
        autoRemoveInterval: 1 
    })
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Folders
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/mail', require('./routes/mail'))

const PORT = process.env.PORT || 5000

app.listen(
    PORT, 
    console.log(`Server is running on ${process.env.NODE_ENV} mode on port ${PORT}`)
)

