import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { deleteUploadedFile } from 'src/helpers/deleteUploadedFile';
import cloudinary from '../config/cloudinary';
import toStream = require('buffer-to-stream');

export const uploadImage = async (
  file: Express.Multer.File,
): Promise<UploadApiResponse | UploadApiErrorResponse> => {
  const result = await cloudinary.uploader.upload(file.path);
  deleteUploadedFile(file.filename);
  return result;
};
