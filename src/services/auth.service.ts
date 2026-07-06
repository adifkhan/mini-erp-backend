import { userRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/apiError";
import { signToken } from "../utils/jwt";

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

class AuthService {
  async login({ email, password }: LoginInput): Promise<LoginResult> {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (!user.isActive) {
      throw ApiError.forbidden("Your account has been deactivated");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const token = signToken({ id: user.id, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}

export const authService = new AuthService();
