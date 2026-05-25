import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";
import { BlockType } from "../enums/block-type.enum";

export abstract class ContentNode {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  id: string;

  @IsEnum(BlockType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  type: BlockType;
}

// --- Leaf Block Content Types ---

export class TextBlockContent {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  html: string;
}

export class HeadingBlockContent {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  text: string;

  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(1)
  @Max(6)
  level: number;
}

export class ImageBlockContent {
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  url: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  alt?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  caption?: string;
}

export class DividerBlockContent {}

// --- Block Classes ---

export abstract class LeafBlock extends ContentNode {
  @ValidateNested()
  @Type(() => Object, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: "type",
      subTypes: [
        { value: TextBlockContent, name: BlockType.TEXT },
        { value: HeadingBlockContent, name: BlockType.HEADING },
        { value: ImageBlockContent, name: BlockType.IMAGE },
        { value: DividerBlockContent, name: BlockType.DIVIDER },
      ],
    },
  })
  content: TextBlockContent | HeadingBlockContent | ImageBlockContent | DividerBlockContent | Record<string, unknown>;
}

export class TextBlock extends LeafBlock {
  type: BlockType.TEXT = BlockType.TEXT;
  @Type(() => TextBlockContent)
  declare content: TextBlockContent;
}

export class HeadingBlock extends LeafBlock {
  type: BlockType.HEADING = BlockType.HEADING;
  @Type(() => HeadingBlockContent)
  declare content: HeadingBlockContent;
}

export class ImageBlock extends LeafBlock {
  type: BlockType.IMAGE = BlockType.IMAGE;
  @Type(() => ImageBlockContent)
  declare content: ImageBlockContent;
}

export class DividerBlock extends LeafBlock {
  type: BlockType.DIVIDER = BlockType.DIVIDER;
  @Type(() => DividerBlockContent)
  declare content: DividerBlockContent;
}

export class ContainerBlock extends ContentNode {
  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(1)
  @Max(5)
  columns?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>("validation.IS_NUMBER") })
  width?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  blockType?: string;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => ContentNode, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: "type",
      subTypes: [
        { value: TextBlock, name: BlockType.TEXT },
        { value: HeadingBlock, name: BlockType.HEADING },
        { value: ImageBlock, name: BlockType.IMAGE },
        { value: DividerBlock, name: BlockType.DIVIDER },
        { value: ContainerBlock, name: BlockType.ROW },
        { value: ContainerBlock, name: BlockType.COLUMN },
        { value: ContainerBlock, name: BlockType.BLOCK },
      ],
    },
  })
  children: (TextBlock | HeadingBlock | ImageBlock | DividerBlock | ContainerBlock)[];
}
