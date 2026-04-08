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
- 当前检索层仍然是 seed data，不是持久化实现
- 如果要继续写代码，优先把 seed data 替换成真正的记忆层与知识导入层
