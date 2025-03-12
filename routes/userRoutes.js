const express = require('express');
const userController = require('../controllers/userController');
const verifyJwt = require('../middlewares/verifyJwt');
const router = express.Router();
const multer= require("../middlewares/upload")

router.post('/login', userController.userLogin);
router.post('/signup', userController.userSignup);
router.get('/all-users', verifyJwt, userController.getAllUsers);
router.delete('/delete/:id', verifyJwt, userController.deleteUser);
router.patch('/edit-profile', verifyJwt,multer.single("image"), userController.editProfile);
router.post('/refresh-token',  userController.refreshToken);
router.post('/logout', userController.userLogout);



module.exports = router;
