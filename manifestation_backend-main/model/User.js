const moongoose = require('mongoose');

const UserSchema = new moongoose.Schema({
    name: {
        type: String,
        // required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        // required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    center: {
        type: String,
        // required: [true, 'Center is required'],
        trim: true
    },
    password: {
        type: String,
        // required: [true, 'Password is required'],
        minlength: [6, 'Password should be at least 6 characters']
    },
    isStudent: {
        type: Boolean,
        default: false
    },
    isCoordinator: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

module.exports = moongoose.model('User', UserSchema); 