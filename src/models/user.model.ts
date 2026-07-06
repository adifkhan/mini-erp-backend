import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "admin" | "manager" | "employee";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["admin", "manager", "employee"],
      default: "employee",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
