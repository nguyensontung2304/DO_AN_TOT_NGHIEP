// import fs from "node:fs";
// import path from "node:path";
// import { randomUUID } from "node:crypto";
// import multer from "multer";

// // 1. Thư mục lưu file: <project>/uploads (tạo nếu chưa có)
// const uploadDir = path.resolve("uploads");
// fs.mkdirSync(uploadDir, { recursive: true });

// // 2. Cấu hình diskStorage: lưu file ở đâu, đặt tên file thế nào
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   // Không giữ tên gốc vì có thể trùng -> tạo tên duy nhất: image-<uuid>.jpg
//   filename: (req, file, cb) => {
//     const extension = path.extname(file.originalname).toLowerCase();
//     cb(null, `${file.fieldname}-${randomUUID()}${extension}`);
//   },
// });

// // 3. Chỉ cho phép upload ảnh
// const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
// const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

// // 4. Tạo middleware upload
// const upload = multer({
//   storage: storage,
//   // Tối đa 5 MB / file
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
//   fileFilter: (req, file, cb) => {
//     const extension = path.extname(file.originalname).toLowerCase();
//     const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
//     const isValidExtension = allowedExtensions.includes(extension);

//     if (isValidMimeType && isValidExtension) {
//       return cb(null, true);
//     }

//     // Gắn status để middleware xử lý lỗi biết đây là lỗi chủ động (trả 400 kèm message)
//     const error = new Error("Chỉ cho phép upload file JPG, PNG hoặc WEBP");
//     error.status = 400;
//     cb(error);
//   },
// });

// // Cách dùng: upload.single('image') -> req.file
// //            upload.array('images', 5) -> req.files
// export default upload;

// ======================= upload ảnh lên Supabase Storage ======================
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { supabase, storageBucket } from "../utils/supabase.js";

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const extension = path.extname(file.originalname).toLowerCase();

    if (
      allowedMimeTypes.includes(file.mimetype) &&
      allowedExtensions.includes(extension)
    ) {
      return cb(null, true);
    }

    const error = new Error("Chỉ cho phép upload file JPG, PNG hoặc WEBP");
    error.status = 400;
    cb(error);
  },
});

const uploadAvatar = {
  single(fieldName) {
    const multerMiddleware = upload.single(fieldName);

    return (req, res, next) => {
      multerMiddleware(req, res, async (error) => {
        if (error) return next(error);
        if (!req.file) return next();

        try {
          const extension = path.extname(req.file.originalname).toLowerCase();
          const filePath = `avatars/avatar-${randomUUID()}${extension}`;

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

export default uploadAvatar;
