import { CreateDatabaseDto, CreatePropertyDto, CreateSectionDto, PropertyType } from "@nucleus/domain";

export interface InitializationConfig {
  spaceNameTemplate: string;
  sections: CreateSectionDto[];
  databases: CreateDatabaseDto[];
  defaultDatabaseProperties: CreatePropertyDto[];
}

export const defaultInitializationConfig: InitializationConfig = {
  spaceNameTemplate: "{{username}}'s Space",
  sections: [
    {
      key: "routine",
      name: "Routine",
      position: 0,
    },
    {
      key: "insight",
      name: "Insight",
      position: 1,
    },
    {
      key: "settings",
      name: "Settings",
      position: 2,
    },
  ],
  databases: [
    {
      name: "[DB] Trading Journal",
      title: "Trading Journal",
      type: "trading-journal",
      sectionKey: "routine",
      properties: [
        {
          name: "Name",
          type: PropertyType.TEXT,
          isPrimary: true,
          position: 0,
        },
        {
          name: "PnL",
          type: PropertyType.NUMBER,
          position: 1,
        },
        {
          name: "RR",
          type: PropertyType.NUMBER,
          position: 2,
        },
        {
          name: "Date",
          type: PropertyType.DATE,
          position: 3,
        },
      ],
    },
    {
      name: "[DB] Session Routine",
      title: "Session Routine",
      type: "daily-routine",
      sectionKey: "routine",
      properties: [
        {
          name: "Name",
          type: PropertyType.TEXT,
          isPrimary: true,
          position: 0,
        },
        {
          name: "Date",
          type: PropertyType.DATE,
          position: 1,
        },
      ],
    },
    {
      name: "[DB] Notes",
      title: "Notes",
      type: "notes",
      sectionKey: "insight",
      properties: [
        {
          name: "Name",
          type: PropertyType.TEXT,
          isPrimary: true,
          position: 0,
        },
        {
          name: "Content",
          type: PropertyType.TEXT,
          position: 1,
        },
        {
          name: "Date",
          type: PropertyType.DATE,
          position: 2,
        },
      ],
    },
    {
      name: "[DB] Mistakes",
      title: "Mistakes",
      type: "mistakes",
      sectionKey: "insight",
      properties: [
        {
          name: "Name",
          type: PropertyType.TEXT,
          isPrimary: true,
          position: 0,
        },
        {
          name: "Description",
          type: PropertyType.TEXT,
          position: 1,
        },
        {
          name: "Date",
          type: PropertyType.DATE,
          position: 2,
        },
      ],
    },
    {
      name: "[DB] Accounts",
      title: "Accounts",
      type: "accounts",
      sectionKey: "settings",
      properties: [
        {
          name: "Name",
          type: PropertyType.TEXT,
          isPrimary: true,
          position: 0,
        },
        {
          name: "Broker",
          type: PropertyType.TEXT,
          position: 1,
        },
        {
          name: "Balance",
          type: PropertyType.NUMBER,
          position: 2,
        },
      ],
    },
    {
      name: "[DB] Trading Systems",
      title: "Trading Systems",
      type: "trading-system",
      sectionKey: "settings",
      properties: [
        {
          name: "Name",
          type: PropertyType.TEXT,
          isPrimary: true,
          position: 0,
        },
        {
          name: "Description",
          type: PropertyType.TEXT,
          position: 1,
        },
        {
          name: "Date",
          type: PropertyType.DATE,
          position: 2,
        },
        {
          name: "Is Active?",
          type: PropertyType.STATUS,
          position: 3,
        },
      ],
    },
  ],
  defaultDatabaseProperties: [
    {
      name: "Name",
      type: PropertyType.TEXT,
      position: 0,
      isRequired: true,
      isPrimary: true,
    },
  ],
};
