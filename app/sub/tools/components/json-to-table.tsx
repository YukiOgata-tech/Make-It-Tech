"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

const SAMPLE_JSON = `[
  { "id": 1, "name": "田中太郎", "email": "tanaka@example.com", "age": 28 },
  { "id": 2, "name": "山田花子", "email": "yamada@example.com", "age": 32 },
  { "id": 3, "name": "佐藤一郎", "email": "sato@example.com", "age": 25 }
]`;

export function JsonToTable() {
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const parseJson = () => {
    setError("");
    try {
      const parsed = JSON.parse(jsonInput);

      // 配列でない場合は配列に変換
      const dataArray = Array.isArray(parsed) ? parsed : [parsed];

      if (dataArray.length === 0) {
        setError("データが空です");
        return;
      }

      // すべてのキーを収集（ネストされたオブジェクトはフラット化）
      const allKeys = new Set<string>();
      dataArray.forEach((item) => {
        if (typeof item === "object" && item !== null) {
          Object.keys(item).forEach((key) => allKeys.add(key));
        }
      });

      setColumns(Array.from(allKeys));
      setParsedData(dataArray);
    } catch (e) {
      setError("JSONの解析に失敗しました。正しい形式か確認してください。");
      setParsedData([]);
      setColumns([]);
    }
  };

  const downloadCSV = () => {
    if (parsedData.length === 0) return;

    const csvRows: string[] = [];

    // ヘッダー
    csvRows.push(columns.map(col => `"${col}"`).join(","));

    // データ行
    parsedData.forEach((row) => {
      const values = columns.map((col) => {
        const val = row[col];
        if (val === null || val === undefined) return "";
        if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });

    const csvContent = "\uFEFF" + csvRows.join("\n"); // BOM付きUTF-8
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data.csv";
    link.click();
  };

  const downloadExcel = () => {
    if (parsedData.length === 0) return;

    // ワークシートデータを作成
    const wsData = [
      columns, // ヘッダー
      ...parsedData.map((row) =>
        columns.map((col) => {
          const val = row[col];
          if (val === null || val === undefined) return "";
          if (typeof val === "object") return JSON.stringify(val);
          return val;
        })
      ),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    XLSX.writeFile(wb, "data.xlsx");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const clearAll = () => {
    setJsonInput("");
    setParsedData([]);
    setColumns([]);
    setError("");
  };

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
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
            onChange={handleFileSelect}
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
        placeholder="JSONデータを入力..."
        className="w-full h-48 bg-neutral-800 border border-neutral-700 rounded-lg p-4 text-sm font-mono resize-none focus:outline-none focus:border-blue-500 mb-4"
      />

      {error && (
        <p className="text-sm text-red-400 mb-4">{error}</p>
      )}

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
                CSVでダウンロード
              </button>
              <button
                onClick={downloadExcel}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
              >
                Excelでダウンロード
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
                        {row[col] === null || row[col] === undefined
                          ? <span className="text-neutral-500">-</span>
                          : typeof row[col] === "object"
                            ? <span className="text-neutral-400">{JSON.stringify(row[col])}</span>
                            : String(row[col])}
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

      {/* Tips */}
      <div className="text-xs text-neutral-500">
        <p>※ 配列形式のJSONを想定しています。オブジェクト1つの場合は1行として処理されます。</p>
      </div>
    </div>
  );
}
