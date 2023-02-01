const router = require('express').Router();
const {createUser,userLogin,getUser,updateUser} = require('../controllers/userContoller');
const { Authentication } = require('../middlewares/middleware')



router.post('/register',createUser);
router.post('/login',userLogin);
router.get('/user/:userId/profile',Authentication ,getUser);
router.put('/user/:userId/profile',Authentication, updateUser);



module.exports = router;
