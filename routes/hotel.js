const express = require('express');
const router = express.Router();
const hotelsC = require('../controllers/hotel');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateHotel } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Hotels = require('../models/hotel');

router.route('/')
    .get(catchAsync(hotelsC.index))
    .post(isLoggedIn, upload.array('image'), validateHotel, catchAsync(hotelsC.createHotel))


router.get('/new', isLoggedIn, hotelsC.renderNewForm)

router.route('/:id')
    .get(catchAsync(hotelsC.showHotel))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateHotel, catchAsync(hotelsC.updateHotel))
    .delete(isLoggedIn, isAuthor, catchAsync(hotelsC.deleteHotel));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(hotelsC.renderEditForm))



module.exports = router;