
const mongoose=require("mongoose")

const isValidString = function(value) { //function to check entered data is valid or not
    if (typeof value == 'undefined' || value == null) return false;
    if (typeof value == 'string' && value.trim().length === 0) return false;
    return true;
}

const isValidObjectId = function(value) {
    return mongoose.Types.ObjectId.isValid(value)
}

const isValidName = (value) => { return (/^[A-Z a-z]+$/).test(value); }

const isValidEmail = (value) => { return (/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/.test(value)); }

const isValidpassword = (value) => { return (/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(value)); }

const isValidMobileNumber = (value) => { return ((/^((\+91)?|91)?[6789][0-9]{9}$/g).test(value)); }

const isValidCity = (value) => { return (/^[A-za-z]+$/).test(value) }

const isValidPin = (value) => { return (/^[1-9][0-9]{5}$/).test(value) }

const isValidImage = (value) => { return (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/).test(value) }







module.exports = {isValidString,isValidObjectId, isValidName,isValidMobileNumber,isValidEmail,isValidpassword,isValidCity,isValidPin,isValidImage,}