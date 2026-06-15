import { IntegrationConnectionResponseDto } from "@fixspace/domain";

export function toIntegrationConnectionResponse(connection: Record<string, unknown>): IntegrationConnectionResponseDto {
  return new IntegrationConnectionResponseDto(connection as unknown as Partial<IntegrationConnectionResponseDto>);
}
