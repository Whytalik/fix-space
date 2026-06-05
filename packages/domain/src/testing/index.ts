import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export function createValidator<T extends object>(classRef: new () => T) {
  return async (plain: object): Promise<string[]> => {
    const errors = await validate(plainToInstance(classRef, plain));
    return errors.map((e) => e.property);
  };
}
