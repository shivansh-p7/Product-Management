const router = require('express').Router();
const {createUser,userLogin,getUser,updateUser} = require('../controllers/userContoller');
const {createProduct,getProduct,getProductById,updateProduct,deleteProduct} = require('../controllers/productController')
const { Authentication } = require('../middlewares/middleware')


//........................USER API's.............................................
router.post('/register',createUser);
router.post('/login',userLogin);
router.get('/user/:userId/profile',Authentication ,getUser);
router.put('/user/:userId/profile',Authentication, updateUser);

//......................................PRODUCT API's...............................
router.post('/products',createProduct)
router.get('/products',getProduct)
router.get('/products/:productId',getProductById)
router.put('/products/:productId')
router.delete('/products/:productId',deleteProduct)



module.exports = router;
