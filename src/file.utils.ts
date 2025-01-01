import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { extname } from 'path';

export const profilePictureEditor = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) => {
  console.log('this is the file from profilePictureEditor', file);
  // Generate a unique filename with original extension
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const fileExtension = extname(file.originalname); // Get file extension
  const newFilename = `profile-${uniqueSuffix}${fileExtension}`;
  callback(null, newFilename);
};


export const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, valid: boolean) => void,
) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
    return callback(
      new BadRequestException('Only image files are allowed!'),
      false,
    );
  }
  callback(null, true);
};
