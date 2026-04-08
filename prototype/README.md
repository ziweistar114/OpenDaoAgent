# Prototype Skeleton

这个目录不是完整原型，只是第一阶段可开工的最小骨架。

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

## 如何开始

1. 进入 `prototype/`
2. 安装依赖：`npm install`
3. 启动骨架：`npm run dev`
4. 先从 `src/index.ts` 和 `src/orchestrator/README.md` 开始拆第一条工作流

## 当前状态

- 这是结构骨架，不代表功能已经完成
- 真正的 MVP 仍然以 `docs/FIRST_MVP.md` 为准
- 如果要开始写代码，优先做记忆层、知识层和最小编排链路
