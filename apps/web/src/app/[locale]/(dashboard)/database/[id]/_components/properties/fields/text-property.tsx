"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import { Bold, Italic, Underline as UnderlineIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";

interface TextPropertyProps {
  value: unknown;
  readOnly?: boolean;
  className?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  ghost?: boolean;
  editorClass?: string;
  textAlign?: string;
}

export function TextProperty({ value, readOnly, className, onChange, placeholder, ghost, editorClass, textAlign }: TextPropertyProps) {
  const t = useTranslations("PropertyInput");

  if (readOnly) {
    const stringValue = String(value ?? "");
    if (!stringValue) return <span className="text-ink-muted italic opacity-50">{placeholder || "—"}</span>;

    return (
      <div
        className={`text-ink text-sm [&_a]:underline [&_a]:text-inherit ${className || "truncate max-w-full"}`}
        dangerouslySetInnerHTML={{ __html: stringValue }}
      />
    );
  }

  return (
    <RichTextEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder || t("enterText")}
      ghost={ghost}
      editorClass={editorClass}
      textAlign={textAlign}
    />
  );
}

function RichTextEditor({
  value,
  onChange,
  placeholder,
  ghost,
  editorClass = "text-sm",
  textAlign,
}: {
  value: unknown;
  onChange?: (v: string) => void;
  placeholder: string;
  ghost?: boolean;
  editorClass?: string;
  textAlign?: string;
}) {
  const placeholderAlignClass =
    textAlign === "center" || textAlign === "right" || textAlign === "justify"
      ? "before:float-none before:block before:w-full"
      : "before:float-left";

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: "underline cursor-pointer hover:opacity-80 visited:opacity-60 transition-opacity text-inherit",
          },
        },
        underline: {},
      }),
      BubbleMenuExtension,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: `before:content-[attr(data-placeholder)] before:text-ink-muted before:pointer-events-none before:h-0 ${placeholderAlignClass}`,
      }),
    ],
    [placeholder, placeholderAlignClass],
  );

  const editor = useEditor({
    extensions,
    content: String(value ?? ""),
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const isEmpty = editor.getText().trim() === "" && !html.includes("<img") && !html.includes("<hr");
      onChange?.(isEmpty ? "" : html);
    },
    editorProps: {
      attributes: {
        class: `outline-none min-h-[1.5em] focus:outline-none ProseMirror-compact ${editorClass}`,
      },
    },
  });

  useEffect(() => {
    if (editor && value !== undefined) {
      const stringValue = String(value ?? "");
      if (editor.getHTML() !== stringValue && !(stringValue === "" && editor.isEmpty)) {
        editor.commands.setContent(stringValue, { emitUpdate: false });
      }
    }
  }, [value, editor]);

  return (
    <div className={ghost ? "w-full" : "field-input relative group"}>
      {editor && (
        <BubbleMenu editor={editor} className="flex gap-0.5 p-1 bg-elevated border border-stroke rounded-lg shadow-lg z-50">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 rounded transition-colors duration-150 ${editor.isActive("bold") ? "bg-accent text-white" : "text-ink hover:bg-hover"}`}
            type="button"
            title="Bold (Ctrl+B)"
          >
            <Bold size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded transition-colors duration-150 ${editor.isActive("italic") ? "bg-accent text-white" : "text-ink hover:bg-hover"}`}
            type="button"
            title="Italic (Ctrl+I)"
          >
            <Italic size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1 rounded transition-colors duration-150 ${editor.isActive("underline") ? "bg-accent text-white" : "text-ink hover:bg-hover"}`}
            type="button"
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={14} />
          </button>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
      <style dangerouslySetInnerHTML={{ __html: `.ProseMirror-compact p { margin: 0; }` }} />
    </div>
  );
}
