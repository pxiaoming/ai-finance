export type ViewId = "dashboard" | "import" | "process" | "analysis" | "export";

export const navItems: Array<{ id: ViewId; title: string; subtitle: string }> = [
  { id: "dashboard", title: "财务工作台", subtitle: "像对话一样开始一个任务" },
  { id: "import", title: "导入文件", subtitle: "上传 Excel 并自动识别字段" },
  { id: "process", title: "处理数据", subtitle: "清洗、匹配、汇总、生成新表" },
  { id: "analysis", title: "分析结果", subtitle: "图表、摘要、异常提醒" },
  { id: "export", title: "导出交付", subtitle: "Excel、PNG、PDF" },
];

export const recentThreads = [
  { title: "4月费用汇总 Agent", subtitle: "已生成 3 张结果表", active: true },
  { title: "银行流水对账助手", subtitle: "14 条差异待复核" },
  { title: "收入成本月报分析", subtitle: "已输出趋势图与摘要" },
];

export const templateTags = ["费用汇总", "流水对账", "毛利分析"];
