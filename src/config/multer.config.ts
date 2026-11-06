import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';

const DANGEROUS_EXTENSIONS = new Set([
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.php',
  '.phtml',
  '.html',
  '.htm',
  '.js',
  '.ts',
  '.py',
  '.jar',
  '.vbs',
  '.scr',
]);

export const multerConfig = (destination?: string) => ({
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max file size
  },
  fileFilter: (
    _req: any,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const ext = extname(file.originalname).toLowerCase();
    if (DANGEROUS_EXTENSIONS.has(ext)) {
      return callback(
        new BadRequestException(
          `File extension ${ext} is not allowed for security reasons`,
        ),
        false,
      );
    }
    callback(null, true);
  },
  storage: diskStorage({
    destination: (req, file, callback) => {
      let dest = destination;
      if (!dest) {
        if (file.fieldname === 'commentAudio') {
          dest = 'audio';
        } else if (file.fieldname === 'commentImg') {
          dest = 'comment';
        } else {
          dest = 'problem';
        }
      }
      const dir = `${process.env.UPLOAD_BASE_PATH || ''}/${dest}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      callback(null, dir);
    },
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `${uniqueSuffix}${ext}`;
      callback(null, filename);
    },
  }),
});
