"use client";

import { parseApiError } from "@/lib/api/client";
import { deleteAvatar, uploadAvatar } from "@/lib/api/user";
import { API_BASE_URL } from "@/utils/constants";
import { useRef, useState } from "react";
import { Avatar } from "./avatar";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";

type AvatarUploadProps = {
  username: string;
  icon: string | null;
  size?: "md" | "lg";
  onUpdate: (icon: string | null) => void;
};

export function AvatarUpload({ username, icon, size = "md", onUpdate }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUrl = icon ? `${API_BASE_URL}${icon}` : null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      const updated = await uploadAvatar(file);
      onUpdate(updated.icon);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemove() {
    setError(null);
    setIsUploading(true);
    try {
      const updated = await deleteAvatar();
      onUpdate(updated.icon);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
          aria-label="Change avatar"
        >
          <Avatar initial={username[0] ?? ""} image={avatarUrl} size={size} />
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {isUploading ? (
              <Spinner size="sm" color="white" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ position: "absolute", visibility: "hidden", width: 0, height: 0 }}
          onChange={handleFileChange}
        />
      </div>

      {icon && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={isUploading}
          className="text-xs text-ink-secondary hover:text-error transition-colors"
        >
          Remove photo
        </button>
      )}

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
