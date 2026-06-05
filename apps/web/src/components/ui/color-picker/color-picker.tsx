"use client";

import { hexFromHsv, hexToRgb, isValidHex, rgbToHsv } from "@/utils/color";
import { useFloatingPanel } from "@/hooks/useFloatingPanel";
import { getPopoverStyle } from "@/utils/popover";
import { PALETTE_COLOR_VALUES } from "@fixspace/domain/enums";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function hexToHsv(hex: string): [number, number, number] {
  const rgbValues = hex ? hexToRgb(hex) : null;
  return rgbValues ? rgbToHsv(...rgbValues) : [0, 1, 1];
}

function normalizeHex(hex: string): string {
  return hex.startsWith("#") ? hex : `#${hex}`;
}

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
}

export function ColorPicker({ value: initialValue, onChange, onClose, anchorEl }: ColorPickerProps) {
  const t = useTranslations("ColorPicker");

  const [[hue, saturation, brightness], setHsv] = useState<[number, number, number]>(() => hexToHsv(initialValue));
  const [hex, setHex] = useState(initialValue ?? "");
  const [hexError, setHexError] = useState(false);

  const currentHex = hexFromHsv(hue, saturation, brightness);
  const containerRef = useRef<HTMLDivElement>(null);
  const svRectRef = useRef<DOMRect | null>(null);
  const hueRectRef = useRef<DOMRect | null>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);

  const prevValueRef = useRef(initialValue);
  useEffect(() => {
    if (initialValue === prevValueRef.current) return;
    prevValueRef.current = initialValue;
    const rgbValues = initialValue ? hexToRgb(initialValue) : null;
    if (rgbValues) {
      setHsv(rgbToHsv(...rgbValues));
      setHex(initialValue);
      setHexError(false);
    }
  }, [initialValue]);

  useFloatingPanel(containerRef, onClose, anchorEl);

  function calcSV(clientX: number, clientY: number, rect: DOMRect) {
    const nextSaturation = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const nextBrightness = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
    setHsv([hue, nextSaturation, nextBrightness]);
    setHex(hexFromHsv(hue, nextSaturation, nextBrightness));
    setHexError(false);
  }

  function handleSVPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    svRectRef.current = event.currentTarget.getBoundingClientRect();
    calcSV(event.clientX, event.clientY, svRectRef.current);
  }

  function handleSVPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.buttons !== 1 || !svRectRef.current) return;
    calcSV(event.clientX, event.clientY, svRectRef.current);
  }

  function handleSVPointerUp() {
    svRectRef.current = null;
  }

  function calcHue(clientX: number, rect: DOMRect) {
    const nextHue = Math.max(0, Math.min(360, ((clientX - rect.left) / rect.width) * 360));
    setHsv([nextHue, saturation, brightness]);
    setHex(hexFromHsv(nextHue, saturation, brightness));
    setHexError(false);
  }

  function handleHuePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    hueRectRef.current = event.currentTarget.getBoundingClientRect();
    calcHue(event.clientX, hueRectRef.current);
  }

  function handleHuePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.buttons !== 1 || !hueRectRef.current) return;
    calcHue(event.clientX, hueRectRef.current);
  }

  function handleHuePointerUp() {
    hueRectRef.current = null;
  }

  function handleHexChange(event: React.ChangeEvent<HTMLInputElement>) {
    const normalizedHex = normalizeHex(event.target.value);
    setHex(normalizedHex);
    setHexError(false);
    if (isValidHex(normalizedHex)) {
      setHsv(rgbToHsv(...hexToRgb(normalizedHex)!));
    }
  }

  function handleHexBlur() {
    if (hex === "" || isValidHex(normalizeHex(hex))) {
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
  const cursorLeft = `${saturation * 100}%`;
  const cursorTop = `${(1 - brightness) * 100}%`;
  const hueThumbLeft = `${(hue / 360) * 100}%`;
  const fullHex = normalizeHex(hex);
  const previewHex = isValidHex(fullHex) ? fullHex : null;
  const portalStyle = anchorEl ? getPopoverStyle(anchorEl) : undefined;

  const content = (
    <div
      ref={containerRef}
      style={portalStyle}
      className="flex flex-col gap-3 rounded-2xl border border-stroke bg-elevated shadow-lg p-3 w-56"
    >
      <div
        ref={svRef}
        onPointerDown={handleSVPointerDown}
        onPointerMove={handleSVPointerMove}
        onPointerUp={handleSVPointerUp}
        className="relative h-36 w-full rounded-lg overflow-hidden cursor-pointer select-none touch-none"
        style={{ background: hueColor }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, #fff, transparent)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, #000, transparent)" }} />
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
          className={`flex items-center gap-1.5 bg-surface border rounded-lg px-2 py-1.5 transition-colors duration-150 ${
            hexError ? "border-error" : "border-stroke focus-within:border-accent"
          }`}
        >
          <div className="w-4 h-4 rounded-sm shrink-0 border border-stroke/50" style={{ backgroundColor: previewHex ?? "transparent" }} />
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
        {hexError && <p className="type-hint text-error px-0.5">{t("invalidHex")}</p>}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PALETTE_COLOR_VALUES.map((swatch) => (
          <button
            key={swatch}
            type="button"
            onClick={() => {
              onChange(swatch);
              onClose();
            }}
            className="w-5 h-5 rounded-full border-2 hover:scale-110 transition-transform"
            style={{ backgroundColor: swatch, borderColor: initialValue === swatch ? "white" : "transparent" }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md border border-stroke/50 shrink-0" style={{ backgroundColor: currentHex }} />
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 rounded-lg bg-accent text-white text-xs font-semibold py-1.5 hover:bg-accent-hover transition-colors duration-150"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );

  if (anchorEl) return createPortal(content, document.body);
  return content;
}
