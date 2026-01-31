/*
model Section {
  id        String   @id @default(uuid())
  spaceId   String
  name      String
  position  Int      @default(0)
  icon      String?
  color     String?
  config    Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  space     Space      @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  databases Database[]

  @@index([spaceId])
}

*/

export class Section {
  id: string;
  spaceId: string;
  name: string;
  position: number;
  icon?: string;
  color?: string;
  config?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Section>) {
    Object.assign(this, partial);
  }
}
