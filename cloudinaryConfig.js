// cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 🔐 Your Cloudinary credentials here
cloudinary.config({
  cloud_name: 'dyyof690l',
  api_key: '439649299961826',
  api_secret: 'kFSiuSih3n6nNar7hspOEDZiDTs'
});

// 📦 Storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'WPM_Reports', // Cloudinary folder
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

module.exports = { cloudinary, storage };
