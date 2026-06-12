function noopDecorator() {
  return noopDecorator;
}

noopDecorator.prototype = {};

const stub = new Proxy(noopDecorator, {
  get(_, key) {
    if (key === "__esModule") return true;
    if (key === "default") return stub;
    return noopDecorator;
  },
  apply() {
    return noopDecorator;
  },
});

export default stub;

export const ApiProperty = stub;
export const ApiPropertyOptional = stub;

export const ArrayMinSize = stub;
export const IsArray = stub;
export const IsBoolean = stub;
export const IsEmail = stub;
export const IsEnum = stub;
export const IsIn = stub;
export const IsInt = stub;
export const IsNotEmpty = stub;
export const IsNumber = stub;
export const IsObject = stub;
export const IsOptional = stub;
export const IsString = stub;
export const IsUUID = stub;
export const Matches = stub;
export const Max = stub;
export const MaxLength = stub;
export const Min = stub;
export const MinLength = stub;
export const ValidateIf = stub;
export const ValidateNested = stub;
export const validate = stub;

export const Exclude = stub;
export const Expose = stub;
export const plainToInstance = stub;
export const Transform = stub;
export const TransformationType = stub;
export const Type = stub;

export const i18nValidationMessage = stub;
