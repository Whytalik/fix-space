export interface SectionSettings {
  defaultSectionIcon: string;
  defaultSectionColor: string;
}

export const DEFAULT_SECTION_SETTINGS = {
  defaultSectionIcon: "icon:FolderOpen",
  defaultSectionColor: "transparent",
} satisfies SectionSettings;
