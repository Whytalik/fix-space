import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import {
  ContentImageResponseDto,
  RecordContentResponseDto,
  RecordContentSnapshotResponseDto,
  UpdateRecordContentDto,
} from "@fixspace/domain";
import { memoryStorage } from "multer";

import { RequireOwnership } from "../../core/auth/decorators/required-ownership.decorator";
import { ResourceOwnerGuard } from "../../core/auth/guards/resource-owner.guard";

import { RecordContentService } from "./record-content.service";

@ApiTags("Records")
@ApiBearerAuth("access-token")
@Controller("records/:recordId/content")
export class RecordContentController {
  constructor(private readonly recordContentService: RecordContentService) {}

  @Get()
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: "record", ownerPath: ["database", "space", "ownerId"], param: "recordId" })
  @ApiOperation({ summary: "Get record content" })
  @ApiParam({ name: "recordId", type: String })
  @ApiResponse({ status: 200, description: "Content found.", type: RecordContentResponseDto })
  @ApiResponse({ status: 404, description: "Record not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  getContent(@Param("recordId") recordId: string) {
    return this.recordContentService.findByRecordId(recordId);
  }

  @Patch()
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: "record", ownerPath: ["database", "space", "ownerId"], param: "recordId" })
  @ApiOperation({ summary: "Update record content" })
  @ApiParam({ name: "recordId", type: String })
  @ApiBody({ type: UpdateRecordContentDto })
  @ApiResponse({ status: 200, description: "Content updated.", type: RecordContentResponseDto })
  @ApiResponse({ status: 404, description: "Record not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  updateContent(@Param("recordId") recordId: string, @Body() updateRecordContentDto: UpdateRecordContentDto) {
    return this.recordContentService.update(recordId, updateRecordContentDto);
  }

  @Get("snapshots")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: "record", ownerPath: ["database", "space", "ownerId"], param: "recordId" })
  @ApiOperation({ summary: "Get record content snapshots (history)" })
  @ApiParam({ name: "recordId", type: String })
  @ApiResponse({ status: 200, description: "Snapshots found.", type: [RecordContentSnapshotResponseDto] })
  @ApiResponse({ status: 404, description: "Record not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  getSnapshots(@Param("recordId") recordId: string) {
    return this.recordContentService.getSnapshots(recordId);
  }

  @Post("snapshots/:snapshotId/restore")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: "record", ownerPath: ["database", "space", "ownerId"], param: "recordId" })
  @ApiOperation({ summary: "Restore record content from a snapshot" })
  @ApiParam({ name: "recordId", type: String })
  @ApiParam({ name: "snapshotId", type: String })
  @ApiResponse({ status: 200, description: "Content restored.", type: RecordContentResponseDto })
  @ApiResponse({ status: 404, description: "Record or snapshot not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  restoreSnapshot(@Param("recordId") recordId: string, @Param("snapshotId") snapshotId: string) {
    return this.recordContentService.restoreFromSnapshot(recordId, snapshotId);
  }

  @Post("images")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: "record", ownerPath: ["database", "space", "ownerId"], param: "recordId" })
  @UseInterceptors(FileInterceptor("image", { storage: memoryStorage() }))
  @ApiOperation({ summary: "Upload an image for record content" })
  @ApiParam({ name: "recordId", type: String })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        image: { type: "string", format: "binary", description: "Image file (JPEG, PNG, or WebP, max 5 MB)" },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Image uploaded.", type: ContentImageResponseDto })
  @ApiResponse({ status: 400, description: "Invalid file type or file too large." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  uploadImage(@Param("recordId") recordId: string, @UploadedFile(new ParseFilePipe({ fileIsRequired: true })) file: Express.Multer.File) {
    return this.recordContentService.uploadImage(recordId, file);
  }
}
