import type { SeedRecord } from "./types";

export const learningTasksSeeds: SeedRecord[] = [
  {
    name: "Читати 'Зональний трейдинг' Марка Дугласа",
    values: {
      Category: "Book",
      Status: "In progress",
      Priority: "High",
      "Progress %": 35,
      Rating: 5,
    },
  },
  {
    name: "Пройти курс з ризик-менеджменту",
    values: {
      Category: "Course",
      Status: "Not started",
      Priority: "High",
      "Progress %": 0,
    },
  },
  {
    name: "Аналіз вихідних угод за тиждень",
    values: {
      Category: "Task",
      Status: "Done",
      Priority: "Medium",
      "Progress %": 100,
      Rating: 4,
    },
  },
];
