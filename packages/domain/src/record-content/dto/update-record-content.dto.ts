import { PartialType } from "@nestjs/mapped-types";
import { CreateRecordContentDto } from "./create-record-content.dto";

export class UpdateRecordContentDto extends PartialType(CreateRecordContentDto) {}
