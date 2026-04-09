# Prototype Skeleton

这个目录不是完整原型，但已经不只是空骨架。

当前已经有一条最小可跑链路：

- `memory`
- `knowledge`
- `orchestrator`
- `console output`

## 目标

- 给外部协作者一个明确的起点
- 把第一阶段的代码边界提前分层
- 避免一上来把仓库写成无结构的实验场

## 当前目录

```text
prototype/
 .gitignore
 data/
    knowledge/
    memory/
 package.json
 tsconfig.json
 src/
    index.ts
    core/
    memory/
    knowledge/
    orchestrator/
    tools/
    shared/
```

## 每层职责

- `core/`: 系统启动、身份、基础配置
- `memory/`: 短期记忆、长期记忆、记忆更新策略
- `knowledge/`: 授权文档导入、索引、检索
- `orchestrator/`: 请求路由、工作流编排、是否查记忆/知识/工具
- `tools/`: 有边界的工具调用
- `shared/`: 通用类型、日志、错误结构

## 当前已接通的链路

当前入口文件会跑一条示例请求：

1. 读取基础配置
2. 从内置 `memory seed` 检索记忆
3. 从内置 `knowledge seed` 检索知识
4. 由 `orchestrator` 先判断该走 memory、knowledge 还是 hybrid
5. 在控制台输出一条最小响应

这不是最终产品逻辑，但足够让后续协作者从“结构讨论”进入“代码演进”。

## 当前本地数据来源

当前示例链路已经不只依赖代码里的 seed：

- `data/memory/memory.json`
- `data/knowledge/*.md`

其中：

- memory 会优先读取本地 `memory.json`
- knowledge 会扫描本地 markdown 或 text 文件，切成最小 chunk，并把结果缓存到本地索引
- orchestrator 会尝试把有意义的新 query 写回本地 memory
- 如果本地数据缺失，代码会回退到最小 seed 内容，保证链路可跑
- 当前 `data/knowledge/` 已同时包含英文与中文知识文档，便于做中英混合演示

## 如何开始

1. 进入 `prototype/`
2. 安装依赖：`npm install`
3. 启动最小 HTTP API：`npm run dev`
4. 如果只想看控制台示例链路：`npm run dev:console`
5. 再看：
   - `src/memory/store.ts`
   - `src/knowledge/store.ts`
   - `src/orchestrator/run.ts`
   - `src/server.ts`
6. 浏览器打开：`http://localhost:3010/`

## Demo Highlights

- 浏览器里直接提问，不需要先写 `curl`
- 页面会渲染统一响应里的 `summary / evidence / nextActions / route / knowledge / memory`
- 检索命中会保留 source 引用，方便判断答案是不是有依据
- knowledge 已经走最小索引缓存，文档没变化时不会每次重建
- 这个页面不是假数据面板，而是直接连本地 `POST /api/query`
- 当前首页已经改成中文演示页，更适合直接给别人试看

### 导入一份本地知识

可以直接导入文件：

```bash
npm run ingest:file -- --file ./data/knowledge/phase1-focus.md
```

也可以直接导入一段文本：

```bash
npm run ingest:file -- --title "Temporary Note" --text "Local-first memory should stay easy to inspect."
```

### 调用最小 HTTP API

启动后默认监听 `http://localhost:3010`。

浏览器页面：

```text
http://localhost:3010/
```

演示时建议优先展示这 3 个画面：

1. 首页 Hero + 输入区
2. 一次 query 返回后的 Summary / Evidence / Runtime Snapshot
3. 展开 Raw JSON，证明这不是静态假页面

如果你想做中文演示，推荐优先点这 3 个示例问题：

1. `第一阶段如果要坚持本地优先、长期记忆和可追踪来源，最应该先做什么？`
2. `在还没有接入向量数据库之前，检索层应该怎么做才合理？`
3. `记住我偏向本地部署这个前提，并告诉我下一步最重要的事情是什么。`

健康检查：

```bash
curl http://localhost:3010/health
```

查询接口：

```bash
curl -X POST http://localhost:3010/api/query \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"What should Phase 1 focus on for local-first memory?\"}"
```

## 当前状态

- 这是最小演进骨架，不代表功能已经完整
- 真正的 MVP 仍然以 `docs/FIRST_MVP.md` 为准
- 当前 memory 已支持本地 JSON 持久化读取
- 当前 knowledge 已支持本地 markdown / text 文档读取
- 当前 knowledge 已支持最小 chunk 切分与 chunk 级 source 引用
- 当前 knowledge 已支持最小索引缓存：文件未变化时直接复用 `data/knowledge/.index-cache.json`
- 当前 knowledge 已支持最小导入入口，可把本地文件或文本写入 `data/knowledge/`
- 当前 knowledge 已补入首批中文知识内容，覆盖阶段重点、检索设计、记忆原则
- 当前 memory 已支持最小写入与去重策略
- 当前 memory 会自动补齐结构化字段：`summary / category / priority / createdAt / updatedAt`
- 当前 orchestrator 已支持最小路由判断：`memory-first / knowledge-first / hybrid / fallback`
- 当前 orchestrator 已输出统一响应格式：`version / query / answer / route / memory / knowledge / system`
- 当前 prototype 已暴露最小 HTTP API：`GET /health` 与 `POST /api/query`
- 当前 prototype 已提供最小浏览器页面，可直接提交 query 并渲染统一响应
- 当前 prototype 已具备对外演示基础：浏览器页、API、统一响应、source 引用、可检查原始 JSON
- 当前 memory 已支持最小治理规则：
  - 重复内容只更新时间与访问次数
  - 相似内容会合并进旧记忆
  - 保留策略优先看 priority，其次看 updatedAt
  - 合并后的 aliases 会自动收敛
  - summary 会随着合并结果自动压缩更新
- 下一步最值得做的是：
  - 把 memory 从“最小治理规则”升级为更细的冲突处理与记忆分类提取
  - 把 knowledge 从“最小索引缓存”升级为更稳定的增量索引与排序机制
  - 把统一响应格式继续升级为可直接对接 API 或前端的 schema
