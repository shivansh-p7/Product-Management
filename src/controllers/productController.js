const productModel = require('../models/productModel')
const aws = require('aws-sdk');
const {uploadImage} = require('../middlewares/awsConection')
const {isValidString, isValidObjectId} = require('../Validations/validation');


exports.createProduct = async (req, res) => {
    try {
        let data = req.body
        let files = req.files

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage, ...other } = data

        if (Object.keys(data).length==0) return res.status(400).send({ status: false, message: "Please provide required data" });
        if (Object.keys(other).length==0) { return res.status(400).send({ status: false, message:`Please remove ${Object.keys(other)} key` }) }

        let info = {}

        if (!validator.isValidString(title)) { return res.status(400).send({ status: false, message: "title is mandatory" }) }
        if (!validator.isValidProductName(title)) { return res.status(400).send({ status: false, message: "invalid Title" }) }
        info.title = title

        if (!validator.isValidString(description)) return res.status(400).send({ status: false, message: "description is mandatory" });
        info.description = description

        if (!validator.isValidString(price)) return res.status(400).send({ status: false, message: "price is mandatory" });
        if (!validator.isValidPrice(price)) return res.status(400).send({ status: false, message: "invalid price" });
        info.price = Number(price)

        if (currencyId) {
            if (!validator.isValidString(currencyId)) return res.status(400).send({ status: false, message: "CurrencyId is mandatory" });
            info.currencyId = currencyId
        }else{
            info.currencyId = "INR"
        }

        if (currencyFormat) {
            if (!validator.isValidString(currencyFormat)) return res.status(400).send({ status: false, message: "currencyFormat is mandatory" });
            info.currencyFormat = currencyFormat
        }else{
            info.currencyFormat = '₹'
        }

        if (isFreeShipping) {
            if (!validator.isValidString(isFreeShipping)) return res.status(400).send({ status: false, message: "provide value of Free Shipping!" });
            if (isFreeShipping !== 'true' && isFreeShipping !== 'false') return res.status(400).send({ status: false, message: "invalid value of Free shipping!" });
            info.isFreeShipping = isFreeShipping
        }

        if (style) {
            if (!validator.isValidString(style)) return res.status(400).send({ status: false, message: "give some style!" });
            if (!validator.isValidName(style)) return res.status(400).send({ status: false, message: "invalid style!" });
            info.style = style
        }

        if (!validator.isValidString(availableSizes)) return res.status(400).send({ status: false, message: "Size is mandatory" });
        availableSizes = availableSizes.split(',').map((size) => size.trim())
        for (let i = 0; i < availableSizes.length; i++) {
            if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes[i])) return res.status(400).send({ status: false, message: "size can contain only S, XS,M, X, L, XXL, XL"});
        }
        info.availableSizes = availableSizes

        if (installments) {
            if (!validator.isValidString(installments)) return res.status(400).send({ status: false, message: "provide value of installments!" });
            if (!installments.match(/^[0-9]+$/)) return res.status(400).send({ status: false, message: "invalid Installments number" });
            info.installments = Number(installments)
        }

        const usedTitle = await productModel.findOne({ title: title });
        if (usedTitle) return res.status(400).send({ status: false, message: "Title is Already in Use" });
        
        if (files && files.length > 0) {
            if (files.length > 1) return res.status(400).send({ status: false, message: "only one file required" })
            if (!validator.isValidImage(files[0]['originalname'])) { return res.status(400).send({ status: false, message: "invalid file format" }) }
            let imageUrl = await uploadImage(files[0])
            info.productImage = imageUrl
        } else {
            return res.status(400).send({ message: "Product Image is mandatory" })
        }

        let createdProduct = await productModel.create(info)

        return res.status(201).send({ status: true, message: "Success", data: createdProduct })

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}

exports.updateProduct = async(req, res) => {

    let productId = req.params.productId

    if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please give correct productId"})
    
    let productData = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!productData) return res.status(404).send({ status: false, message: "No Product Found" })

    let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments} = req.body
    if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "Please enter some data" })
    
    let final = {}

    if (title) {
        if (!isValidString(title)) return res.status(400).send({ status: false, message: "Invalid title details" });
        
        let findTitle = await productModel.findOne({ title: title })
        if (findTitle) return res.status(400).send({ status: false, message: "Title already exist" })
        final.title = title
    }

    if (description) {
        if (!isValidString(description)) return res.status(400).send({ status: false, message: "invalid description" });
        final.description = description
    }

    if (price) {
        if (isNaN(price)) {
            return res.status(400).send({ status: false, message: "Invalid price" });
        }
        final.price = price
    }

    if (currencyId) {
        if (!isValidString(currencyId)) return res.status(400).send({ status: false, message: "CurrencyId invalid format." })
        currencyId = currencyId.toUpperCase()
        if (currencyId !== "INR") return res.status(400).send({ status: false, message: "please enter the correct currencyId " })
        
        final.currencyId = currencyId
    }

    if (currencyFormat) {
        if (!isValidString(currencyFormat)) return res.status(400).send({ status: false, message: "Currency Invalid format." })
        if (currencyFormat !== "₹") return res.status(400).send({ status: false, message: "Please enter the correct currency" })
        
        final.currencyFormat = currencyFormat
    }


    if (style) {
        if (!isValidString(style)) return res.status(400).send({ status: false, message: "Invalid style details" });
        final.style = style
    }

    if (availableSizes) {
        if (!validator.isValidString(availableSizes)) return res.status(400).send({ status: false, message: "Size is mandatory" });
        availableSizes = availableSizes.split(',').map((size) => size.trim())
        for (let i = 0; i < availableSizes.length; i++) {
            if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes[i])) return res.status(400).send({ status: false, message: "size can contain only S, XS,M, X, L, XXL, XL"});
        }
        final.availablesizes = availablesizes
    }

    if (isFreeShipping) {
        isFreeShipping = isFreeShipping.trim().toLowerCase()
        if (typeof(isFreeShipping) !== 'boolean')  return res.status(400).send({ status: false, message: "FreeShipping must have value of either True or False" });
        final.isFreeShipping = isFreeShipping
    }

    if (installments) {
        if (isNaN(installments)) return res.status(400).send({ status: false, message: "Invalid installments details" });
        final.installments = installments
    }

    if (productImage) {
        let productImg = req.files.productImage
        if (productImg && productImage.length > 0) {
            const productImageLink = await aws.uploadFile(productImage[0])
            final.productImage = productImageLink
        }
    }

    let updatedproduct = await productModel.findByIdAndUpdate(productId, final, { new: true })

    return res.status(200).send({ status: true, message: "Successfully Updated", data: updatedproduct })
}



exports.getProductById = async(req, res) => {

    try {
        const productId = req.params.productId
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "ProductId not valid" })
        

        let productData = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productData) return res.status(404).send({ status: false, message: "Product not exist" })
        
        return res.status(200).send({ status: true, message: "Successfull", data: productData })
    } catch (err) {
        return res.status(500).send({ satus: false, err: err.message })
    }

}

exports.deleteProduct = async(req, res) => {

    try {

        const productId = req.params.productId

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "ProductId not valid" })
        
        let productData = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productData) return res.status(404).send({ status: false, message: "Product not exist" })
        
        await productModel.updateOne({ _id: productId }, { isDeleted: true, deletedAt: Date.now() })

        return res.status(200).send({ status: true, message: "Product Successfully Deleted" })

    } catch (err) {
        return res.status(500).send({ satus: false, err: err.message })
    }

}