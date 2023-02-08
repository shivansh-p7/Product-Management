const { isValidObjectId } = require("../Validations/validation");
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const cartModel = require('../models/cartModel');

//___________________________________________Cart Creation_______________________________________________________________
const createCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid userId" })


        //Authorization
       if (userId != req.decodedToken) return res.status(403).send({ status: false, message: "you are not authorised for this action" })
       // Authorization

        const { productId, quantity } = req.body;
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "invalid productId" })

        if (!quantity.toString().match(/^[0-9]+$/) || quantity < 1) return res.status(400).send({ status: false, message: 'quantity should be a natural number' })
        // Check if user exists

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if product exists and is not deleted
        const product = await productModel.findOne({ _id: productId });
        if (!product || product.isDeleted == true) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Check if cart exists for user
        let cart = await cartModel.findOne({ userId:userId });
        if (!cart) {
            // Create a new cart for the user
            cart = new cartModel({
                userId,
                items: [{ productId, quantity }],
                totalPrice: product.price * quantity,
                totalItems: 1,
            });
            await cart.save();
        } else {
            // Add product to existing cart
            let itemIndex = -1;
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].productId.toString() === productId) {
                    itemIndex = i;
                    break;
                }
            }

            if (itemIndex === -1) {
                // Product not in cart, add it
                cart.items.push({ productId, quantity });
                cart.totalPrice += product.price * quantity;
                cart.totalItems += 1;
            } else {
                // Product already in cart, update quantity
                cart.items[itemIndex].quantity += quantity;
                cart.totalPrice += product.price * quantity;
            }

            await cart.save()
        }

        let { __v, ...cartData } = cart._doc

        return res.status(201).json({ status: true, message: "cart successfully created", data: cartData });
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
};

//___________________________________________Fetch Cart_______________________________________________________________
const getCart = async (req, res) => {

    try {

        let userId = req.params.userId;

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid UserId" })

        Authorization
       if (userId != req.decodedToken) return res.status(403).send({ status: false, message: "you are not authorised for this action" })
        Authorization

        let cart = await cartModel.findOne({ userId: userId }).populate({path:"items",populate:{path:"productId"}})
        if (!cart) return res.status(404).send({ status: false, message: "cart does not exist!" })

        return res.status(200).send({ status: true, message: 'Success', data: cart })

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}

//___________________________________________Cart Updation_______________________________________________________________

const updateCart = async (req, res) => {
    try {
        let data = req.body;
        if (Object.keys(data).length == 0) return res.status().send({ status: false, message: "put some data to update cart" });
        let userId = req.params.userId;
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid userId" })
        let { productId, cartId, removeProduct } = data
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "invalid userId" })
        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "invalid userId" })

       // ___________________________________Authorization___________________________________________
       if (userId != req.decodedToken.userId) return res.status(400).send({ status: false, message: "Unauthorized" })
      //  ___________________________________________________________________________________________


        if (![0, 1].includes(removeProduct)) return res.status(400).send({ status: false, message: "put either 1 or 0" })


        let isProductExist = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!isProductExist) return res.status(404).send({ status: false, message: "product does not exist" })

        let cartDetails = await cartModel.findOne({ _id: cartId, userId: userId });

        if (!cartDetails) return res.status(404).send({ status: false, message: "add products in cart first" })

        let productInCart = cartDetails.items.find(product => product.productId == productId);

        if (productInCart == undefined) return res.status(404).send({ status: false, message: "no Product in cart to Update" })
        let productIndex = cartDetails.items.findIndex(product => product.productId == productId);

        if (removeProduct == 1 || productInCart.quantity == 1) {
            cartDetails.items.splice(productIndex, 1)
            const updatedTotalPrice = cartDetails.totalPrice - (isProductExist.price * productInCart.quantity)

            const updatedTotalItems = cartDetails.totalItems - 1
            let updatedCart = await cartModel.findOneAndUpdate({ _id: cartId, userId: userId }, { items: cartDetails.items, totalPrice: updatedTotalPrice, totalItems: updatedTotalItems }, { new: true })
            return res.status(200).send({ status: true, message: "updated successfully", data: updatedCart })
        }
        if (removeProduct == 0) {

            productInCart.quantity = productInCart.quantity - 1;
            cartDetails.items.splice(productIndex, 1, productInCart)
            const updatedTotalPrice = cartDetails.totalPrice - isProductExist.price;
            let updatedCart = await cartModel.findOneAndUpdate({ _id: cartId, userId: userId }, { items: cartDetails.items, totalPrice: updatedTotalPrice }, { new: true })
            return res.status(200).send({ status: true, message: "updated successfully", data: updatedCart })

        }


    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}
//___________________________________________Cart Deletion______________________________________________________________
const deleteCart = async function (req, res) {

    try {
        const userId = req.params.userId

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid UserId" })

        //Authorization
        if (userId != req.decodedToken) return res.status(403).send({ status: false, message: "you are not authorised for this action" })
        //Authorization

        const checkCart = await cartModel.findOne({ userId: userId })

        if (!checkCart) return res.status(404).send({ status: false, Message: 'Cart not found' })

        await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 })

        return res.status(200).send({ status: true, message: 'Sucessfully deleted' })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createCart, getCart, updateCart, deleteCart }