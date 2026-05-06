import { useEffect, useRef, useState, type ChangeEvent, type Dispatch, type DragEvent, type SetStateAction } from "react";
import { ArtifactPanel, Composer, Message, SidebarSection } from "./components";
import { navItems, recentThreads, templateTags, type ViewId } from "./data";
import { parseSpreadsheet, type ParsedColumnType, type SpreadsheetAnalysis } from "./importParser";

const ACCEPTED_EXTENSIONS = new Set(["xlsx", "xls", "csv"]);
const MAX_FILE_SIZE = 100 * 1024 * 1024;

type ImportFileStatus = "parsing" | "ready" | "invalid";

type ImportFileItem = {
  id: string;
  name: string;
  extension: string;
  sizeLabel: string;
  status: ImportFileStatus;
  note: string;
  analysis?: SpreadsheetAnalysis;
};

function App() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const [importFiles, setImportFiles] = useState<ImportFileItem[]>([]);
  const [processSnapshot, setProcessSnapshot] = useState<ProcessSnapshot | null>(null);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-mark">F</div>
            <div>
              <p className="eyebrow">Finance Agent</p>
              <h1>FinFlow</h1>
            </div>
          </div>

          <button className="sidebar-action">
            <span>+</span>
            <strong>新建任务</strong>
          </button>
        </div>

        <nav className="nav-list" aria-label="主导航">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item${activeView === item.id ? " active" : ""}`}
              onClick={() => setActiveView(item.id)}
            >
              <span>{item.title}</span>
              <small>{item.subtitle}</small>
            </button>
          ))}
        </nav>

        <SidebarSection title="最近会话">
          {recentThreads.map((thread) => (
            <article key={thread.title} className={`thread-card${thread.active ? " active" : ""}`}>
              <strong>{thread.title}</strong>
              <small>{thread.subtitle}</small>
            </article>
          ))}
        </SidebarSection>

        <SidebarSection title="推荐模板" compact>
          <div className="mini-tags">
            {templateTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </SidebarSection>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar">财</div>
            <div>
              <strong>财务专员</strong>
              <small>月结处理中</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">开发版前端骨架</p>
            <h2>{navItems.find((item) => item.id === activeView)?.title}</h2>
          </div>
          <div className="topbar-actions">
            <span className="top-pill">React + Vite</span>
            <button className="ghost-button">分享原型</button>
          </div>
        </header>

        {activeView === "dashboard" ? <DashboardView onJump={setActiveView} fileCount={importFiles.length} /> : null}
        {activeView === "import" ? <ImportView files={importFiles} onFilesChange={setImportFiles} onJump={setActiveView} /> : null}
        {activeView === "process" ? <ProcessView files={importFiles} onJump={setActiveView} onResultChange={setProcessSnapshot} /> : null}
        {activeView === "analysis" ? <AnalysisView onJump={setActiveView} snapshot={processSnapshot} /> : null}
        {activeView === "export" ? <ExportView /> : null}
      </main>
    </div>
  );
}

function DashboardView({
  onJump,
  fileCount,
}: {
  onJump: (view: ViewId) => void;
  fileCount: number;
}) {
  return (
    <section className="workspace-grid">
      <section className="chat-column">
        <div className="chat-thread">
          <Message
            role="assistant"
            avatar="F"
            label="FinFlow Agent"
            title="今天想先处理哪一类财务任务？"
            actions={
              <>
                <button className="chip-button" onClick={() => onJump("import")}>
                  上传费用明细
                </button>
                <button className="chip-button" onClick={() => onJump("process")}>
                  查看处理流程
                </button>
                <button className="chip-button" onClick={() => onJump("analysis")}>
                  直接看分析页
                </button>
              </>
            }
          >
            <p>我可以先帮你导入 Excel、识别字段，再继续做费用汇总、流水对账或收入成本分析。</p>
          </Message>

          <Message role="user" avatar="你">
            <p>先做一版面向财务人员的 Excel 数据处理平台，强调 Agent 感和左右布局。</p>
          </Message>

          <Message role="assistant" avatar="F" label="已整理">
            <ul className="message-list">
              <li>保留财务高频场景：费用汇总、对账、收入成本分析</li>
              <li>左侧改成会话导航和任务历史</li>
              <li>右侧改成 Agent 工作区，承载表格、图表和导出物</li>
            </ul>
          </Message>
        </div>

        <div className="composer">
          <div className="composer-hint">试试输入：帮我把 4 月费用明细汇总成部门月报，并生成异常提醒</div>
          <div className="composer-bar">
            <span className="composer-icon">+</span>
            <input type="text" value="请帮我开始一个新的财务处理任务" aria-label="输入任务" readOnly />
            <button className="primary-button">发送</button>
          </div>
        </div>
      </section>

      <aside className="artifact-column">
        <ArtifactPanel eyebrow="本周重点" title="4 月费用分析任务" aside={<span className="status-pill live">执行中</span>} className="spotlight">
          <div className="metric-grid">
            <article className="metric-card">
              <span>待处理文件</span>
              <strong>{fileCount || 2}</strong>
            </article>
            <article className="metric-card">
              <span>识别字段</span>
              <strong>24</strong>
            </article>
            <article className="metric-card">
              <span>异常记录</span>
              <strong>14</strong>
            </article>
            <article className="metric-card">
              <span>预计输出</span>
              <strong>3 张表</strong>
            </article>
          </div>
        </ArtifactPanel>

        <ArtifactPanel eyebrow="快速开始" title="推荐任务模板">
          <div className="stack-list">
            <article className="stack-card">
              <strong>费用汇总 Agent</strong>
              <p>自动清洗字段、映射科目、按部门和月份输出汇总表。</p>
            </article>
            <article className="stack-card">
              <strong>银行流水对账 Agent</strong>
              <p>匹配流水与台账，输出未匹配清单和差异原因。</p>
            </article>
            <article className="stack-card">
              <strong>收入成本分析 Agent</strong>
              <p>按月份、客户、产品输出收入、成本、毛利趋势。</p>
            </article>
          </div>
        </ArtifactPanel>
      </aside>
    </section>
  );
}

function ImportView({
  files,
  onFilesChange,
  onJump,
}: {
  files: ImportFileItem[];
  onFilesChange: Dispatch<SetStateAction<ImportFileItem[]>>;
  onJump: (view: ViewId) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const validFiles = files.filter((file) => file.status === "ready");
  const parsingFiles = files.filter((file) => file.status === "parsing");
  const primaryFile = validFiles[validFiles.length - 1];

  async function buildFileItem(file: File): Promise<ImportFileItem> {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const isAccepted = ACCEPTED_EXTENSIONS.has(extension);
    const isTooLarge = file.size > MAX_FILE_SIZE;
    const baseItem = {
      id: getFileId(file),
      name: file.name,
      extension,
      sizeLabel: formatFileSize(file.size),
    };

    if (!isAccepted) {
      return {
        ...baseItem,
        status: "invalid",
        note: "不支持的文件类型，仅支持 Excel 或 CSV",
      };
    }

    if (isTooLarge) {
      return {
        ...baseItem,
        status: "invalid",
        note: "文件超过 100MB，请拆分后重新导入",
      };
    }

    try {
      const analysis = await parseSpreadsheet(file);
      const activeSheet = analysis.sheets[analysis.activeSheetName];

      return {
        ...baseItem,
        status: "ready",
        note: `${activeSheet?.sheetName ?? "未识别工作表"} · ${activeSheet?.rowCount ?? 0} 行 · ${activeSheet?.columnCount ?? 0} 列`,
        analysis,
      };
    } catch {
      return {
        ...baseItem,
        status: "invalid",
        note: "解析失败，请检查文件内容、编码或工作表格式",
      };
    }
  }

  function createPendingFile(file: File): ImportFileItem {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const isAccepted = ACCEPTED_EXTENSIONS.has(extension);
    const isTooLarge = file.size > MAX_FILE_SIZE;

    if (!isAccepted) {
      return {
        id: getFileId(file),
        name: file.name,
        extension,
        sizeLabel: formatFileSize(file.size),
        status: "invalid",
        note: "不支持的文件类型，仅支持 Excel 或 CSV",
      };
    }

    if (isTooLarge) {
      return {
        id: getFileId(file),
        name: file.name,
        extension,
        sizeLabel: formatFileSize(file.size),
        status: "invalid",
        note: "文件超过 100MB，请拆分后重新导入",
      };
    }

    return {
      id: getFileId(file),
      name: file.name,
      extension,
      sizeLabel: formatFileSize(file.size),
      status: "parsing",
      note: "正在解析首个工作表和字段结构...",
    };
  }

  function mergeFiles(selectedFiles: File[]) {
    const existingIds = new Set(files.map((file) => file.id));
    const freshFiles = selectedFiles.filter((file) => !existingIds.has(getFileId(file)));

    if (freshFiles.length === 0) {
      return;
    }

    const pendingFiles = freshFiles.map(createPendingFile);
    onFilesChange((current) => [...current, ...pendingFiles]);

    void Promise.all(freshFiles.map(buildFileItem)).then((parsedFiles) => {
      const parsedMap = new Map(parsedFiles.map((file) => [file.id, file]));
      onFilesChange((current) => current.map((file) => parsedMap.get(file.id) ?? file));
    });
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length > 0) {
      mergeFiles(selectedFiles);
    }
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(event.dataTransfer.files ?? []);
    if (droppedFiles.length > 0) {
      mergeFiles(droppedFiles);
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  }

  function removeFile(id: string) {
    onFilesChange(files.filter((file) => file.id !== id));
  }

  function updateActiveSheet(fileId: string, sheetName: string) {
    onFilesChange((current) =>
      current.map((file) => {
        if (file.id !== fileId || !file.analysis || !file.analysis.sheets[sheetName]) {
          return file;
        }

        const nextAnalysis = {
          ...file.analysis,
          activeSheetName: sheetName,
        };
        const activeSheet = nextAnalysis.sheets[sheetName];

        return {
          ...file,
          analysis: nextAnalysis,
          note: `${activeSheet.sheetName} · ${activeSheet.rowCount} 行 · ${activeSheet.columnCount} 列`,
        };
      }),
    );
  }

  const importSummary =
    parsingFiles.length > 0
      ? `正在解析 ${parsingFiles.length} 个文件的首个工作表，马上会展示真实字段和异常提示。`
      : validFiles.length > 0
        ? `已完成 ${validFiles.length} 个文件的结构识别，下一步可以继续做空值检查、格式统一和字段映射。`
        : "把文件拖进来后，我会自动检查格式、识别金额列和日期列，并给出初始化建议。";

  const primaryAnalysis = primaryFile?.analysis;
  const primarySheet = primaryAnalysis ? primaryAnalysis.sheets[primaryAnalysis.activeSheetName] : undefined;
  const canContinue = validFiles.length > 0 && parsingFiles.length === 0;

  const analysisSummary =
    validFiles.length > 0
      ? `已识别 ${validFiles.length} 个文件，当前展示 ${primaryFile?.name ?? "最近文件"} 的字段结构。`
      : "导入后这里会展示字段识别结果、异常提示和下一步建议。";

  return (
    <section className="workspace-grid">
      <section className="chat-column">
        <div className="chat-thread">
          <Message role="assistant" avatar="F" label="导入助手" title="把文件拖进来，我先帮你识别结构">
            <p>{importSummary}</p>
          </Message>
          <Message role="user" avatar="你">
            <p>{validFiles.length > 0 ? "先帮我检查这些文件的字段质量，再决定后面的处理动作。" : "我准备导入费用明细和银行流水，先看看字段质量检查会怎么做。"}</p>
          </Message>
          <Message role="assistant" avatar="F" label="识别结果">
            {parsingFiles.length > 0 ? (
              <ul className="message-list">
                <li>正在读取工作表、抽取表头和样例值</li>
                <li>完成后会自动推断字段类型和空值占比</li>
                <li>如果发现日期格式混杂或空白表头，会直接提示</li>
              </ul>
            ) : validFiles.length > 0 ? (
              <ul className="message-list">
                <li>已完成 {validFiles.length} 个文件的结构识别，优先识别金额字段、日期字段和费用科目</li>
                <li>{primarySheet ? `${primarySheet.sheetName} 中共检测到 ${primarySheet.columnCount} 个字段、${primarySheet.rowCount} 行数据` : "已完成字段抽取和基础分析"}</li>
                <li>下一步建议做空值检查、日期格式统一和标准科目映射</li>
              </ul>
            ) : (
              <ul className="message-list">
                <li>支持 `.xlsx`、`.xls`、`.csv`</li>
                <li>单文件上限 100MB</li>
                <li>导入后会自动输出字段识别和异常提示</li>
              </ul>
            )}
          </Message>
        </div>
        <Composer
          value={
            validFiles.length > 0
              ? "导入完成后先帮我检查空值、格式异常和重复字段"
              : "先上传一个 Excel 或 CSV 文件开始"
          }
          actionLabel="继续处理"
          disabled={!canContinue}
          onAction={() => onJump("process")}
        />
      </section>

      <aside className="artifact-column">
        <ArtifactPanel eyebrow="上传区" title="导入 Excel / CSV">
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            multiple
            accept=".xlsx,.xls,.csv"
            onChange={handleInputChange}
          />
          <div
            className={`upload-zone${isDragging ? " drag-active" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="upload-icon">+</div>
            <h4>拖拽文件到这里</h4>
            <p>支持 `.xlsx`、`.xls`、`.csv`，可同时上传多份文件。</p>
            <div className="upload-actions">
              <button className="primary-button" onClick={() => inputRef.current?.click()}>
                选择文件
              </button>
              {files.length > 0 ? (
                <button className="ghost-button" onClick={() => onFilesChange([])}>
                  清空列表
                </button>
              ) : null}
            </div>
          </div>
          {files.length > 0 ? (
            <div className="stack-list">
              {files.map((file) => (
                <article key={file.id} className="list-item file-card">
                  <div className="file-card-header">
                    <div>
                      <strong>{file.name}</strong>
                      <small>{file.note}</small>
                    </div>
                    <span
                      className={`status-pill ${file.status === "ready" ? "ok" : file.status === "parsing" ? "parsing" : "error"}`}
                    >
                      {file.status === "ready" ? "已解析" : file.status === "parsing" ? "解析中" : "需处理"}
                    </span>
                  </div>
                  <div className="file-card-footer">
                    <span className="file-meta">{file.extension.toUpperCase() || "FILE"} · {file.sizeLabel}</span>
                    <button className="text-button" onClick={() => removeFile(file.id)}>
                      删除
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>还没有导入文件</strong>
              <p>先上传费用明细、银行流水或收入成本台账，Agent 才能继续做字段识别和数据处理。</p>
            </div>
          )}
        </ArtifactPanel>

        <ArtifactPanel
          eyebrow="字段识别"
          title={primaryFile ? `初始化检查 · ${primaryFile.name}` : "初始化检查"}
          aside={canContinue ? <span className="status-pill live">已准备</span> : parsingFiles.length > 0 ? <span className="status-pill parsing">解析中</span> : undefined}
        >
          {primarySheet ? (
            <>
              {primaryAnalysis && primaryAnalysis.sheetNames.length > 1 ? (
                <div className="sheet-selector">
                  <span className="selector-label">当前 Sheet</span>
                  <select
                    value={primaryAnalysis.activeSheetName}
                    onChange={(event) => updateActiveSheet(primaryFile?.id ?? "", event.target.value)}
                  >
                    {primaryAnalysis.sheetNames.map((sheetName) => (
                      <option key={sheetName} value={sheetName}>
                        {sheetName}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div className="analysis-summary">
                <article className="metric-card compact-card">
                  <span>工作表</span>
                  <strong>{primarySheet.sheetName}</strong>
                </article>
                <article className="metric-card compact-card">
                  <span>数据行数</span>
                  <strong>{primarySheet.rowCount}</strong>
                </article>
                <article className="metric-card compact-card">
                  <span>字段数</span>
                  <strong>{primarySheet.columnCount}</strong>
                </article>
              </div>
              <div className="field-list">
                {primarySheet.columns.slice(0, 8).map((column) => (
                  <div key={column.name} className="field-row detailed-field-row">
                    <div className="field-row-main">
                      <strong>{column.name}</strong>
                      <small>示例值：{column.sample}</small>
                    </div>
                    <div className="field-row-info">
                      <span className={`field-pill ${column.inferredType}`}>{getColumnTypeLabel(column.inferredType)}</span>
                      <small>空值 {Math.round(column.emptyRatio * 100)}%</small>
                    </div>
                  </div>
                ))}
              </div>
              <div className="notice-card">
                <strong>发现的问题</strong>
                {primarySheet.issues.length > 0 ? (
                  <ul className="message-list">
                    {primarySheet.issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="notice-text">暂未发现明显结构问题，可以继续进入数据处理阶段。</p>
                )}
              </div>
            </>
          ) : parsingFiles.length > 0 ? (
            <div className="empty-state">
              <strong>正在解析文件</strong>
              <p>{analysisSummary}</p>
            </div>
          ) : (
            <div className="empty-state">
              <strong>等待文件导入</strong>
              <p>{analysisSummary}</p>
            </div>
          )}
        </ArtifactPanel>

        <ArtifactPanel
          eyebrow="数据预览"
          title={primarySheet ? `${primarySheet.sheetName} · 前 ${primarySheet.previewRows.length} 行` : "数据预览"}
          className="wide-panel"
        >
          {primarySheet && primarySheet.headers.length > 0 ? (
            <div className="table-wrap preview-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    {primarySheet.headers.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {primarySheet.previewRows.length > 0 ? (
                    primarySheet.previewRows.map((row, rowIndex) => (
                      <tr key={`${primarySheet.sheetName}-${rowIndex}`}>
                        <td className="row-index">{rowIndex + 1}</td>
                        {primarySheet.headers.map((header, cellIndex) => (
                          <td key={`${header}-${rowIndex}-${cellIndex}`}>{row[cellIndex] || "-"}</td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={primarySheet.headers.length + 1} className="empty-table-cell">
                        当前 Sheet 暂无可预览的数据行
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <strong>等待预览数据</strong>
              <p>选择一个有效文件后，这里会展示当前 Sheet 的前 20 行数据。</p>
            </div>
          )}
        </ArtifactPanel>
      </aside>
    </section>
  );
}

function ProcessView({
  files,
  onJump,
  onResultChange,
}: {
  files: ImportFileItem[];
  onJump: (view: ViewId) => void;
  onResultChange: (snapshot: ProcessSnapshot | null) => void;
}) {
  const readyFiles = files.filter((file) => file.status === "ready" && file.analysis);
  const defaultFileId = readyFiles[0]?.id ?? "";
  const [selectedFileId, setSelectedFileId] = useState(defaultFileId);
  const selectedFile = readyFiles.find((file) => file.id === selectedFileId) ?? readyFiles[0];
  const sheetNames = selectedFile?.analysis?.sheetNames ?? [];
  const defaultSheetName = selectedFile?.analysis?.activeSheetName ?? sheetNames[0] ?? "";
  const [selectedSheetName, setSelectedSheetName] = useState(defaultSheetName);
  const selectedSheet = selectedFile?.analysis?.sheets[selectedSheetName] ?? selectedFile?.analysis?.sheets[defaultSheetName];
  const availableColumns = selectedSheet?.columns ?? [];
  const defaultGroupField = getDefaultGroupField(availableColumns);
  const defaultMetricField = getDefaultMetricField(availableColumns);
  const [groupField, setGroupField] = useState(defaultGroupField);
  const [metricField, setMetricField] = useState(defaultMetricField);
  const [aggregation, setAggregation] = useState<AggregationMethod>("sum");

  useEffect(() => {
    if (!selectedFileId && readyFiles[0]) {
      setSelectedFileId(readyFiles[0].id);
    }
  }, [readyFiles, selectedFileId]);

  useEffect(() => {
    if (selectedFile?.analysis) {
      const nextSheetName = selectedFile.analysis.sheets[selectedSheetName] ? selectedSheetName : selectedFile.analysis.activeSheetName;
      setSelectedSheetName(nextSheetName);
    }
  }, [selectedFile, selectedSheetName]);

  useEffect(() => {
    const nextGroupField = getDefaultGroupField(availableColumns);
    const nextMetricField = getDefaultMetricField(availableColumns);

    setGroupField((current) => (availableColumns.some((column) => column.name === current) ? current : nextGroupField));
    setMetricField((current) => (availableColumns.some((column) => column.name === current) ? current : nextMetricField));
  }, [selectedSheetName, selectedFileId, selectedSheet]);

  const result = selectedSheet ? aggregateSheetData(selectedSheet, groupField, metricField, aggregation) : null;
  const canProceed = Boolean(selectedSheet && groupField && metricField && result && result.rows.length > 0);

  useEffect(() => {
    if (!selectedFile || !selectedSheet || !groupField || !metricField || !result) {
      onResultChange(null);
      return;
    }

    onResultChange({
      fileName: selectedFile.name,
      sheetName: selectedSheet.sheetName,
      groupField,
      metricField,
      aggregation,
      result,
    });
  }, [aggregation, groupField, metricField, onResultChange, result, selectedFile, selectedSheet]);

  return (
    <section className="workspace-grid">
      <section className="chat-column">
        <div className="chat-thread">
          <Message role="assistant" avatar="F" label="数据处理 Agent" title="我已经把导入数据接到可配置汇总器里">
            <p>现在可以直接选文件、选 Sheet、选分组字段和指标字段，然后生成一个真实的财务汇总结果表。</p>
          </Message>
          <Message role="user" avatar="你">
            <p>{selectedSheet ? `继续，把 ${selectedSheet.sheetName} 里的明细处理成可以直接做月报的数据。` : "继续，把导入的数据处理成可以直接做月报的数据。"}</p>
          </Message>
          <Message role="assistant" avatar="F" label="处理中">
            {selectedSheet ? (
              <ul className="message-list">
                <li>当前数据源：{selectedFile?.name} / {selectedSheet.sheetName}</li>
                <li>建议按“{groupField || "分组字段"}”分组，并对“{metricField || "指标字段"}”做{getAggregationLabel(aggregation)}</li>
                <li>{result ? `已生成 ${result.rows.length} 行汇总结果，可直接进入分析页。` : "请先选择分组字段和指标字段。"} </li>
              </ul>
            ) : (
              <ul className="message-list">
                <li>先回到导入页上传至少一个有效文件</li>
                <li>导入完成后这里会自动提供可汇总字段</li>
              </ul>
            )}
          </Message>
        </div>
        <Composer
          value={
            canProceed
              ? `帮我按 ${groupField} 汇总 ${metricField}，并继续做分析`
              : "先导入文件并选择分组字段与指标字段"
          }
          actionLabel="查看分析"
          disabled={!canProceed}
          onAction={() => onJump("analysis")}
        />
      </section>

      <aside className="artifact-column">
        <ArtifactPanel eyebrow="汇总配置" title="当前处理链路">
          {selectedSheet ? (
            <div className="config-stack">
              <label className="config-field">
                <span>数据文件</span>
                <select value={selectedFile?.id ?? ""} onChange={(event) => setSelectedFileId(event.target.value)}>
                  {readyFiles.map((file) => (
                    <option key={file.id} value={file.id}>
                      {file.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="config-field">
                <span>工作表</span>
                <select value={selectedSheetName} onChange={(event) => setSelectedSheetName(event.target.value)}>
                  {sheetNames.map((sheetName) => (
                    <option key={sheetName} value={sheetName}>
                      {sheetName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="config-field">
                <span>分组字段</span>
                <select value={groupField} onChange={(event) => setGroupField(event.target.value)}>
                  {availableColumns.map((column) => (
                    <option key={column.name} value={column.name}>
                      {column.name} · {getColumnTypeLabel(column.inferredType)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="config-field">
                <span>指标字段</span>
                <select value={metricField} onChange={(event) => setMetricField(event.target.value)}>
                  {availableColumns.map((column) => (
                    <option key={column.name} value={column.name}>
                      {column.name} · {getColumnTypeLabel(column.inferredType)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="config-field">
                <span>汇总方式</span>
                <select value={aggregation} onChange={(event) => setAggregation(event.target.value as AggregationMethod)}>
                  <option value="sum">求和</option>
                  <option value="count">计数</option>
                  <option value="avg">平均值</option>
                </select>
              </label>

              <div className="summary-banner">
                <strong>处理建议</strong>
                <p>财务场景通常优先使用“分类字段 + 金额字段 + 求和”的组合，用来快速生成费用汇总和月报中间表。</p>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <strong>还没有可处理的数据</strong>
              <p>先在导入页上传并解析一个有效文件，这里才会出现真实可选字段。</p>
            </div>
          )}
        </ArtifactPanel>

        <ArtifactPanel
          eyebrow="结果预览"
          title={
            result
              ? `${groupField} × ${metricField} · ${getAggregationLabel(aggregation)}`
              : "汇总结果预览"
          }
          className="wide-panel"
        >
          {result ? (
            <>
              <div className="analysis-summary">
                <article className="metric-card compact-card">
                  <span>结果行数</span>
                  <strong>{result.rows.length}</strong>
                </article>
                <article className="metric-card compact-card">
                  <span>有效数值</span>
                  <strong>{result.numericCount}</strong>
                </article>
                <article className="metric-card compact-card">
                  <span>汇总结果</span>
                  <strong>{formatMetricValue(result.total)}</strong>
                </article>
              </div>
              <div className="table-wrap preview-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{groupField}</th>
                      <th>{getAggregationLabel(aggregation)} {metricField}</th>
                      <th>记录数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, index) => (
                      <tr key={`${row.group}-${index}`}>
                        <td className="row-index">{index + 1}</td>
                        <td>{row.group}</td>
                        <td>{formatMetricValue(row.value)}</td>
                        <td>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <strong>等待生成结果表</strong>
              <p>选择文件、Sheet、分组字段和指标字段后，这里会实时生成汇总结果。</p>
            </div>
          )}
        </ArtifactPanel>
      </aside>
    </section>
  );
}

function AnalysisView({
  onJump,
  snapshot,
}: {
  onJump: (view: ViewId) => void;
  snapshot: ProcessSnapshot | null;
}) {
  const rows = snapshot?.result.rows ?? [];
  const hasData = rows.length > 0;
  const topRows = rows.slice(0, 6);
  const maxValue = Math.max(...topRows.map((row) => row.value), 0);
  const topRow = rows[0];
  const secondRow = rows[1];
  const totalValue = snapshot?.result.total ?? 0;
  const topShare = totalValue > 0 && topRow ? (topRow.value / totalValue) * 100 : 0;
  const averageValue = rows.length > 0 ? totalValue / rows.length : 0;
  const summaryLines = hasData
    ? buildAnalysisSummary(snapshot)
    : [
        "先在处理页生成一份真实汇总结果，分析页才会基于该结果动态出图和出摘要。",
        "建议优先选择分类字段 + 金额字段 + 求和，这样更适合财务场景。",
      ];

  return (
    <section className="workspace-grid">
      <section className="chat-column">
        <div className="chat-thread">
          <Message
            role="assistant"
            avatar="F"
            label="分析 Agent"
            title={hasData ? "已经根据真实汇总结果生成图表和摘要" : "等待处理页生成真实汇总结果"}
          >
            <p>
              {hasData
                ? `我现在展示的是 ${snapshot?.fileName} / ${snapshot?.sheetName} 的 ${snapshot?.groupField} 汇总结果，可以直接拿来做财务快报。`
                : "分析页已经准备好了，但需要先在处理页生成真实汇总结果，才能动态输出指标、图表和文字摘要。"}
            </p>
          </Message>
          <Message role="user" avatar="你">
            <p>{hasData ? "请把主要结论用简洁的话列出来，方便后面做月报。" : "等处理页生成结果后，再帮我总结关键结论。"}</p>
          </Message>
          <Message role="assistant" avatar="F" label={hasData ? "自动摘要" : "等待数据"}>
            <ul className="message-list">
              {summaryLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Message>
        </div>
        <Composer
          value={hasData ? "继续生成管理层可阅读的摘要报告" : "先回处理页生成真实汇总结果"}
          actionLabel="准备导出"
          disabled={!hasData}
          onAction={() => onJump("export")}
        />
      </section>

      <aside className="artifact-column">
        <ArtifactPanel eyebrow="指标概览" title={hasData ? "实时汇总分析" : "分析结果"}>
          <div className="metric-grid metric-grid-compact">
            <article className="metric-card">
              <span>{snapshot ? `${getAggregationLabel(snapshot.aggregation)} ${snapshot.metricField}` : "汇总结果"}</span>
              <strong>{hasData ? formatMetricValue(totalValue) : "-"}</strong>
            </article>
            <article className="metric-card">
              <span>Top 分组</span>
              <strong>{topRow?.group ?? "-"}</strong>
            </article>
            <article className="metric-card">
              <span>Top 占比</span>
              <strong className={topShare >= 50 ? "danger-text" : ""}>{hasData ? `${topShare.toFixed(1)}%` : "-"}</strong>
            </article>
          </div>
        </ArtifactPanel>

        <ArtifactPanel
          eyebrow="图表结果"
          title={snapshot ? `${snapshot.groupField} 维度分布` : "结果图表"}
          className="wide-panel"
        >
          {hasData ? (
            <div className="bar-chart">
              {topRows.map((row) => (
                <div key={row.group} className="bar-row">
                  <div className="bar-row-head">
                    <span className="bar-label">{row.group}</span>
                    <strong>{formatMetricValue(row.value)}</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${maxValue > 0 ? (row.value / maxValue) * 100 : 0}%` }} />
                  </div>
                  <small>{row.count} 条记录</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>还没有图表数据</strong>
              <p>处理页生成汇总结果后，这里会自动绘制分组分布图。</p>
            </div>
          )}
        </ArtifactPanel>

        <ArtifactPanel eyebrow="摘要卡片" title="重点结论">
          {hasData ? (
            <div className="stack-list">
              <article className="stack-card">
                <strong>{topRow?.group ?? "Top 分组"}贡献最高</strong>
                <p>
                  {topRow
                    ? `当前 ${snapshot?.groupField} 中，${topRow.group} 的 ${snapshot?.metricField}${getAggregationLabel(snapshot?.aggregation ?? "sum")}结果最高，占整体 ${topShare.toFixed(1)}%。`
                    : "等待汇总结果。"}
                </p>
              </article>
              <article className="stack-card">
                <strong>整体分布{topShare >= 50 ? "偏集中" : "相对均衡"}</strong>
                <p>
                  {secondRow
                    ? `Top1 与 Top2 分组分别为 ${topRow?.group} 和 ${secondRow.group}，建议重点复核头部分类的明细构成。`
                    : "当前只有一个分组结果，建议继续检查原始明细。 "}
                </p>
              </article>
              <article className="stack-card">
                <strong>平均水平参考</strong>
                <p>
                  当前 {snapshot?.groupField} 维度的平均{getAggregationLabel(snapshot?.aggregation ?? "sum")}
                  {snapshot?.metricField} 为 {formatMetricValue(averageValue)}。
                </p>
              </article>
            </div>
          ) : (
            <div className="empty-state">
              <strong>等待生成摘要</strong>
              <p>等处理页生成真实汇总结果后，我会基于结果自动提炼重点结论。</p>
            </div>
          )}
        </ArtifactPanel>
      </aside>
    </section>
  );
}

function ExportView() {
  return (
    <section className="workspace-grid">
      <section className="chat-column">
        <div className="chat-thread">
          <Message role="assistant" avatar="F" label="导出 Agent" title="结果已经准备好了，可以直接交付给财务团队">
            <p>你可以导出结果表、分析图表和 PDF 报告，也可以把这套流程保存成模板，供下个月复用。</p>
          </Message>
          <Message role="user" avatar="你">
            <p>帮我导出成适合内部汇报的格式，金额和汇总行都要规范一点。</p>
          </Message>
          <Message role="assistant" avatar="F" label="导出建议">
            <ul className="message-list">
              <li>Excel：保留千分位、汇总行高亮、标准科目名称</li>
              <li>PNG：导出部门费用对比图与月度趋势图</li>
              <li>PDF：附带 3 条核心分析结论和异常记录摘要</li>
            </ul>
          </Message>
        </div>
        <Composer value="导出成 Excel + PDF，并保存这套流程为模板" actionLabel="导出" />
      </section>

      <aside className="artifact-column">
        <ArtifactPanel eyebrow="导出清单" title="选择要交付的内容">
          <div className="stack-list">
            <label className="check-row">
              <input type="checkbox" defaultChecked />
              <span>费用汇总表（Excel）</span>
            </label>
            <label className="check-row">
              <input type="checkbox" defaultChecked />
              <span>部门费用对比图（PNG）</span>
            </label>
            <label className="check-row">
              <input type="checkbox" defaultChecked />
              <span>分析摘要报告（PDF）</span>
            </label>
            <label className="check-row">
              <input type="checkbox" />
              <span>异常记录清单（Excel）</span>
            </label>
          </div>
        </ArtifactPanel>

        <ArtifactPanel eyebrow="导出预览" title="交付包说明">
          <div className="stack-list">
            <article className="stack-card">
              <strong>文件名</strong>
              <p>2026年4月费用分析_导出包.zip</p>
            </article>
            <article className="stack-card">
              <strong>内容摘要</strong>
              <p>2 个数据表 + 2 张图表 + 1 份管理摘要 PDF</p>
            </article>
            <article className="stack-card">
              <strong>输出规范</strong>
              <p>金额千分位、汇总行高亮、分析结论附在首页。</p>
            </article>
          </div>
        </ArtifactPanel>
      </aside>
    </section>
  );
}

export default App;

type AggregationMethod = "sum" | "count" | "avg";

type AggregatedRow = {
  group: string;
  value: number;
  count: number;
};

type AggregationResult = {
  rows: AggregatedRow[];
  total: number;
  numericCount: number;
};

type ProcessSnapshot = {
  fileName: string;
  sheetName: string;
  groupField: string;
  metricField: string;
  aggregation: AggregationMethod;
  result: AggregationResult;
};

function aggregateSheetData(
  sheet: SpreadsheetAnalysis["sheets"][string],
  groupField: string,
  metricField: string,
  aggregation: AggregationMethod,
) {
  if (!groupField || !metricField) {
    return null;
  }

  const groupIndex = sheet.headers.indexOf(groupField);
  const metricIndex = sheet.headers.indexOf(metricField);

  if (groupIndex === -1 || metricIndex === -1) {
    return null;
  }

  const groups = new Map<string, { sum: number; count: number }>();

  sheet.dataRows.forEach((row) => {
    const groupValue = row[groupIndex] || "未分类";
    const metricValue = parseNumericValue(row[metricIndex]);
    const current = groups.get(groupValue) ?? { sum: 0, count: 0 };

    if (aggregation === "count") {
      current.count += 1;
      current.sum += Number.isNaN(metricValue) ? 0 : metricValue;
    } else if (!Number.isNaN(metricValue)) {
      current.sum += metricValue;
      current.count += 1;
    }

    groups.set(groupValue, current);
  });

  const rows: AggregatedRow[] = Array.from(groups.entries())
    .map(([group, stats]) => ({
      group,
      value: aggregation === "avg" ? (stats.count > 0 ? stats.sum / stats.count : 0) : aggregation === "count" ? stats.count : stats.sum,
      count: stats.count,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 20);

  const total =
    aggregation === "avg"
      ? rows.reduce((sum, row) => sum + row.value, 0) / (rows.length || 1)
      : rows.reduce((sum, row) => sum + row.value, 0);

  const numericCount = rows.reduce((sum, row) => sum + row.count, 0);

  return {
    rows,
    total,
    numericCount,
  };
}

function buildAnalysisSummary(snapshot: ProcessSnapshot | null) {
  if (!snapshot || snapshot.result.rows.length === 0) {
    return [];
  }

  const rows = snapshot.result.rows;
  const topRow = rows[0];
  const secondRow = rows[1];
  const totalValue = snapshot.result.total;
  const topShare = totalValue > 0 ? (topRow.value / totalValue) * 100 : 0;
  const averageValue = totalValue / rows.length;

  return [
    `${snapshot.fileName} / ${snapshot.sheetName} 已按“${snapshot.groupField}”完成${getAggregationLabel(snapshot.aggregation)}分析。`,
    `${topRow.group} 当前排名第一，${snapshot.metricField}${getAggregationLabel(snapshot.aggregation)}结果为 ${formatMetricValue(topRow.value)}，占整体 ${topShare.toFixed(1)}%。`,
    secondRow
      ? `第二名为 ${secondRow.group}，与第一名相差 ${formatMetricValue(topRow.value - secondRow.value)}，建议优先关注头部分类。`
      : "当前只有一个有效分组，建议进一步检查原始数据的分类字段是否过于集中。",
    `${snapshot.groupField} 维度的平均${getAggregationLabel(snapshot.aggregation)} ${snapshot.metricField} 为 ${formatMetricValue(averageValue)}。`,
  ];
}

function getFileKindLabel(extension: string) {
  if (extension === "csv") {
    return "CSV 文件";
  }

  if (extension === "xls" || extension === "xlsx") {
    return "Excel 文件";
  }

  return "文件";
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function getColumnTypeLabel(type: ParsedColumnType) {
  if (type === "date") {
    return "日期";
  }

  if (type === "amount") {
    return "金额";
  }

  if (type === "category") {
    return "分类";
  }

  return "文本";
}

function getDefaultGroupField(columns: Array<{ name: string; inferredType: ParsedColumnType }>) {
  return columns.find((column) => column.inferredType === "category")?.name
    ?? columns.find((column) => column.inferredType === "date")?.name
    ?? columns[0]?.name
    ?? "";
}

function getDefaultMetricField(columns: Array<{ name: string; inferredType: ParsedColumnType }>) {
  return columns.find((column) => column.inferredType === "amount")?.name
    ?? columns.find((column) => column.inferredType === "text")?.name
    ?? columns[0]?.name
    ?? "";
}

function getAggregationLabel(aggregation: AggregationMethod) {
  if (aggregation === "count") {
    return "计数";
  }

  if (aggregation === "avg") {
    return "平均值";
  }

  return "求和";
}

function parseNumericValue(rawValue: string) {
  const normalized = rawValue.replace(/,/g, "").replace(/¥|\$/g, "").trim();
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? Number.NaN : parsed;
}

function formatMetricValue(value: number) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
