 const hotels = require('../models/hotel');
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const hotel = await hotels.find({}).populate('popupText');
    res.render('hotels/index', { hotel})
}

module.exports.renderNewForm = (req, res) => {
    res.render('hotels/new');
}

module.exports.createHotel = async (req, res, next) => {
    
    const hotel = new hotels(req.body.hotel);
   // hotel.geometry = geoData.body.features[0].geometry;
    hotel.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    hotel.author = req.user._id;
    await hotel.save();
    //console.log(Hotel);
    req.flash('success', 'Successfully made a new Hotel!');
    res.redirect(`/hotels/${hotel._id}`)
}

module.exports.showHotel = async (req, res,) => {
    const hotel = await hotels.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!hotel) {
        req.flash('error', 'Cannot find that Hotel!');
        return res.redirect('/hotels');
    }
    res.render('hotels/show', { hotel });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const hotel= await hotels.findById(id)
    if (!hotel) {
        req.flash('error', 'Cannot find that Hotel!');
        return res.redirect('/hotels');
    }
    res.render('hotels/edit', { hotel });
}

module.exports.updateHotel = async (req, res) => {
    const { id } = req.params;
    const hotel = await hotels.findByIdAndUpdate(id, { ...req.body.hotel });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    hotel.images.push(...imgs);
    await hotel.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await hotels.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated Hotel!');
    res.redirect(`/hotels/${hotel._id}`)
}

module.exports.deleteHotel = async (req, res) => {
    const { id } = req.params;
    await hotels.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Hotel')
    res.redirect('/hotels');
}