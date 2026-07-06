import { BaseRepository } from "./base.repository";
import { User, IUser } from "../models/user.model";

class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(
    email: string,
    withPassword = false,
  ): Promise<IUser | null> {
    const query = this.model.findOne({ email: email.toLowerCase() });
    if (withPassword) query.select("+password");
    return query.exec();
  }
}

export const userRepository = new UserRepository();
