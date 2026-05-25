import type { User } from "../../user/entities/user.entity";

export class Session {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date;

  user?: User;

  constructor(partial: Partial<Session>) {
    Object.assign(this, partial);
  }
}

export class EmailVerificationToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;

  user?: User;

  constructor(partial: Partial<EmailVerificationToken>) {
    Object.assign(this, partial);
  }
}

export class PasswordResetToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;

  user?: User;

  constructor(partial: Partial<PasswordResetToken>) {
    Object.assign(this, partial);
  }
}

export class GoogleAccount {
  id: string;
  userId: string;
  googleId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;

  user?: User;

  constructor(partial: Partial<GoogleAccount>) {
    Object.assign(this, partial);
  }
}
