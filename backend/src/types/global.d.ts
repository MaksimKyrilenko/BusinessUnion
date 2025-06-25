import { User } from '../users/user.entity';

declare global {
  namespace Express {
    interface Multer {
      File: Express.Multer.File;
    }
    
    namespace Multer {
      interface File {
        /** Name of the form field */
        fieldname: string;
        /** Name of the file on the user's computer */
        originalname: string;
        /** Encoding type of the file */
        encoding: string;
        /** Mime type of the file */
        mimetype: string;
        /** Size of the file in bytes */
        size: number;
        /** The folder to which the file has been saved (DiskStorage) */
        destination?: string;
        /** The name of the file within the destination (DiskStorage) */
        filename?: string;
        /** Location of the uploaded file (DiskStorage) */
        path?: string;
        /** A Buffer of the entire file (MemoryStorage) */
        buffer?: Buffer;
      }
    }
  }
}

// Extend Request to include user property
declare namespace Express {
  export interface Request {
    user?: User & { sub: number };
  }
} 