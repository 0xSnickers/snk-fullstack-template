declare global {
  namespace Express {
    interface Request {
      requestId: string;
      /** Set by `authenticate` middleware. */
      auth?: { userId: string; role: string };
    }
  }
}

export {};
