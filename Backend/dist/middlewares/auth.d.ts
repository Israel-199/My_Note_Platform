import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User.js';
interface AuthRequest extends Request {
    user?: IUser;
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export { AuthRequest };
//# sourceMappingURL=auth.d.ts.map