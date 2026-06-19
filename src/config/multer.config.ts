import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

export const multerConfig = (destination?: string) => ({
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
