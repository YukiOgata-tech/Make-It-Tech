"use client";

import { useState } from "react";
import ExcelJS from "exceljs";
import Papa from "papaparse";

type ConvertMode = "jsonToTable" | "tableToJson";

const PLACEHOLDER_JSON = `[
  { "id": 1, "name": "田中太郎", "email": "tanaka@example.com" },
  { "id": 2, "name": "山田花子", "email": "yamada@example.com" }
]`;

export function JsonToTable() {
  const [mode, setMode] = useState<ConvertMode>("jsonToTable");

  // JSON → Table state
  const [jsonInput, setJsonInput] = useState("");
  const [parsedData, setParsedData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  // Table → JSON state
  const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [jsonOutput, setJsonOutput] = useState("");
  const [fileName, setFileName] = useState("");

  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const getFileExtension = (name: string) =>
    name.toLowerCase().split(".").pop() ?? "";

  const normalizeCellValue = (value: ExcelJS.CellValue) => {
    if (value === null || value === undefined) return "";
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "object") {
      if ("text" in value && typeof value.text === "string") {
        return value.text;
      }
      if ("richText" in value && Array.isArray(value.richText)) {
        return value.richText.map((part) => part.text).join("");
      }
      if ("formula" in value) {
        return (value as { result?: unknown }).result ?? value.formula;
      }
      if ("hyperlink" in value) {
        const linkValue = value as { text?: string; hyperlink?: string };
        return linkValue.text ?? linkValue.hyperlink ?? "";
      }
      if ("result" in value) {
        return (value as { result?: unknown }).result ?? "";
      }
    }
    return value;
  };

  const parseCsvText = (text: string) => {
    const result = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: "greedy",
      dynamicTyping: true,
    });

    if (result.errors.length) {
      throw new Error("CSVの解析に失敗しました");
    }

    const data = result.data.filter((row) =>
      Object.values(row).some((value) => value !== null && value !== undefined && String(value).trim() !== "")
    );
    const columns = result.meta.fields?.filter(Boolean) ?? [];

    return { data, columns };
  };

  const parseExcelBuffer = async (data: ArrayBuffer) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(data);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      throw new Error("シートが見つかりません");
    }

    const headerRow = worksheet.getRow(1);
    const maxColumns = Math.max(headerRow.cellCount, worksheet.columnCount ?? 0);

    if (maxColumns === 0) {
      throw new Error("データが空です");
    }

    const columns = Array.from({ length: maxColumns }, (_, index) => {
      const cellValue = headerRow.getCell(index + 1).value;
      const normalized = normalizeCellValue(cellValue);
      const asText = typeof normalized === "string" ? normalized.trim() : String(normalized ?? "").trim();
      return asText || `column_${index + 1}`;
    });

    const dataRows: Record<string, unknown>[] = [];
    for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex += 1) {
      const row = worksheet.getRow(rowIndex);
      const rowObject: Record<string, unknown> = {};
      let hasValue = false;

      columns.forEach((column, colIndex) => {
        const cellValue = normalizeCellValue(row.getCell(colIndex + 1).value);
        if (cellValue !== "" && cellValue !== null && cellValue !== undefined) {
          hasValue = true;
        }
        rowObject[column] = cellValue;
      });

      if (hasValue) {
        dataRows.push(rowObject);
      }
    }

    return { data: dataRows, columns };
  };

  const parseTableFile = async (file: File) => {
    const extension = getFileExtension(file.name);
    if (extension === "csv") {
      const text = await file.text();
      return parseCsvText(text);
    }
    if (extension === "xlsx") {
      const data = await file.arrayBuffer();
      return parseExcelBuffer(data);
    }
    throw new Error("CSV または XLSX ファイルを選択してください");
  };

  // ========== JSON → Table ==========
  const parseJson = () => {
    setError("");

    if (!jsonInput.trim()) {
      setError("JSONデータを入力してください");
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const dataArray = Array.isArray(parsed) ? parsed : [parsed];

      if (dataArray.length === 0) {
        setError("データが空です");
        return;
      }

      const allKeys = new Set<string>();
      dataArray.forEach((item) => {
        if (typeof item === "object" && item !== null) {
          Object.keys(item).forEach((key) => allKeys.add(key));
        }
      });

      setColumns(Array.from(allKeys));
      setParsedData(dataArray);
    } catch {
      setError("JSONの解析に失敗しました。正しい形式か確認してください。");
      setParsedData([]);
      setColumns([]);
    }
  };

  const downloadCSV = () => {
    if (parsedData.length === 0) return;

    const csvRows: string[] = [];
    csvRows.push(columns.map((col) => `"${col}"`).join(","));

    parsedData.forEach((row) => {
      const values = columns.map((col) => {
        const val = row[col];
        if (val === null || val === undefined) return "";
        if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data.csv";
    link.click();
  };

  const downloadExcel = async () => {
    if (parsedData.length === 0) return;

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data");

      worksheet.addRow(columns);
      parsedData.forEach((row) => {
        worksheet.addRow(
          columns.map((col) => {
            const val = row[col];
            if (val === null || val === undefined) return "";
            if (typeof val === "object") return JSON.stringify(val);
            return val;
          })
        );
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "data.xlsx";
      link.click();
    } catch {
      setError("Excelの生成に失敗しました");
    }
  };

  const handleJsonFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setJsonInput(reader.result as string);
      };
      reader.readAsText(file);
    }
    e.target.value = "";
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch {
      setError("JSONの整形に失敗しました");
    }
  };

  // ========== Table → JSON ==========
  const handleTableFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setFileName(file.name);

    try {
      const { data, columns } = await parseTableFile(file);

      if (data.length === 0) {
        setError("データが空です");
        return;
      }

      setTableColumns(columns);
      setTableData(data);
      setJsonOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ファイルの読み込みに失敗しました");
    }

    e.target.value = "";
  };

  const handleTableDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const validExtensions = [".csv", ".xlsx"];
    if (!validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      setError("CSV または XLSX ファイルを選択してください");
      return;
    }

    setError("");
    setFileName(file.name);

    try {
      const { data, columns } = await parseTableFile(file);

      if (data.length === 0) {
        setError("データが空です");
        return;
      }

      setTableColumns(columns);
      setTableData(data);
      setJsonOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ファイルの読み込みに失敗しました");
    }
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("クリップボードへのコピーに失敗しました");
    }
  };

  const downloadJson = () => {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data.json";
    link.click();
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonOutput);
      setJsonOutput(JSON.stringify(parsed));
    } catch {
      setError("JSONの圧縮に失敗しました");
    }
  };

  const prettifyJson = () => {
    try {
      const parsed = JSON.parse(jsonOutput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
    } catch {
      setError("JSONの整形に失敗しました");
    }
  };

  // Clear
  const clearAll = () => {
    if (mode === "jsonToTable") {
      setJsonInput("");
      setParsedData([]);
      setColumns([]);
    } else {
      setTableData([]);
      setTableColumns([]);
      setJsonOutput("");
      setFileName("");
    }
    setError("");
  };

  // Switch mode
  const switchMode = (newMode: ConvertMode) => {
    setMode(newMode);
    setError("");
  };

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
      {/* Mode Toggle */}
      <div className="flex gap-1 mb-6">
        <button
          onClick={() => switchMode("jsonToTable")}
          className={`flex-1 py-2.5 px-4 rounded-l-lg text-sm font-medium transition-colors ${
            mode === "jsonToTable"
              ? "bg-blue-600 text-white"
              : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            JSON → CSV / Excel
          </span>
        </button>
        <button
          onClick={() => switchMode("tableToJson")}
          className={`flex-1 py-2.5 px-4 rounded-r-lg text-sm font-medium transition-colors ${
            mode === "tableToJson"
              ? "bg-blue-600 text-white"
              : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV / Excel → JSON
          </span>
        </button>
      </div>

      {mode === "jsonToTable" ? (
        <>
          <h2 className="text-xl font-semibold mb-2">JSON → CSV / Excel</h2>
          <p className="text-sm text-neutral-400 mb-4">
            JSONデータをCSVまたはExcel形式に変換してダウンロード
          </p>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 mb-4">
            <label className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm cursor-pointer transition-colors">
              JSONファイルを開く
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleJsonFileSelect}
                className="hidden"
              />
            </label>
            <button
              onClick={formatJson}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm transition-colors"
            >
              整形
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm transition-colors"
            >
              クリア
            </button>
          </div>

          {/* JSON Input */}
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={PLACEHOLDER_JSON}
            className="w-full h-48 bg-neutral-800 border border-neutral-700 rounded-lg p-4 text-sm font-mono resize-none focus:outline-none focus:border-blue-500 mb-4 placeholder:text-neutral-600"
          />

          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

          {/* Parse Button */}
          <button
            onClick={parseJson}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors mb-4"
          >
            解析してプレビュー
          </button>

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">プレビュー ({parsedData.length}行)</h3>
                <div className="flex gap-2">
                  <button
                    onClick={downloadCSV}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                  >
                    CSV
                  </button>
                  <button
                    onClick={downloadExcel}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                  >
                    Excel
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto border border-neutral-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-800">
                      {columns.map((col) => (
                        <th key={col} className="px-3 py-2 text-left font-medium border-b border-neutral-700">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                        {columns.map((col) => (
                          <td key={col} className="px-3 py-2 truncate max-w-[200px]">
                            {row[col] === null || row[col] === undefined ? (
                              <span className="text-neutral-500">-</span>
                            ) : typeof row[col] === "object" ? (
                              <span className="text-neutral-400">{JSON.stringify(row[col])}</span>
                            ) : (
                              String(row[col])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 10 && (
                  <div className="px-3 py-2 text-xs text-neutral-500 bg-neutral-800/50">
                    他 {parsedData.length - 10} 行...
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-xs text-neutral-500">
            <p>※ 配列形式のJSONを想定しています。オブジェクト1つの場合は1行として処理されます。</p>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-2">CSV / Excel → JSON</h2>
          <p className="text-sm text-neutral-400 mb-4">
            CSVまたはExcelファイルをJSON形式に変換
          </p>

          {/* Drop Zone */}
          <div
            onDrop={handleTableDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer mb-4"
            onClick={() => document.getElementById("table-file-input")?.click()}
          >
              <input
                id="table-file-input"
                type="file"
                accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleTableFileSelect}
                className="hidden"
              />
            <div className="text-neutral-400">
              <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>ドラッグ＆ドロップ または クリックして選択</p>
              <p className="text-xs mt-1">CSV / XLSX 対応</p>
            </div>
          </div>

          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

          {/* Result */}
          {tableData.length > 0 && (
            <div className="space-y-4">
              {/* File info */}
              <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{fileName}</p>
                  <p className="text-xs text-neutral-400">
                    {tableData.length} 行 × {tableColumns.length} 列
                  </p>
                </div>
                <button
                  onClick={clearAll}
                  className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-sm transition-colors"
                >
                  クリア
                </button>
              </div>

              {/* Preview Table */}
              <div>
                <h3 className="text-sm font-medium mb-2">プレビュー</h3>
                <div className="overflow-x-auto border border-neutral-700 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-800">
                        {tableColumns.map((col) => (
                          <th key={col} className="px-3 py-2 text-left font-medium border-b border-neutral-700">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                          {tableColumns.map((col) => (
                            <td key={col} className="px-3 py-2 truncate max-w-[200px]">
                              {row[col] === null || row[col] === undefined ? (
                                <span className="text-neutral-500">-</span>
                              ) : (
                                String(row[col])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tableData.length > 5 && (
                    <div className="px-3 py-2 text-xs text-neutral-500 bg-neutral-800/50">
                      他 {tableData.length - 5} 行...
                    </div>
                  )}
                </div>
              </div>

              {/* JSON Output */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">JSON出力</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={prettifyJson}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-xs transition-colors"
                    >
                      整形
                    </button>
                    <button
                      onClick={minifyJson}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-xs transition-colors"
                    >
                      圧縮
                    </button>
                  </div>
                </div>
                <textarea
                  value={jsonOutput}
                  onChange={(e) => setJsonOutput(e.target.value)}
                  className="w-full h-48 bg-neutral-800 border border-neutral-700 rounded-lg p-4 text-sm font-mono resize-none focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={copyJson}
                  className="flex-1 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-sm font-medium transition-colors"
                >
                  {copied ? "コピーしました!" : "クリップボードにコピー"}
                </button>
                <button
                  onClick={downloadJson}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  JSONをダウンロード
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-neutral-500">
            <p>※ 1行目がヘッダー（カラム名）として認識されます。</p>
          </div>
        </>
      )}
    </div>
  );
}
