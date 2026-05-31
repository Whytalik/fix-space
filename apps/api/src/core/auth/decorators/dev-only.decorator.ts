import { UseGuards, applyDecorators } from "@nestjs/common";
import { DevOnlyGuard } from "../guards/dev-only.guard";
import { Public } from "./public.decorator";

export const DevOnly = () => applyDecorators(Public(), UseGuards(DevOnlyGuard));
