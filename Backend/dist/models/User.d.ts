import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    fullName: string;
    email: string;
    dateOfBirth: Date;
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map