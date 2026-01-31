export interface SectionDefinition {
  name: string;
  position: number;
}

export interface DatabaseDefinition {
  name: string;
  title: string;
}

export interface InitializationConfig {
  spaceNameTemplate: string;
  sections: SectionDefinition[];
  databases: DatabaseDefinition[];
}

export const defaultInitializationConfig: InitializationConfig = {
  spaceNameTemplate: "{{username}}'s Space",
  sections: [
    { name: 'Routine', position: 0 },
    { name: 'Insight', position: 1 },
    { name: 'Settings', position: 2 },
  ],
  databases: [
    { name: '[DB] Trading Journal', title: 'Trading Journal' },
    { name: '[DB] Session Routine', title: 'Session Routine' },
    { name: '[DB] Notes', title: 'Notes' },
    { name: '[DB] Mistakes', title: 'Mistakes' },
    { name: '[DB] Accounts', title: 'Accounts' },
  ],
};
