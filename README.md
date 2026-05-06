# AI Finance

面向财务人员的 Excel 数据处理与分析前端 MVP。

当前版本采用 `React + Vite + TypeScript` 实现，产品形态是一个偏 Agent 风格的财务数据工作台，覆盖从文件导入、字段识别、Sheet 预览、汇总处理到分析展示的首版主链路。

## 功能现状

当前已实现：

- 导入页
  - 支持上传 `.xlsx`、`.xls`、`.csv`
  - 支持拖拽上传和文件列表管理
  - 支持文件类型与大小校验
  - 支持解析工作簿、切换 `Sheet`
  - 支持字段识别、空值占比提示、结构问题提示
  - 支持前 20 行数据预览

- 处理页
  - 支持选择文件和 `Sheet`
  - 支持选择分组字段、指标字段、汇总方式
  - 支持实时生成汇总结果表
  - 支持 `求和 / 计数 / 平均值`

- 分析页
  - 基于处理页的真实汇总结果生成分析视图
  - 展示指标卡、分组分布图、自动摘要结论

- 整体体验
  - 左侧会话导航 + 右侧 Agent 工作区
  - 财务场景导向的交互与文案

## 技术栈

- React 18
- Vite 5
- TypeScript
- `xlsx` 用于本地解析 Excel / CSV

## 本地运行

```bash
npm install
npm run dev
```

默认开发地址：

```bash
http://127.0.0.1:4173/
```

生产构建：

```bash
npm run build
```

## 项目结构

```text
.
├── index.html
├── package.json
├── src
│   ├── App.tsx
│   ├── components.tsx
│   ├── data.ts
│   ├── importParser.ts
│   ├── main.tsx
│   └── styles.css
├── tsconfig.json
└── vite.config.ts
```

核心文件说明：

- `src/App.tsx`
  页面主入口，包含导入、处理、分析、导出几个主视图，以及页面之间的数据流转

- `src/importParser.ts`
  本地表格解析逻辑，负责读取工作簿、分析表头、推断字段类型、生成预览数据

- `src/components.tsx`
  通用 UI 组件，如消息卡片、侧边栏区块、工作区面板、输入区等

- `src/styles.css`
  整体视觉样式，当前采用深色 Agent 风格布局

## 当前限制

- 目前所有解析和计算都在前端本地完成
- 处理页暂时只支持单字段分组汇总
- 分析页当前基于汇总结果做轻量图表和摘要，不包含复杂 BI 能力
- 导出页还未接入真实结果导出
- `xlsx` 已接入前端，当前打包体积偏大，后续建议做拆包或 worker 化

## 下一步建议

建议优先按下面顺序继续推进：

1. 导出页接入真实结果，完成 Excel / PDF / 图表导出闭环
2. 处理页支持多字段汇总、筛选、排序和字段映射
3. 分析页补充更多图表类型与可配置指标
4. 引入后端接口，逐步承接大文件处理与任务型计算
5. 增加模板中心和财务场景预设流程

## Git

当前默认分支：

```bash
main
```

已关联远程仓库：

```bash
origin https://github.com/pxiaoming/ai-finance.git
```
