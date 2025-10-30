# Dynamic Strategic Blueprint System

AI驱动的3D交互式战略导航工具，基于Gemini 2.0 Flash Lite构建。

## 技术栈

- **前端**: Next.js 15 (App Router) + React 19 + TypeScript
- **3D引擎**: React Three Fiber + Three.js + Drei
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **数据库**: Vercel Postgres + Drizzle ORM
- **AI**: Google GenAI SDK + Gemini 2.5 Flash Lite
- **部署**: Vercel

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件（或使用已有的 `.env` 文件）：

```env
# Gemini API Key
GEMINI_API_KEY=your_api_key_here

# Vercel Postgres (部署到Vercel时自动注入)
POSTGRES_URL=
```

### 3. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
```

## 项目结构

```
/app
  /api
    /init/route.ts          - 初始化蓝图API
    /calibrate/route.ts     - 位置校准API
    /cycle/route.ts         - 战略循环API
  page.tsx                  - 主页面
  layout.tsx                - 布局

/components
  /3d
    BlueprintScene.tsx      - 3D场景容器
    MainPath.tsx            - 主路径组件
    MilestoneNode.tsx       - 里程碑节点
    ProgressArrow.tsx       - 进度箭头
    ActionLines.tsx         - 行动支线
  /ui
    InitWizard.tsx          - 初始化向导
    CalibrationDialog.tsx   - 校准对话框
    NarrativePanel.tsx      - 叙事面板
    ActionHUD.tsx           - 行动控制面板
    InfoCard.tsx            - 信息卡片

/lib
  /db
    schema.ts               - 数据库Schema
    index.ts                - 数据库连接
  /store
    blueprintStore.ts       - Zustand状态管理
  /types
    index.ts                - TypeScript类型定义
  prompts.ts                - AI Prompt模板
  ai.ts                     - AI调用函数
  utils.ts                  - 工具函数
```

## 核心功能

### 1. 初始化流程
用户输入目标 → AI生成战略蓝图 → 3D可视化渲染

### 2. 校准流程
用户确认/纠正初始位置 → AI调整 → 生成首批行动选项

### 3. 战略循环
用户执行行动 → 记录观察 → AI评估进度 → 更新位置 → 生成新行动选项

## 数据库Schema

- **sessions**: 存储会话状态
- **blueprints**: 存储蓝图定义
- **action_cycles**: 存储每次战略循环记录

## 部署到Vercel

1. 推送代码到GitHub
2. 在Vercel中导入项目
3. 添加环境变量 `GEMINI_API_KEY`
4. 创建Vercel Postgres数据库
5. 部署

## 开发说明

- 代码维护以LLM Coding Agent的便捷性为考量
- 使用Gemini 2.5 Flash Lite Preview (09-2025)模型
- 使用最新的@google/genai SDK (Google GenAI SDK GA版本)
- 完整类型支持，利于AI理解和修改

## License

MIT

