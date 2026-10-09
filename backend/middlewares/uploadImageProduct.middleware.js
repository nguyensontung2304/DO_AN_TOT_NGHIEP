import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const uploadDir = path.resolve("uploads/products");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const filename = `product-${Date.now()}${ext}`;

    cb(null, filename);
  },
});

const uploadImageProduct = multer({
  storage,

  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Chỉ được upload file ảnh JPG, PNG hoặc WEBP"));
    }

    cb(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default uploadImageProduct;
