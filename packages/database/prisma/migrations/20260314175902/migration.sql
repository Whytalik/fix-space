-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "databaseId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Untitled',
    "description" TEXT,
    "icon" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "config" JSONB,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplatePropertyValue" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "value" JSONB,

    CONSTRAINT "TemplatePropertyValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Template_databaseId_idx" ON "Template"("databaseId");

-- CreateIndex
CREATE INDEX "Template_position_idx" ON "Template"("position");

-- CreateIndex
CREATE UNIQUE INDEX "Template_databaseId_name_key" ON "Template"("databaseId", "name");

-- CreateIndex
CREATE INDEX "TemplatePropertyValue_templateId_idx" ON "TemplatePropertyValue"("templateId");

-- CreateIndex
CREATE INDEX "TemplatePropertyValue_propertyId_idx" ON "TemplatePropertyValue"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplatePropertyValue_templateId_propertyId_key" ON "TemplatePropertyValue"("templateId", "propertyId");

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_databaseId_fkey" FOREIGN KEY ("databaseId") REFERENCES "Database"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePropertyValue" ADD CONSTRAINT "TemplatePropertyValue_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePropertyValue" ADD CONSTRAINT "TemplatePropertyValue_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
