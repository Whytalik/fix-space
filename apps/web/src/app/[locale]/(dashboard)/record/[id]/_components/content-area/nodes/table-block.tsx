"use client";

import { useTranslations } from "next-intl";
import type { TableComponentData } from "@fixspace/domain";

interface TableComponentProps {
  data: TableComponentData;
  isEditing?: boolean;
  onUpdate: (data: TableComponentData) => void;
}

export function TableComponent({ data, onUpdate }: TableComponentProps) {
  const t = useTranslations("RecordPage.canvas");
  const headers = data.headers || ["Col 1", "Col 2"];
  const rows = data.rows || [["", ""]];

  const updateHeader = (columnIndex: number, value: string) => {
    const nextHeaders = [...headers];
    nextHeaders[columnIndex] = value;
    onUpdate({ ...data, headers: nextHeaders });
  };

  const updateCell = (rowIndex: number, columnIndex: number, value: string) => {
    const nextRows = rows.map((row, currentRowIndex) => {
      if (currentRowIndex !== rowIndex) return row;
      const nextRow = [...row];
      nextRow[columnIndex] = value;
      return nextRow;
    });
    onUpdate({ ...data, rows: nextRows });
  };

  const addColumn = () => {
    const nextHeaders = [...headers, ""];
    const nextRows = rows.map((row) => [...row, ""]);
    onUpdate({ ...data, headers: nextHeaders, rows: nextRows });
  };

  const removeColumn = (columnIndex: number) => {
    if (headers.length <= 1) return;
    const nextHeaders = headers.filter((_, index) => index !== columnIndex);
    const nextRows = rows.map((row) => row.filter((_, index) => index !== columnIndex));
    onUpdate({ ...data, headers: nextHeaders, rows: nextRows });
  };

  const addRow = () => {
    const newRow = Array.from({ length: headers.length }, () => "");
    onUpdate({ ...data, rows: [...rows, newRow] });
  };

  const removeRow = (rowIndex: number) => {
    if (rows.length <= 1) return;
    onUpdate({ ...data, rows: rows.filter((_, index) => index !== rowIndex) });
  };

  return (
    <div className="py-2 flex flex-col gap-2 w-full overflow-x-auto">
      <div className="border border-stroke rounded-lg overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className={`border-b border-stroke ${data.highlightFirstRow ? "bg-elevated" : "bg-surface"}`}>
              {headers.map((header, columnIndex) => (
                <th
                  key={columnIndex}
                  className={`p-2 border border-stroke text-left relative group/th min-w-[120px] ${
                    data.highlightFirstCol && columnIndex === 0 ? "bg-elevated" : ""
                  } ${
                    data.highlightFirstRow || (data.highlightFirstCol && columnIndex === 0)
                      ? "font-bold text-ink"
                      : "font-semibold text-ink-secondary"
                  }`}
                >
                  <input
                    type="text"
                    value={header}
                    placeholder={`${t("column")} ${columnIndex + 1}`}
                    onChange={(event) => updateHeader(columnIndex, event.target.value)}
                    className={`bg-transparent w-full border-none outline-none placeholder:text-ink-muted/50 placeholder:font-normal ${
                      data.highlightFirstRow || (data.highlightFirstCol && columnIndex === 0)
                        ? "font-bold text-ink"
                        : "font-semibold text-ink-secondary"
                    }`}
                  />
                  {headers.length > 1 && (
                    <button
                      onClick={() => removeColumn(columnIndex)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/th:opacity-100 p-0.5 bg-elevated hover:bg-surface-hover border border-stroke rounded text-ink-muted hover:text-error transition-all duration-150"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </th>
              ))}
              <th className="p-1 w-10 bg-surface text-center border border-stroke">
                <button
                  onClick={addColumn}
                  className="p-1 hover:bg-surface-hover rounded text-ink-muted hover:text-ink transition-colors duration-150 font-bold"
                  title={t("addColumn")}
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-stroke last:border-b-0">
                {row.map((cell, columnIndex) => (
                  <td
                    key={columnIndex}
                    className={`p-2 border border-stroke min-w-[120px] ${
                      data.highlightFirstCol && columnIndex === 0 ? "bg-elevated font-semibold text-ink" : "text-ink"
                    }`}
                  >
                    <input
                      type="text"
                      value={cell}
                      onChange={(event) => updateCell(rowIndex, columnIndex, event.target.value)}
                      className={`bg-transparent w-full border-none outline-none ${
                        data.highlightFirstCol && columnIndex === 0 ? "font-semibold text-ink" : "text-ink"
                      }`}
                    />
                  </td>
                ))}
                <td className="p-1 text-center w-10 border border-stroke">
                  {rows.length > 1 && (
                    <button
                      onClick={() => removeRow(rowIndex)}
                      className="p-1 hover:bg-surface-hover rounded text-ink-muted hover:text-error transition-colors duration-150"
                      title={t("removeRow")}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={addRow}
        className="text-left text-xs text-ink-muted hover:text-accent font-medium transition-colors duration-150 mt-1 flex items-center gap-1 self-start"
      >
        {t("addRow")}
      </button>
    </div>
  );
}
