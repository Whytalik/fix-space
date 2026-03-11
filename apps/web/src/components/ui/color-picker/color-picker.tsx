"use client";

import { useEscape } from "@/hooks/useEscape";
import { getPopoverStyle } from "@/utils/popover";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ─── color math ───────────────────────────────────────────────────────────────

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m || !m[1]) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rr = r / 255,
    gg = g / 255,
    bb = b / 255;
  const max = Math.max(rr, gg, bb),
    min = Math.min(rr, gg, bb);
  const v = max;
  const s = max === 0 ? 0 : (max - min) / max;
  let h = 0;
  if (max !== min) {
    const d = max - min;
    if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6;
    else if (max === gg) h = ((bb - rr) / d + 2) / 6;
    else h = ((rr - gg) / d + 4) / 6;
  }
  return [h * 360, s, v];
}

function isValidHex(v: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}

function hexFromHsv(h: number, s: number, v: number): string {
  return rgbToHex(...hsvToRgb(h, s, v));
}

// ─── component ────────────────────────────────────────────────────────────────

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
}

export function ColorPicker({ value, onChange, onClose, anchorEl }: ColorPickerProps) {
  function initHsv(): [number, number, number] {
    const rgb = value ? hexToRgb(value) : null;
    return rgb ? rgbToHsv(...rgb) : [0, 1, 1];
  }

  const [hue, setHue] = useState(() => initHsv()[0]);
  const [sat, setSat] = useState(() => initHsv()[1]);
  const [val, setVal] = useState(() => initHsv()[2]);
  const [hex, setHex] = useState(value ?? "");
  const [hexError, setHexError] = useState(false);

  // current preview hex (follows drag in real-time)
  const currentHex = hexFromHsv(hue, sat, val);

  const containerRef = useRef<HTMLDivElement>(null);

  // cached rects — captured once at pointerdown, reused throughout drag
  const svRectRef = useRef<DOMRect | null>(null);
  const hueRectRef = useRef<DOMRect | null>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);

  // sync external value → internal state (only when value prop actually changes)
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

  // close on outside click
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

  // ── S/V gradient drag ─────────────────────────────────────────────────────

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
    svRectRef.current = e.currentTarget.getBoundingClientRect(); // capture rect once
    calcSV(e.clientX, e.clientY, svRectRef.current);
  }

  function handleSVPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons !== 1 || !svRectRef.current) return;
    calcSV(e.clientX, e.clientY, svRectRef.current);
  }

  function handleSVPointerUp() {
    svRectRef.current = null;
  }

  // ── Hue slider drag ───────────────────────────────────────────────────────

  function calcHue(clientX: number, rect: DOMRect) {
    const h = Math.max(0, Math.min(360, ((clientX - rect.left) / rect.width) * 360));
    setHue(h);
    setHex(hexFromHsv(h, sat, val));
    setHexError(false);
  }

  function handleHuePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    hueRectRef.current = e.currentTarget.getBoundingClientRect(); // capture rect once
    calcHue(e.clientX, hueRectRef.current);
  }

  function handleHuePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons !== 1 || !hueRectRef.current) return;
    calcHue(e.clientX, hueRectRef.current);
  }

  function handleHuePointerUp() {
    hueRectRef.current = null;
  }

  // ── Hex input ─────────────────────────────────────────────────────────────

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

  // ── Save ──────────────────────────────────────────────────────────────────

  function handleSave() {
    onChange(currentHex);
    onClose();
  }

  // ── derived ───────────────────────────────────────────────────────────────

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
            placeholder="rrggbb"
            spellCheck={false}
            className="flex-1 min-w-0 bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted font-mono"
          />
        </div>
        {hexError && <p className="text-[11px] text-error px-0.5">Invalid hex color</p>}
      </div>

      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md border border-stroke/50 shrink-0" style={{ backgroundColor: currentHex }} />
        <button
          onClick={handleSave}
          className="flex-1 rounded-lg bg-accent text-white text-xs font-semibold py-1.5 hover:bg-accent-hover transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );

  if (anchorEl) return createPortal(content, document.body);
  return content;
}
