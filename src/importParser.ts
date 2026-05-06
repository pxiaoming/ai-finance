import * as XLSX from "xlsx";

export type ParsedColumnType = "date" | "amount" | "category" | "text";

export type ParsedColumn = {
  name: string;
  sample: string;
  inferredType: ParsedColumnType;
  emptyRatio: number;
};

export type SheetAnalysis = {
  sheetName: string;
  rowCount: number;
  columnCount: number;
  columns: ParsedColumn[];
  issues: string[];
  headers: string[];
  previewRows: string[][];
  dataRows: string[][];
};

export type SpreadsheetAnalysis = {
  sheetNames: string[];
  activeSheetName: string;
  sheets: Record<string, SheetAnalysis>;
};

export async function parseSpreadsheet(file: File): Promise<SpreadsheetAnalysis> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", raw: false });
  const sheetNames = workbook.SheetNames;

  if (sheetNames.length === 0) {
    return {
      sheetNames: [],
      activeSheetName: "",
      sheets: {},
    };
  }

  const sheets = Object.fromEntries(
    sheetNames.map((sheetName) => [sheetName, analyzeSheet(workbook.Sheets[sheetName], sheetName)]),
  );

  return {
    sheetNames,
    activeSheetName: sheetNames[0],
    sheets,
  };
}

function analyzeSheet(sheet: XLSX.WorkSheet | undefined, sheetName: string): SheetAnalysis {
  if (!sheet) {
    return {
      sheetName,
      rowCount: 0,
      columnCount: 0,
      columns: [],
      issues: ["工作表读取失败"],
      headers: [],
      previewRows: [],
      dataRows: [],
    };
  }

  const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
    header: 1,
    raw: false,
    defval: "",
  });

  const headerIndex = rows.findIndex((row) => row.some((cell) => hasValue(cell)));

  if (headerIndex === -1) {
    return {
      sheetName,
      rowCount: 0,
      columnCount: 0,
      columns: [],
      issues: ["文件为空，未检测到有效表头"],
      headers: [],
      previewRows: [],
      dataRows: [],
    };
  }

  const rawHeaders = rows[headerIndex] ?? [];
  const headers = rawHeaders.map((header, index) => {
    const normalized = normalizeCell(header);
    return normalized || `未命名列${index + 1}`;
  });

  const bodyRows = rows
    .slice(headerIndex + 1)
    .map((row) => headers.map((_, index) => normalizeCell(row[index])))
    .filter((row) => row.some((cell) => cell !== ""));

  const columns = headers.map((header, index) => {
    const values = bodyRows.map((row) => row[index] ?? "");
    return analyzeColumn(header, values);
  });

  const issues: string[] = [];
  const duplicateHeaders = getDuplicateHeaders(headers);

  if (duplicateHeaders.length > 0) {
    issues.push(`检测到重复字段名：${duplicateHeaders.join("、")}`);
  }

  if (headers.some((header) => header.startsWith("未命名列"))) {
    issues.push("存在空白表头，系统已用“未命名列”补齐");
  }

  columns
    .filter((column) => column.emptyRatio >= 0.3)
    .forEach((column) => {
      issues.push(`字段“${column.name}”空值占比超过 30%`);
    });

  columns
    .filter((column) => column.inferredType === "date")
    .forEach((column, index) => {
      const formats = detectDateFormats(bodyRows.map((row) => row[index] ?? ""));
      if (formats.size > 1) {
        issues.push(`字段“${column.name}”存在多种日期格式，建议统一`);
      }
    });

  if (bodyRows.length === 0) {
    issues.push("仅检测到表头，暂无可分析的数据行");
  }

  return {
    sheetName,
    rowCount: bodyRows.length,
    columnCount: headers.length,
    columns,
    issues,
    headers,
    previewRows: bodyRows.slice(0, 20),
    dataRows: bodyRows,
  };
}

function analyzeColumn(name: string, values: string[]): ParsedColumn {
  const nonEmptyValues = values.filter(Boolean);
  const inferredType = inferColumnType(name, nonEmptyValues);

  return {
    name,
    sample: nonEmptyValues[0] ?? "空",
    inferredType,
    emptyRatio: values.length === 0 ? 0 : (values.length - nonEmptyValues.length) / values.length,
  };
}

function inferColumnType(name: string, values: string[]): ParsedColumnType {
  const lowerName = name.toLowerCase();

  if (containsAny(lowerName, ["date", "日期", "时间", "月", "day"])) {
    return "date";
  }

  if (containsAny(lowerName, ["金额", "税", "收入", "成本", "余额", "amount", "price", "fee"])) {
    return "amount";
  }

  if (containsAny(lowerName, ["科目", "分类", "部门", "项目", "客户", "类型", "category", "dept"])) {
    return "category";
  }

  if (values.length === 0) {
    return "text";
  }

  const numericRatio = values.filter((value) => isNumberLike(value)).length / values.length;
  if (numericRatio >= 0.8) {
    return "amount";
  }

  const dateRatio = values.filter((value) => isDateLike(value)).length / values.length;
  if (dateRatio >= 0.7) {
    return "date";
  }

  const uniqueCount = new Set(values).size;
  if (uniqueCount <= Math.min(8, Math.max(3, Math.ceil(values.length * 0.5)))) {
    return "category";
  }

  return "text";
}

function detectDateFormats(values: string[]) {
  const formats = new Set<string>();

  values.filter(Boolean).forEach((value) => {
    if (value.includes("/")) {
      formats.add("slash");
    } else if (value.includes("-")) {
      formats.add("dash");
    } else if (/^\d{8}$/.test(value)) {
      formats.add("compact");
    }
  });

  return formats;
}

function getDuplicateHeaders(headers: string[]) {
  const counter = new Map<string, number>();

  headers.forEach((header) => {
    counter.set(header, (counter.get(header) ?? 0) + 1);
  });

  return Array.from(counter.entries())
    .filter(([, count]) => count > 1)
    .map(([header]) => header);
}

function containsAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function isNumberLike(value: string) {
  const normalized = value.replace(/,/g, "").replace(/¥|\$/g, "").trim();
  return normalized !== "" && !Number.isNaN(Number(normalized));
}

function isDateLike(value: string) {
  if (!value.trim()) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

function normalizeCell(value: string | number | boolean | null | undefined) {
  return String(value ?? "").trim();
}

function hasValue(value: string | number | boolean | null | undefined) {
  return normalizeCell(value) !== "";
}
