# 项目设置指南

## 已完成的更新

### 1. ✅ SDK迁移
- **从**: `@ai-sdk/google` + `ai` (Vercel AI SDK)
- **到**: `@google/genai` (Google GenAI SDK GA版本)

### 2. ✅ 模型更新
- **模型**: `gemini-2.5-flash-lite-preview-09-2025`
- 这是最新的Gemini 2.5 Flash Lite Preview版本

### 3. ✅ 环境变量更新
- **旧变量**: `GOOGLE_GENERATIVE_AI_API_KEY`
- **新变量**: `GEMINI_API_KEY`
- 已创建 `.env.local` 文件模板

### 4. ✅ API调用方式更新
使用新的Google GenAI SDK调用方式：
```javascript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash-lite-preview-09-2025",
  contents: "your prompt here",
  config: {
    temperature: 0.7,
  },
});
```

## 本地开发设置

### 1. 配置API密钥

编辑 `.env.local` 文件：
```env
GEMINI_API_KEY=your_actual_api_key_here
```

获取API密钥：
1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 创建新的API密钥
3. 复制并粘贴到 `.env.local`

### 2. 安装依赖
```bash
npm install
```

### 3. 运行开发服务器
```bash
npm run dev
```

### 4. 构建验证
```bash
npm run build
```

## Vercel部署设置

### 1. 推送到GitHub
```bash
git add .
git commit -m "Update to Google GenAI SDK and Gemini 2.5 Flash Lite"
git push
```

### 2. Vercel环境变量配置

在Vercel项目设置中添加：
- **变量名**: `GEMINI_API_KEY`
- **值**: 你的Gemini API密钥

### 3. Vercel Postgres数据库

1. 在Vercel项目中创建Postgres数据库
2. 环境变量会自动注入（`POSTGRES_URL`等）

### 4. 部署

推送代码后Vercel会自动部署，或手动触发部署。

## 关键变更说明

### API响应格式
新SDK的响应格式略有不同：
- `response.text` - 获取文本内容
- `response.candidates` - 获取候选响应
- `response.usageMetadata` - 获取token使用情况

### 配置参数
新SDK使用 `config` 对象包裹所有配置：
```javascript
{
  model: "model-name",
  contents: "prompt",
  config: {
    temperature: 0.7,
    // 其他配置...
  }
}
```

### 缓存支持
Gemini 2.5模型支持隐式缓存（Implicit Caching）：
- 2.5 Flash: 最小1,024 tokens
- 2.5 Pro: 最小4,096 tokens
- 自动启用，无需额外配置

## 故障排查

### API密钥错误
**错误**: "API key not valid"
**解决**: 确认 `.env.local` 中的 `GEMINI_API_KEY` 设置正确

### 模型不可用
**错误**: "Model not found"
**解决**: 确认使用的是 `gemini-2.5-flash-lite-preview-09-2025`

### 构建错误
**错误**: TypeScript类型错误
**解决**: 运行 `npm install` 确保所有依赖正确安装

## 性能说明

### Gemini 2.5 Flash Lite特点
- ⚡ **超快响应**: 专为低延迟优化
- 💰 **成本友好**: 比标准版本更便宜
- 🎯 **适用场景**: 实时交互、频繁调用
- 📊 **Token限制**: 与标准版相同

### 隐式缓存优势
- 自动缓存重复的长上下文
- 降低成本（缓存命中时）
- 无需额外代码

## 文件更新列表

1. `package.json` - 更新依赖
2. `lib/ai.ts` - 完全重写AI调用逻辑
3. `.env.local` - 新建（环境变量文件）
4. `.env.example` - 更新环境变量名称
5. `README.md` - 更新文档说明

## 下一步

✅ 所有代码已更新并构建成功
✅ 环境变量配置已就绪
✅ 准备好本地测试和部署

现在可以：
1. 在 `.env.local` 中添加真实的API密钥
2. 运行 `npm run dev` 进行本地测试
3. 推送到GitHub并部署到Vercel

