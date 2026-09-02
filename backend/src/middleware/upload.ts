import multer from "multer";

const storage = multer.memoryStorage();

export const uploadSpreadsheet = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file size
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/csv",
      "text/plain",
    ];

    const isExtensionAllowed = file.originalname.match(/\.(csv|xlsx|xls)$/i);

    if (allowedMimeTypes.includes(file.mimetype) || isExtensionAllowed) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format. Please upload a valid CSV or Excel (.xlsx) file."));
    }
  },
});
