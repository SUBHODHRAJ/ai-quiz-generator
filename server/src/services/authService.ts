import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { UserRole } from "../models/User";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }

  return secret;
};

const generateToken = (userId: string, role: UserRole): string => {
  return jwt.sign(
    {
      userId,
      role
    },
    getJwtSecret(),
    {
      expiresIn: "7d"
    }
  );
};

export const registerUser = async (
  input: RegisterInput
): Promise<AuthResult> => {
  const { name, email, password, role } = input;

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail
  });

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: role === "TEACHER" ? "TEACHER" : "STUDENT"
  });

  const token = generateToken(user.id, user.role);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

export const loginUser = async (
  input: LoginInput
): Promise<AuthResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail
  }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (!user.isActive) {
    throw new Error("This account has been disabled.");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.password
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password.");
  }

  const token = generateToken(user.id, user.role);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select(
    "_id name email role avatar isActive createdAt"
  );

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
};

export const updateUserProfile = async (
  userId: string,
  data: { name?: string; avatar?: string }
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  if (data.name && data.name.trim().length >= 2) {
    user.name = data.name.trim();
  }

  if (data.avatar !== undefined) {
    user.avatar = data.avatar;
  }

  await user.save();

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar
  };
};

export const updateUserPassword = async (
  userId: string,
  currentPass: string,
  newPass: string
) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new Error("User not found.");
  }

  if (!currentPass || !newPass) {
    throw new Error("Current password and new password are required.");
  }

  if (newPass.length < 6) {
    throw new Error("New password must be at least 6 characters long.");
  }

  const isMatch = await bcrypt.compare(currentPass, user.password);
  if (!isMatch) {
    throw new Error("Current password is incorrect.");
  }

  user.password = await bcrypt.hash(newPass, 12);
  await user.save();

  return { success: true };
};

