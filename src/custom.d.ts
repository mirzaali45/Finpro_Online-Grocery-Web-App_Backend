type User = {
  id: number;
  role: string;
};

declare global {
  namespace Express {
    interface Request {
      user: User;
      file?: Multer.File;
    }
  }
}

export default {};
