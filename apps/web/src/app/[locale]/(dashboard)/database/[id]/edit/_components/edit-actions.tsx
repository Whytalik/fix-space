"use client";

import { Button } from "@/components/ui/primitives/actions/button";

type EditActionsProps = {
  isSaving: boolean;
  canSave: boolean;
  onSave: () => void;
  onCancel: () => void;
};

export function EditActions({ isSaving, canSave, onSave, onCancel }: EditActionsProps) {
  return (
    <div className="sticky top-0 flex flex-col gap-2">
      <Button onClick={onSave} loading={isSaving} disabled={!canSave} className="w-full justify-center">
        {isSaving ? "Saving…" : "Save changes"}
      </Button>
      <Button variant="secondary" onClick={onCancel} className="w-full justify-center">
        Cancel
      </Button>
    </div>
  );
}
