
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');
const userModel = require('../models/userModel');
const validators = require('../validations/validations');

const aws = require('aws-sdk');
const encryption = require('bcrypt');

aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
});

const uploadImage = async (file)=>{

   return new Promise( function (resolve,reject){
        const s3 = new aws.S3({apiVersion:'2006-03-01'});
        const uploadParams = {
            ACL:'public-view',
            Bucket:"",
            Key: '/user'+file.originamName,
            Body:file.Buffer
        }
        s3.upload(uploadParams, function(err,success){
            if(err){
                return reject(err.message);
                }return resolve(success.location);
        });
    });
};



const createUser = async (req,res)=>{
    try{
        if(Object.keys(req.body).length==0) return res.status(400).send({status:false,message:"please provide information"});
        let {fname,lname,email,phone,password,address} = req.body;
        let {shipping,billing} = {...address};


        if(fname!=undefined && typeof(fname)!='string') return res.status(400).send({status:false,message:"wrong fname format"})
        if(!fname||fname.trim()=="") return res.status(400).send({status:false,message:"fname is required"})
     


        if(lname!=undefined &&typeof(lname)!='string'||!validators.validName(lname)) return res.status(400).send({status:false,message:"wrong lname format"})
        if(!lname||lname.trim()=="") return res.status(400).send({status:false,message:"lname is mandatory"})
        
        if(email!=undefined && typeof(email)!='string') return res.status(400).send({status:false,message:"wrong email format"})
        if(!email||email.trim()=="") return res.status(400).send({status:false,message:"email is mandatory"})
        


        if(phone!=undefined && typeof(phone)!='string') return res.status(400).send({status:false,message:"wrong email format"})
        if(!phone||phone.trim()=="") return res.status(400).send({status:false,message:"phone is mandatory"})
        
        if(!password||password.trim()=="") return res.status(400).send({status:false,message:"password is mandatory"})
        
        if(!address) return res.status(400).send({status:false,message:"address is mandatory"})

    }catch(err){
        res.status(500).send({status:false,message:err.message})
    }
}



const userLogin= async (req,res)=>{




}




const getUser= async (req,res)=>{




}





const updateUser= async (req,res)=>{




}



module.exports={createUser,userLogin,getUser,updateUser}

