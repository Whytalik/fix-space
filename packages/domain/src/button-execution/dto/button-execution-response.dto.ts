import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ButtonExecutionResponseDto {
  @Expose()
  id: string;

  @Expose()
  recordId: string;

  @Expose()
  propertyId: string;

  @Expose()
  executedAt: Date;

  constructor(partial: Partial<ButtonExecutionResponseDto>) {
    Object.assign(this, partial);
  }
}
