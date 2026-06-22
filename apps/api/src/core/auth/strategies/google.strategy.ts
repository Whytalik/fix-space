import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";

export interface GoogleUser {
  googleId: string;
  email: string;
  displayName: string;
  accessToken: string;
  refreshToken?: string;
  avatarUrl?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>("GOOGLE_CLIENT_ID")!,
      clientSecret: configService.get<string>("GOOGLE_CLIENT_SECRET")!,
      callbackURL: configService.get<string>("GOOGLE_CALLBACK_URL", "http://localhost:3000/auth/google/callback"),
      scope: ["email", "profile"],
    });
  }

  validate(accessToken: string, refreshToken: string | undefined, profile: Profile, done: VerifyCallback): void {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      done(new Error("Google account does not provide an email address"));
      return;
    }

    const googleUser: GoogleUser = {
      googleId: profile.id,
      email,
      displayName: profile.displayName ?? email.split("@")[0]!,
      accessToken,
      refreshToken: refreshToken ?? undefined,
      avatarUrl: profile.photos?.[0]?.value ?? undefined,
    };

    done(null, googleUser);
  }
}
