import { PartialType } from "@nestjs/mapped-types";
import { CreatePropertyValueDto } from "./create-property-value.dto";

export class UpdatePropertyValueDto extends PartialType(CreatePropertyValueDto) {}
