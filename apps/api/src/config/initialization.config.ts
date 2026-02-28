import { DatabaseType } from '../database/database.config';

export interface SectionDefinition {
  name: string;
  position: number;
}

export interface PropertyDefinition {
  name: string;
  type: 'TEXT';
  position: number;
  isRequired?: boolean;
}

export interface DatabaseDefinition {
  name: string;
  title: string;
  type: DatabaseType;
}

export interface InitializationConfig {
  spaceNameTemplate: string;
  sections: SectionDefinition[];
  databases: DatabaseDefinition[];
  defaultDatabaseProperties: PropertyDefinition[];
}

export const defaultInitializationConfig: InitializationConfig = {
  spaceNameTemplate: "{{username}}'s Space",
  sections: [
    { name: 'Routine', position: 0 },
    { name: 'Insight', position: 1 },
    { name: 'Settings', position: 2 },
  ],
  databases: [
    {
      name: '[DB] Trading Journal',
      title: 'Trading Journal',
      type: 'trading-journal',
    },
    {
      name: '[DB] Session Routine',
      title: 'Session Routine',
      type: 'daily-routine',
    },
    { name: '[DB] Notes', title: 'Notes', type: 'notes' },
    { name: '[DB] Mistakes', title: 'Mistakes', type: 'mistakes' },
    { name: '[DB] Accounts', title: 'Accounts', type: 'accounts' },
  ],
  defaultDatabaseProperties: [{ name: 'Name', type: 'TEXT', position: 0, isRequired: true }],
};
