// import multer from "multer";
// import path from "node:path";
// import fs from "node:fs";

// const uploadDir = path.resolve("uploads/products");

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, {
//     recursive: true,
//   });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },

//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);

//     const filename = `product-${Date.now()}${ext}`;

//     cb(null, filename);
//   },
// });

// const uploadImageProduct = multer({
//   storage,

//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

//     if (!allowedTypes.includes(file.mimetype)) {
//       return cb(new Error("Chỉ được upload file ảnh JPG, PNG hoặc WEBP"));
//     }

//     cb(null, true);
//   },

//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// });

// export default uploadImageProduct;

// ====================== upload ảnh lên Supabase Storage ======================
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { supabase, storageBucket } from "../utils/supabase.js";

const upload = multer({
  storage: multer.memoryStorage(),

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

const uploadImageProduct = {
  single(fieldName) {
    const multerMiddleware = upload.single(fieldName);

    return (req, res, next) => {
      multerMiddleware(req, res, async (error) => {
        if (error) return next(error);
        if (!req.file) return next();

        try {
          const extension = path.extname(req.file.originalname).toLowerCase();
          const filePath = `products/product-${randomUUID()}${extension}`;

          const { error: uploadError } = await supabase.storage
            .from(storageBucket)
            .upload(filePath, req.file.buffer, {
              contentType: req.file.mimetype,
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from(storageBucket)
            .getPublicUrl(filePath);

          req.file.publicUrl = data.publicUrl;

          next();
        } catch (error) {
          next(error);
        }
      });
    };
  },
};

export default uploadImageProduct;
