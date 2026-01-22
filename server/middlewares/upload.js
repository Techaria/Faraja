const multer = require('multer');

// Store images in memory for database storage
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (/^image\/(png|jpe?g|gif|webp)$/i.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;