# OpenDaoAgent

一个面向长期记忆、长期存在、跨端连续性的开放智能体底座。

英文入口：[README.md](./README.md)

## 一句话说明

`OpenDaoAgent` 想做的，不是一次性回答问题的聊天工具，而是一个可以长期存在、长期记忆、长期服务的开放智能体底座。

它当前不是终极形态，也不是空想叙事；它首先要成为一个真正能跑、能被别人看懂、能持续迭代的开源起点。

## 现在已经有什么

仓库现在已经不只是文档草稿，`prototype/` 里已经有一条真实可跑的最小演示链路：

- 浏览器演示页：可直接在本地网页提问
- HTTP API：`GET /health`、`POST /api/query`
- 本地记忆层：会保存有意义的 query，并参与后续检索
- 本地知识层：从 markdown / text 文档切块检索
- 统一响应结构：`summary / evidence / nextActions / route / memory / knowledge / system`
- source 引用与原始 JSON：可以检查回答到底有没有依据

## 先看什么

如果你第一次打开这个项目，建议按这个顺序看：

1. [prototype/README.md](./prototype/README.md)
2. [第一阶段 MVP](./docs/FIRST_MVP.md)
3. [架构草图](./docs/ARCHITECTURE.md)
4. [路线图](./ROADMAP.md)
5. [项目宣言](./MANIFESTO.md)

## 本地快速体验

```bash
cd prototype
npm install
npm run dev
```

然后打开：

```text
http://localhost:3010/
```

## 这个项目想解决什么

今天大多数 AI 系统仍然停留在“会话型工具”层面：

- 会回答，但不会真正留下来
- 会执行，但不会持续成长
- 会配合，但不会长期记住你和你的环境

`OpenDaoAgent` 想尝试另一条路线：

- 让智能体具备长期记忆
- 让智能体具备跨设备连续性
- 让智能体在授权边界内持续学习
- 让智能体成为长期服务系统，而不是一次性响应系统

## 第一阶段目标

第一阶段不追求“全人类通用数字生命”的终极形态，只验证最核心的底座能力能不能站住：

- 本地优先部署
- 长期记忆
- 授权知识接入
- 安全边界
- 可审计行为
- 跨设备连续性设计

当前重点验证 6 件事：

1. 本地部署是否足够稳定
2. 长期记忆层如何设计
3. 授权知识如何持续接入
4. 工具调用如何保持安全和可审计
5. 多设备连续性怎么落地
6. 这个方向是否值得吸引更多技术同路人加入

## 这个项目不是什么

这个项目当前不是：

- 一个宗教项目
- 一个玄学包装的空想工程
- 一个无限制自动化代理
- 一个监控用户的系统
- 一个已经成熟可商用的 AGI 平台
- 一个替代人类判断的终极决策机器

## 我们希望谁加入

当前更适合加入的，是愿意一起把基础打牢的人：

- Agent / LLM 应用工程师
- 记忆系统 / RAG / 知识库方向工程师
- 后端 / 本地部署 / Docker / Linux 方向工程师
- 前端原型 / 产品交互设计师
- 开源协作与社区维护者

如果你对以下问题有兴趣，也欢迎参与：

- 长期记忆如何设计
- 智能体如何跨设备连续存在
- 本地优先与云端同步怎么平衡
- 行为可审计与权限最小化如何实现
- 如何避免项目从“长期主义”滑向“空想主义”

## 发起原则

这个项目当前坚持 5 条原则：

1. 先做出来，再往远处谈
2. 先做最小原型，不先做终极神话
3. 先吸引技术同路人，再谈更大叙事
4. 先验证长期记忆与连续性，再谈全局智能
5. 所有能力必须在合规、可控、可审计边界内推进

## 继续深入

- [项目宣言](./MANIFESTO.md)
- [路线图](./ROADMAP.md)
- [第一阶段 MVP](./docs/FIRST_MVP.md)
- [架构草图](./docs/ARCHITECTURE.md)
- [贡献说明](./CONTRIBUTING.md)
- [社区协作说明](./docs/COMMUNITY_GUIDE.md)
- [首批 issue 建议](./docs/FIRST_ISSUES.md)
- [GitHub 首发招募文案](./docs/GITHUB_LAUNCH_POST.md)

## 当前仓库建议结构

```text
OpenDaoAgent/
├─ README.md
├─ README_EN.md
├─ MANIFESTO.md
├─ ROADMAP.md
├─ CONTRIBUTING.md
├─ .github/
│  ├─ ISSUE_TEMPLATE/
│  └─ PULL_REQUEST_TEMPLATE.md
├─ prototype/
│  ├─ README.md
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ src/
└─ docs/
   ├─ ARCHITECTURE.md
   ├─ COMMUNITY_GUIDE.md
   ├─ FIRST_ISSUES.md
   ├─ FIRST_MVP.md
   ├─ GITHUB_LAUNCH_POST.md
   └─ LICENSE_DECISION.md
```

## 发布前建议

如果你准备把本仓库公开到 GitHub，建议在首发前确认：

- 项目名是否最终确定
- 许可证是否已选择
- 是否已经放入最小可运行原型
- 是否准备好了首批 issue 列表
- 是否准备好了第一版招募文案

招募文案草稿见：

- [GitHub 首发招募文案](./docs/GITHUB_LAUNCH_POST.md)
- [许可证选择建议](./docs/LICENSE_DECISION.md)
- [社区协作说明](./docs/COMMUNITY_GUIDE.md)
- [首批 issue 建议](./docs/FIRST_ISSUES.md)

最小原型骨架见：

- [prototype/README.md](./prototype/README.md)

## 当前状态

当前状态：发起阶段 / 文档 + 最小可运行原型。

下一步最重要的事，不是继续放大愿景，而是继续把基础做扎实：

- 把原型继续做深，而不只是做表面演示
- 明确模块边界和演进顺序
- 建立第一批可执行 issue
- 吸引第一批真正愿意动手的技术同路人

如果你愿意一起把这件事从“概念”推进成“基础设施雏形”，欢迎加入。
