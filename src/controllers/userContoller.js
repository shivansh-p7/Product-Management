
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');
const userModel = require('../models/userModel');
const {isValidString, isValidObjectId, isValidCity,isValidEmail,isValidImage,isValidMobileNumber,isValidName,isValidPin,isValidpassword} = require('../Validations/validation');

const aws = require('aws-sdk');
const bcrypt = require('bcrypt');

aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region:"ap-south-1"
})

const uploadImage = async (file) => {

    return new Promise(function (resolve, reject) {
        const s3 = new aws.S3({ apiVersion: "2006-03-01" })
        const uploadParams = {
            ACL: 'public-read',
            Bucket: "classroom-training-bucket",
            Key: 'userProfileImage' + file.originalname,
            Body: file.buffer
        }
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject(err.message);
            } return resolve(data.Location);
        });
    });
};



const createUser = async (req, res) => {
    try {
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "please provide information" });
        let { fname, lname, email, phone, password, address,...other } = req.body;

       


        if (fname != undefined && typeof (fname) != 'string') return res.status(400).send({ status: false, message: "wrong fname format" })
        if (!fname || fname.trim() == "") return res.status(400).send({ status: false, message: "fname is required" })
        if (!isValidName(fname)) { return res.status(400).send({ status: false, message: 'fname should be in Alphabets' }) }

        if (lname != undefined && typeof (lname) != 'string') return res.status(400).send({ status: false, message: "wrong lname format" })
        if (!lname || lname.trim() == "") return res.status(400).send({ status: false, message: "lname is mandatory" })
        if (!isValidName(lname)) { return res.status(400).send({ status: false, message: 'lname should be in Alphabets' }) }

        if (email != undefined && typeof (email) != 'string') return res.status(400).send({ status: false, message: "wrong email format" })
        if (!email || email.trim() == "") return res.status(400).send({ status: false, message: "email is mandatory" })
        if (!isValidEmail(email)) { return res.status(400).send({ status: false, message: 'Please enter valid emailId' }) }


        if (phone != undefined && typeof (phone) != 'string') return res.status(400).send({ status: false, message: "wrong phone format" })
        if (!phone || phone.trim() == "") return res.status(400).send({ status: false, message: "phone is mandatory" })
        if (!isValidMobileNumber(phone)) { return res.status(400).send({ status: false, message: 'Please enter valid Mobile Number' }) }

        if (password != undefined && typeof (password) != 'string') return res.status(400).send({ status: false, message: "wrong password format"})
        if (!password || password.trim() == "") return res.status(400).send({ status: false, message: "password is mandatory" })
        if (!isValidpassword(password)) { return res.status(400).send({ status: false, message: "To make strong Password Should be use 8 to 15 Characters which including letters, atleast one special character and at least one Number." }) }
        req.body.password = await bcrypt.hash(password,12);
         
        if (!address) return res.status(400).send({ status: false, message: "address is mandatory" })
        
        req.body.address = JSON.parse(address)

        let { shipping, billing} = req.body.address;

        if (typeof (req.body.address) != 'object') return res.status(400).send({ status: false, message: 'wrong address format' });
       // if(Object.keys(address).length<2||Object.keys(extraAddress).length!=0) return res.status(400).send({ status: false, message: "Address should be in object and must contain shipping and billing addresses" });

       // if (!shipping) return res.status(400).send({ status: false, message: "shipping is mandatory" });
      // shipping = JSON.parse(shipping)
        if (typeof (shipping )!= 'object') return res.status(400).send({ status: false, message: 'wrong shipping format' });

        if (shipping.street != undefined && typeof (shipping.street) != 'string') return res.status(400).send({ status: false, message: "wrong shipping.street format" })
        if (!shipping.street || shipping.street.trim() == '') return res.status(400).send({ status: false, message: 'shipping.street is required' })
        
        if (shipping.city != undefined && typeof (shipping.city) != 'string') return res.status(400).send({ status: false, message: "wrong shipping.city format" })
        if (!shipping.city || shipping.city.trim() == '') return res.status(400).send({ status: false, message: 'shipping.city is required' })
        if (!isValidCity(shipping.city)) { return res.status(400).send({ status: false, message: 'Invalid Shipping city' }) }

        if (shipping.pincode != undefined && typeof (shipping.pincode) != 'number') return res.status(400).send({ status: false, message: "wrong shipping.pincode format" })
        if (!shipping.pincode) return res.status(400).send({ status: false, message: 'shipping.pincode is required' })
        if (!isValidPin(shipping.pincode)) { return res.status(400).send({ status: false, message: 'Invalid Shipping Pin Code.' }) }
        
       // if (!billing) return res.status(400).send({ status: false, message: "shipping is mandatory" });
        if (typeof (billing )!= 'object') return res.status(400).send({ status: false, message: 'wrong billing format' });
        
        if (billing.street != undefined && typeof (billing.street) != 'string') return res.status(400).send({ status: false, message: "wrong billing.street format" })
        if (!billing.street || billing.street.trim() == '') return res.status(400).send({ status: false, message: 'billing.street is required' })
        
        if (billing.city != undefined && typeof (billing.city) != 'string') return res.status(400).send({ status: false, message: "wrong billing.city format" })
        if (!billing.city || billing.city.trim() == '') return res.status(400).send({ status: false, message: 'billing.street is required' })
        if (!isValidCity(billing.city)) { return res.status(400).send({ status: false, message: 'Invalid billing city' }) }

        if (billing.pincode != undefined && typeof (billing.pincode) != 'number') return res.status(400).send({ status: false, message: "wrong billing.pincode format" })
        if (!billing.pincode) return res.status(400).send({ status: false, message: 'billing.pincode is required'})
        if (!isValidPin(billing.pincode)) { return res.status(400).send({ status: false, message: 'Invalid Billing Pin Code.' }) }


        const isDuplicateEmail = await userModel.findOne({ $or: [{ email: email }, { phone: phone }] })
        if (isDuplicateEmail) {
            if (isDuplicateEmail.email == email) { return res.status(400).send({ status: false, message: `This EmailId: ${email} is already exist!` }) }
            if (isDuplicateEmail.phone == phone) { return res.status(400).send({ status: false, message: `This Phone No.: ${phone} is already exist!` }) }
        }

        let files = req.files;
       
        if (files && files.length > 0) {
           
            if (files.length > 1) return res.status(400).send({ status: false, message: "You can't enter more than one file for Create!" })
            if (!isValidImage(files[0]['originalname'])) { return res.status(400).send({ status: false, message: "You have to put only Image." }) }
    
            console.log(files[0]);
            let imgUrl =  await uploadImage(files[0])
            console.log(imgUrl);
            req.body.profileImage = imgUrl
        }
        else {
            return res.status(400).send({ msg: "Please put image to create registration!" })
        }

        let userCreated = await userModel.create(req.body)
        return res.status(201).send({ status: true, message: "User created successfully", data: userCreated })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

//==========================================================================================================================


const userLogin = async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ status: false, msg: "email and password is required" });
        }
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(404).json({
                status: false,
                msg: "No account found with that email, please signup",
            });
        }
        const matchPass = await bcrypt.compare(password, user.password);
        if (!matchPass) {
            return res
                .status(400)
                .json({ status: false, msg: "Email or Password is wrong" });
        }
        const token = jwt.sign(
            { email: user.email, userId: user._id },
            "project5-productManagement-group4",
            { expiresIn: "2h" }
        );
        res.status(200).json({
            status: true,
            msg: "Logged-In Successfully",
            data:{userId:user._id,
            token:token}
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};




const getUser = async (req, res) => {

    try {
        let userId=req.params.userId;
        if(!mongoose.isValidObjectId(userId)) return res.status(400).send({status:false,message:"invalid userId"})
        
        if(userId!=req.decodedToken.userId) return res.status(400).send({status:false,message:"unauthorized"})
         
     
        let userDetails= await userModel.findOne({_id:userId,isDeleted:false}).select({__v:0})
        if(!userDetails) return res.status(404).send({status:false,message:"user Not found"})
     
        return res.status(200).send({status:true,message: "Successfull",data:userDetails})
     
     
     } catch (error) {
         return res.status(500).send({status:false,message:error.message})
     }
}





const updateUser = async (req, res) => {
        try {
             let userId = req.params.userId
            if(!isValidObjectId(userId)) return res.status(400).send({status:false,message:"Please Enter the valid UserId"})
            if(userId!=req.decodedToken.userId) return res.status(400).send({status:false,message:"unauthorized"})
           
            let { fname, lname, email, phone, password, address} = req.body
            let final = {}
        
            if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "Please enter some DETAILS!!!" })
    
            if (fname) {
                if(!isValidString(fname)) return res.status(400).send({status:false,message:"Please Enter in String formate First-Name"})
                if(!/^[a-zA-Z ]{3,15}$/.test(lname)) return res.status(400).send({status:false,message:"Please Enter Valid Last-Name"})
                final.fname = fname
            }
    
            if (lname) {
                if(!isValidString(lname)) return res.status(400).send({status:false,message:"Please Enter in String formate Last-Name"})
                if(!/^[a-zA-Z ]{3,15}$/.test(lname)) return res.status(400).send({status:false,message:"Please Enter Valid Last-Name"})
                final.lname = lname
            }
    
            if (email) {
                if(!isValidString(email)) return res.status(400).send({status:false,message:"Please Enter in String formate Email"})
                if(!isValidEmail(email)) return res.status(400).send({status:false,message:"Please Enter valid Email"})
                final.email = email
            }
    
            if (phone) {
                if(!isValidString(phone)) return res.status(400).send({status:false,message:"Please Enter in String formate phone"})
                if(!isValidMobileNumber(phone)) return res.status(400).send({status:false,message:"Please Enter valid Phone number"})
                final.phone = phone
            }
    
            if (password) {
                if (!isValidString(password)) return res.status(400).send({ status: false, message: "Invalid password details" });
                if(!isValidpassword(password)) return res.status(400).send({status:false,message:"Please put uppercase, lowercase, number, special character and length between 8 to 15"})
            
                const hash = await bcrypt.hash(password,12)
                final.password = hash
            }
    
            if (address) {
                if(typeof(address)!="object") return res.status(400).send({ status: false, message: "Please enter address in object formate" });
    
                address = JSON.parse(address)
    
                let useraddress = userdata.address;
                
                if (address.shipping) {
                    let { street, city, pincode } = address.shipping
                    if (street) {
                        if (!isValidString(street)) return res.status(400).send({ status: true, message: "Street to update is not " })
                        useraddress.shipping.street = street
                    }
                    if (city) {
                        if (!isValidString(city)) return res.status(400).send({ status: true, message: "City to update is not " })
                        useraddress.shipping.city = city
                    }
                    if (pincode) {
                        if (!/^[0-9]{6}$/.test(pincode)) return res.status(400).send({ status: false, message: "Pincode should be six digit only" })
                        useraddress.shipping.pincode = pincode
                    }
                }
    
                if (address.billing) {
                    let { street, city, pincode } = address.billing
                    if (street) {
                        if (!isValidString(street)) return res.status(400).send({ status: true, message: "Street to update is not " })
                        useraddress.billing.street = street
                    }
                    if (city) {
                        if (!isValidString(city)) return res.status(400).send({ status: true, message: "City to update is not " })
                        useraddress.billing.city = city
                    }
                    if (pincode) {
                        if (!/^[0-9]{6}$/.test(pincode)) return res.status(400).send({ status: false, message: "Pincode should be six digit only" })
                        useraddress.billing.pincode = pincode
                    }
                }
                final.address = useraddress
            }
    
            let profileImages = req.files
            if (profileImages && profileImages.length > 0) {
                let url = await aws.uploadImage(profileImages[0])
                final.profileImage = url
            }

            const isDuplicateEmail = await userModel.findOne({ $or: [{ email: email }, { phone: phone }] })
            if (isDuplicateEmail) {
                if (isDuplicateEmail.email == email) { return res.status(400).send({ status: false, message: `This EmailId: ${email} is already exist!` }) }
                if (isDuplicateEmail.phone == phone) { return res.status(400).send({ status: false, message: `This Phone No.: ${phone} is already exist!` }) }
            }
    
            const updatedUser = await userModel.findOneAndUpdate({ _id:userId }, final, { new: true })
            if(!updatedUser) return res.status(404).send({status:false,message:"User does not exist"})
    
            return res.status(200).send({ status: true, message: "Successfully Updated", data: updatedUser })
      
        }
        catch(error){
            return res.status(500).send({status:false,Error:error.message})
        }
    }



module.exports = { createUser, userLogin, getUser, updateUser }

