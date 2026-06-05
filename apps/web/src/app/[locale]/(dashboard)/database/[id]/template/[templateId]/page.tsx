// "use client";

// import { RecordPropertiesSection } from "../../../../../record/[id]/_components/record-properties";
// import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";
// import { useDatabaseContext } from "@/context/database-context";
// import { useUIContext } from "@/context/ui-context";
// import {
//   deleteTemplate,
//   duplicateTemplate,
//   getTemplate,
//   updateTemplate,
//   updateTemplatePropertyValue,
// } from "@/lib/api/template";
// import type { PropertyResponseDto, RecordResponseDto, TemplateResponseDto } from "@fixspace/domain";
// import { useTranslations } from "next-intl";
// import { useParams, useRouter } from "next/navigation";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { TemplateHeader } from "./_components/template-header";

// type FormValues = Record<string, unknown>;

// function initFormValues(template: TemplateResponseDto, properties: PropertyResponseDto[]): FormValues {
//   const vals: FormValues = {};
//   for (const prop of properties) {
//     const tpv = template.values?.find((v) => v.propertyId === prop.id);
//     vals[prop.id] = tpv?.value ?? "";
//   }
//   return vals;
// }

// export default function TemplatePage() {
//   const t = useTranslations("TemplatePageComp");
//   const params = useParams<{ id: string; templateId: string }>();
//   const { id: databaseId, templateId } = params;

//   const { properties, relatedRecordsMap, isLoading } = useDatabaseContext();
//   const { showError } = useUIContext();
//   const router = useRouter();

//   const [template, setTemplate] = useState<TemplateResponseDto | null>(null);
//   const [isTemplateLoading, setIsTemplateLoading] = useState(true);
//   const [nameValue, setNameValue] = useState("");
//   const [iconValue, setIconValue] = useState("");
//   const [isDefault, setIsDefault] = useState(false);
//   const [showIconPicker, setShowIconPicker] = useState(false);
//   const iconButtonRef = useRef<HTMLButtonElement>(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const [formValues, setFormValues] = useState<FormValues>({});
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [isDefaultConfirmOpen, setIsDefaultConfirmOpen] = useState(false);
//   const [isRemovingDefaultConfirmOpen, setIsRemovingDefaultConfirmOpen] = useState(false);

//   useEffect(() => {
//     setIsTemplateLoading(true);
//     getTemplate(templateId)
//       .then((t) => {
//         setTemplate(t);
//         setNameValue(t.name ?? "");
//         setIconValue(t.icon ?? "");
//         setIsDefault(t.isDefault ?? false);
//       })
//       .catch(showError)
//       .finally(() => setIsTemplateLoading(false));
//   }, [templateId, showError]);

//   useEffect(() => {
//     if (template && properties.length > 0) {
//       setFormValues(initFormValues(template, properties));
//     }
//   }, [template, properties]);

//   const sorted = useMemo(
//     () => [...properties].filter((p) => p.position !== 0).sort((a, b) => a.position - b.position),
//     [properties],
//   );

//   const { groupOrder, grouped } = useMemo(() => {
//     const order: string[] = [];
//     const map: Record<string, PropertyResponseDto[]> = {};
//     for (const prop of sorted) {
//       const g = prop.group ?? "";
//       if (!map[g]) {
//         map[g] = [];
//         order.push(g);
//       }
//       map[g].push(prop);
//     }
//     return { groupOrder: order, grouped: map };
//   }, [sorted]);

//   async function doSave() {
//     if (!template) return;
//     setIsSaving(true);
//     try {
//       const metaChanged =
//         nameValue !== (template.name ?? "") ||
//         iconValue !== (template.icon ?? "") ||
//         isDefault !== (template.isDefault ?? false);

//       if (metaChanged) {
//         await updateTemplate(template.id, {
//           name: nameValue,
//           icon: iconValue || undefined,
//           isDefault,
//         });
//       }

//       await Promise.all(
//         (template.values ?? []).map(async (tpv) => {
//           const newVal = formValues[tpv.propertyId];
//           const oldVal = tpv.value;
//           if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
//             await updateTemplatePropertyValue(tpv.id, { value: newVal === "" ? null : newVal });
//           }
//         }),
//       );

//       router.push(`/database/${databaseId}/edit?tab=templates`);
//     } catch (err) {
//       showError(err);
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   function handleSave() {
//     if (!template) return;
//     const turningDefault = isDefault && !template.isDefault;
//     const removingDefault = !isDefault && template.isDefault;
//     if (turningDefault) {
//       setIsDefaultConfirmOpen(true);
//       return;
//     }
//     if (removingDefault) {
//       setIsRemovingDefaultConfirmOpen(true);
//       return;
//     }
//     doSave();
//   }

//   async function handleDuplicate() {
//     if (!template) return;
//     setIsSaving(true);
//     try {
//       const copy = await duplicateTemplate(template.id);
//       router.push(`/database/${databaseId}/template/${copy.id}`);
//     } catch (err) {
//       showError(err);
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   async function handleConfirmDelete() {
//     if (!template) return;
//     setIsDeleting(true);
//     try {
//       await deleteTemplate(template.id);
//       router.push(`/database/${databaseId}/edit?tab=templates`);
//     } catch (err) {
//       showError(err);
//     } finally {
//       setIsDeleting(false);
//     }
//   }

//   if (isLoading || isTemplateLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="w-5 h-5 rounded-full border-2 border-stroke border-t-accent animate-spin" />
//       </div>
//     );
//   }

//   if (!template) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <p className="text-ink-secondary text-sm">{t("templateNotFound")}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-canvas">
//       <div className="px-8 pt-10 pb-20">
//         <TemplateHeader
//           isSaving={isSaving}
//           nameValue={nameValue}
//           iconValue={iconValue}
//           isDefault={isDefault}
//           showIconPicker={showIconPicker}
//           iconButtonRef={iconButtonRef}
//           onBack={() => router.push(`/database/${databaseId}/edit?tab=templates`)}
//           onSave={handleSave}
//           onDuplicate={handleDuplicate}
//           onOpenDelete={() => setIsDeleteDialogOpen(true)}
//           onNameChange={setNameValue}
//           onIconChange={setIconValue}
//           onIsDefaultChange={setIsDefault}
//           onIconPickerToggle={() => setShowIconPicker((v) => !v)}
//           onIconPickerClose={() => setShowIconPicker(false)}
//         />

//         <div className="h-px mb-8 bg-stroke" />

//         {sorted.length === 0 ? (
//           <p className="text-sm text-ink-muted">{t("noPropertiesDefined")}</p>
//         ) : (
//           <RecordPropertiesSection
//             isEditMode={true}
//             propsOpen={true}
//             groupOrder={groupOrder}
//             grouped={grouped}
//             formValues={formValues}
//             record={{ id: template.id, values: template.values, name: template.name } as unknown as RecordResponseDto}
//             relatedRecordsMap={relatedRecordsMap}
//             onValueChange={(propId: string, val: unknown) => setFormValues((prev) => ({ ...prev, [propId]: val }))}
//           />
//         )}
//       </div>

//       {isDeleteDialogOpen && (
//         <ConfirmDialog
//           title={t("deleteTemplate")}
//           description={t("deleteDescription", { name: template.name || "Untitled template" })}
//           confirmLabel={isDeleting ? t("deleting") : t("delete")}
//           variant="danger"
//           onConfirm={handleConfirmDelete}
//           onCancel={() => setIsDeleteDialogOpen(false)}
//         />
//       )}

//       {isDefaultConfirmOpen && (
//         <ConfirmDialog
//           title={t("setDefaultTitle")}
//           description={t("setDefaultDesc")}
//           confirmLabel={t("setDefault")}
//           variant="default"
//           onConfirm={() => {
//             setIsDefaultConfirmOpen(false);
//             doSave();
//           }}
//           onCancel={() => setIsDefaultConfirmOpen(false)}
//         />
//       )}

//       {isRemovingDefaultConfirmOpen && (
//         <ConfirmDialog
//           title={t("removeDefaultTitle")}
//           description={t("removeDefaultDesc")}
//           confirmLabel={t("removeDefault")}
//           variant="default"
//           onConfirm={() => {
//             setIsRemovingDefaultConfirmOpen(false);
//             doSave();
//           }}
//           onCancel={() => setIsRemovingDefaultConfirmOpen(false)}
//         />
//       )}
//     </div>
//   );
// }

export default function TemplatePage() {
  return null;
}
