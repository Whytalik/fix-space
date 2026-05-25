import { Exclude, Expose } from "class-transformer";

@Exclude()
export class AuthResponseDto {
  @Expose()
  message: string;

  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}
