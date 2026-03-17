import { BadRequestException } from "@nestjs/common";

export function parseJson<T>(raw: string, paramName: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new BadRequestException(`Invalid JSON in query parameter "${paramName}"`);
  }
}
