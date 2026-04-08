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
4. 交给 `orchestrator` 汇总结果
5. 在控制台输出一条最小响应

这不是最终产品逻辑，但足够让后续协作者从“结构讨论”进入“代码演进”。

## 当前本地数据来源

当前示例链路已经不只依赖代码里的 seed：

- `data/memory/memory.json`
- `data/knowledge/*.md`

其中：

- memory 会优先读取本地 `memory.json`
- knowledge 会扫描本地 markdown 或 text 文件
- orchestrator 会尝试把有意义的新 query 写回本地 memory
- 如果本地数据缺失，代码会回退到最小 seed 内容，保证链路可跑

## 如何开始

1. 进入 `prototype/`
2. 安装依赖：`npm install`
3. 启动示例链路：`npm run dev`
4. 先看 `src/index.ts`
5. 再看：
   - `src/memory/store.ts`
   - `src/knowledge/store.ts`
   - `src/orchestrator/run.ts`

## 当前状态

- 这是最小演进骨架，不代表功能已经完整
- 真正的 MVP 仍然以 `docs/FIRST_MVP.md` 为准
- 当前 memory 已支持本地 JSON 持久化读取
- 当前 knowledge 已支持本地 markdown / text 文档读取
- 当前 memory 已支持最小写入与去重策略
- 当前 memory 会自动补齐结构化字段：`summary / category / priority / createdAt / updatedAt`
- 下一步最值得做的是：
  - 把 memory 从“自动结构化”升级为更细的记忆提取、覆盖和压缩策略
  - 把 knowledge 从“全量扫描”升级为更稳定的索引与检索机制
