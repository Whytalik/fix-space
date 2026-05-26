"use client";

import { hexToRgb, rgbToHsv, isValidHex, hexFromHsv } from "@/lib/utils/color";
import { useEscape } from "@/hooks/useEscape";
import { getPopoverStyle } from "@/utils/popover";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
  showSwatches?: boolean;
}

export const COLOR_SWATCHES = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

export function ColorPicker({ value, onChange, onClose, anchorEl, showSwatches = false }: ColorPickerProps) {
  const t = useTranslations("ColorPicker");
  function initHsv(): [number, number, number] {
    const rgb = value ? hexToRgb(value) : null;
    return rgb ? rgbToHsv(...rgb) : [0, 1, 1];
  }

  const [hue, setHue] = useState(() => initHsv()[0]);
  const [sat, setSat] = useState(() => initHsv()[1]);
  const [val, setVal] = useState(() => initHsv()[2]);
  const [hex, setHex] = useState(value ?? "");
  const [hexError, setHexError] = useState(false);

  const currentHex = hexFromHsv(hue, sat, val);

  const containerRef = useRef<HTMLDivElement>(null);

  const svRectRef = useRef<DOMRect | null>(null);
  const hueRectRef = useRef<DOMRect | null>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);

  const prevValueRef = useRef(value);
  useEffect(() => {
    if (value === prevValueRef.current) return;
    prevValueRef.current = value;
    const rgb = value ? hexToRgb(value) : null;
    if (rgb) {
      const [h, s, v] = rgbToHsv(...rgb);
      setHue(h);
      setSat(s);
      setVal(v);
      setHex(value);
      setHexError(false);
    }
  }, [value]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current) return;
      if (containerRef.current.contains(e.target as Node)) return;
      if (anchorEl?.contains(e.target as Node)) return;
      onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorEl]);

  useEscape(onClose);

  function calcSV(clientX: number, clientY: number, rect: DOMRect) {
    const s = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
    setSat(s);
    setVal(v);
    setHex(hexFromHsv(hue, s, v));
    setHexError(false);
  }

  function handleSVPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    svRectRef.current = e.currentTarget.getBoundingClientRect();
    calcSV(e.clientX, e.clientY, svRectRef.current);
  }

  function handleSVPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons !== 1 || !svRectRef.current) return;
    calcSV(e.clientX, e.clientY, svRectRef.current);
  }

  function handleSVPointerUp() {
    svRectRef.current = null;
  }

  function calcHue(clientX: number, rect: DOMRect) {
    const h = Math.max(0, Math.min(360, ((clientX - rect.left) / rect.width) * 360));
    setHue(h);
    setHex(hexFromHsv(h, sat, val));
    setHexError(false);
  }

  function handleHuePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    hueRectRef.current = e.currentTarget.getBoundingClientRect();
    calcHue(e.clientX, hueRectRef.current);
  }

  function handleHuePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons !== 1 || !hueRectRef.current) return;
    calcHue(e.clientX, hueRectRef.current);
  }

  function handleHuePointerUp() {
    hueRectRef.current = null;
  }

  function handleHexChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const full = raw.startsWith("#") ? raw : "#" + raw;
    setHex(full);
    setHexError(false);
    if (isValidHex(full)) {
      const rgb = hexToRgb(full)!;
      const [h, s, v] = rgbToHsv(...rgb);
      setHue(h);
      setSat(s);
      setVal(v);
    }
  }

  function handleHexBlur() {
    const full = hex.startsWith("#") ? hex : "#" + hex;
    if (hex === "" || isValidHex(full)) {
      setHexError(false);
    } else {
      setHexError(true);
    }
  }

  function handleSave() {
    onChange(currentHex);
    onClose();
  }

  const hueColor = `hsl(${hue}, 100%, 50%)`;
  const cursorLeft = `${sat * 100}%`;
  const cursorTop = `${(1 - val) * 100}%`;
  const hueThumbLeft = `${(hue / 360) * 100}%`;

  const previewHex = isValidHex(hex.startsWith("#") ? hex : "#" + hex) ? (hex.startsWith("#") ? hex : "#" + hex) : null;

  const portalStyle = anchorEl ? getPopoverStyle(anchorEl) : undefined;

  const content = (
    <div
      ref={containerRef}
      style={portalStyle}
      className="flex flex-col gap-3 rounded-xl border border-stroke bg-elevated shadow-lg p-3 w-56"
    >
      <div
        ref={svRef}
        onPointerDown={handleSVPointerDown}
        onPointerMove={handleSVPointerMove}
        onPointerUp={handleSVPointerUp}
        className="relative h-36 w-full rounded-lg overflow-hidden cursor-pointer select-none touch-none"
        style={{ background: hueColor }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to right, #fff, transparent)" }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, #000, transparent)" }}
        />
        <div
          className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: cursorLeft, top: cursorTop, backgroundColor: currentHex }}
        />
      </div>

      <div
        ref={hueSliderRef}
        onPointerDown={handleHuePointerDown}
        onPointerMove={handleHuePointerMove}
        onPointerUp={handleHuePointerUp}
        className="relative h-3 w-full rounded-full cursor-pointer select-none touch-none"
        style={{ background: "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" }}
      >
        <div
          className="absolute top-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: hueThumbLeft, backgroundColor: hueColor }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <div
          className={`flex items-center gap-1.5 bg-surface border rounded-lg px-2 py-1.5 transition-colors ${
            hexError ? "border-error" : "border-stroke focus-within:border-accent"
          }`}
        >
          <div
            className="w-4 h-4 rounded-sm shrink-0 border border-stroke/50"
            style={{ backgroundColor: previewHex ?? "transparent" }}
          />
          <span className="text-xs text-ink-muted shrink-0 font-mono">#</span>
          <input
            type="text"
            value={hex.replace(/^#/, "")}
            onChange={handleHexChange}
            onBlur={handleHexBlur}
            maxLength={6}
            placeholder={t("hexPlaceholder")}
            spellCheck={false}
            className="flex-1 min-w-0 bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted font-mono"
          />
        </div>
        {hexError && <p className="text-[11px] text-error px-0.5">{t("invalidHex")}</p>}
      </div>

      {showSwatches && (
        <div className="flex flex-wrap gap-1.5">
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => {
                onChange(swatch);
                onClose();
              }}
              className="w-5 h-5 rounded-full border-2 hover:scale-110 transition-transform"
              style={{ backgroundColor: swatch, borderColor: value === swatch ? "white" : "transparent" }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md border border-stroke/50 shrink-0" style={{ backgroundColor: currentHex }} />
        <button
          onClick={handleSave}
          className="flex-1 rounded-lg bg-accent text-white text-xs font-semibold py-1.5 hover:bg-accent-hover transition-colors"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );

  if (anchorEl) return createPortal(content, document.body);
  return content;
}
