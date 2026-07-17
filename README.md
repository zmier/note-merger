# Note Merger

An Obsidian writing workflow toolkit for merging notes, capturing evidence, visualizing CriticMarkup, tracking writing stats, and speeding up everyday navigation.

当前版本：`1.4.0`  
最低 Obsidian 版本：`1.5.11`

## Overview

`Note Merger` 最初是一个“合并链接笔记”的插件，但现在已经扩展成一套围绕写作与研究整理的工具箱。它适合下面这些场景：

- 用 MOC 或大纲笔记把多个子文档一键组装成正文
- 阅读资料时把证据、摘录和注释快速归档到课题笔记
- 在 Obsidian 里直接可视化 CriticMarkup 审稿标记
- 在大改之前做快照备份，并和历史版本对比
- 基于 Rime 日志追踪写作节奏、速度和累计字数
- 优化 Obsidian 中的导航、表格导出和轻量应用嵌入

## Core Features

### 1. Merge linked notes

以当前笔记为入口，解析其中的 `[[wikilinks]]`，按出现顺序合并被链接的 Markdown 文件。

支持三种合并模式：

- `Clean`: 仅输出子文档内容
- `Append`: 保留当前文档，再将子文档追加到底部
- `Embed`: 在当前文档中把链接原位替换成对应正文

额外支持：

- 忽略被合并笔记顶部 YAML Frontmatter
- 自动为每个子文档生成包装标题，如 `## [[Source Note]]`
- 自动下调子文档内部标题层级，适配总纲结构
- 只合并以 `@` 开头的文献笔记
- 额外生成一个 `_sublists.md` 文件，列出本次参与合并的子文档链接

### 2. Evidence Mapper

在阅读或写作时选中文字，直接将其归档到目标课题笔记的指定标题下。

工作方式：

- 记住当前“目标文件 + 目标标题”上下文
- 首次使用或手动切换时，先选课题笔记，再选论点标题
- 自动为源文本补上 Block ID，保证回链稳定
- 单行摘录采用 `![[Source#^block]]` 的方式嵌入
- 多行摘录自动转成引用块，并附带跳回源文的链接
- 状态栏会显示当前捕获上下文，点击即可快速切换

### 3. Version snapshots and diff

为当前笔记创建带时间戳和备注的版本副本，并存入同目录下的 `[笔记名]-版本` 文件夹。

同时提供三个对比命令：

- 与最新版本对比
- 与指定历史版本对比
- 与库中任意 Markdown 文件对比

### 4. Lens Crafter

面向项目写作与文献整理的“透镜笔记”生成器。

它会根据当前上下文进行引导：

- 当你在 `02 Sources/Papers` 下工作时，先选项目
- 当你在 `03 Projects` 下工作时，先选文献
- 如果没有上下文，就走双选流程

生成结果：

- 目标路径：`03 Projects/<Project>/30 Literature Notes/`
- 文件名：`<Literature>_Lens.md`
- 模板结构：`Phenomenon / Mechanism / Significance`

### 5. CriticMarkup visualization

插件现在支持在 Obsidian 中可视化展示 CriticMarkup 审稿语法。

当前支持：

- `{++新增++}` addition
- `{--删除--}` deletion
- `{~~原文~>改文~~}` substitution
- `{==高亮==}` highlight
- `{>>批注<<}` comment

展示方式：

- 阅读视图中将原始语法渲染为语义化彩色标记
- Live Preview 中将标记折叠为可视化标签
- 点击 Live Preview 中的标记，可回到原始语法继续编辑
- 自动跳过代码块、行内代码、脚本和样式节点
- 提供一组可绑定热键的插入命令，用于快速生成或包裹 CriticMarkup 语法

视觉风格：

- 新增：柔和绿色
- 删除：柔和红色加删除线
- 替换：删除态与新增态并置
- 高亮：低饱和黄色
- 批注：低饱和紫色胶囊

### 6. Writer's Cockpit

读取 Rime 生成的 CSV 日志，构建一个独立的写作统计仪表盘。

当前统计包括：

- 今日总计
- 近 1 小时字数
- 近 5 天字数
- 近 30 天字数
- 年度累计
- 近 1 分钟即时速度
- 今日均速
- 今日峰值
- 今日活跃分钟数
- 过去 14 天速度趋势
- 今日分钟级节奏图
- 全年热力图

联动能力：

- 监听 Rime CSV 文件变动
- 自动将 `word_count` 和 `last_writes` 回写到 `00 Journal/YYYY-MM-DD.md` 的 Frontmatter

默认日志路径：

- `00 信息/工具/RIME/rime_log.csv`

### 7. ObHtml local app loader

插件为 `.obhtml` 文件注册了自定义视图，可把库内 HTML 文件作为轻量本地应用打开。

支持：

- 相对路径与 `../` 资源解析
- 本地 CSS 隔离注入
- 本地 JS 执行
- 本地图像资源重写
- 在脚本中访问 `app`、`container`、`MarkdownRenderer`
- 若已安装 Dataview，可直接使用 `dv`

这很适合在 Obsidian 里做项目看板、数据面板或实验性小工具。

### 8. Workflow extras

除了主功能外，插件还附带了一组日常增强工具：

- Markdown 表格光标内自动显示 `Copy to Excel` 悬浮按钮
- 点击文件浏览器中的已打开笔记时，自动复用已有标签页
- 在编辑器滚动条区域标记 `> [!T]`、`> [!Q]` 等 callout 位置
- 为选中内容批量升级或降级标题层级

## Commands

以下命令会出现在 Obsidian 命令面板中：

- `Create Project Lens Note (Context-Aware)`
- `Quick Capture Evidence (Context-Aware)`
- `Redirect Capture Evidence (Change Topic)`
- `CriticMarkup: Insert Addition`
- `CriticMarkup: Insert Deletion`
- `CriticMarkup: Insert Highlight`
- `CriticMarkup: Insert Comment`
- `CriticMarkup: Insert Substitution`
- `Merge Linked Notes`
- `Create Version (Snapshot)`
- `Compare with Latest Version`
- `Compare with Specific Version...`
- `Compare with Any File...`
- `Demote Headings in Selection`
- `Promote Headings in Selection`

此外，左侧功能区会出现一个 `bar-chart` 图标，用于打开 `Writer's Cockpit`。

## Settings

插件设置页当前包含以下主要选项：

### Merge settings

- `Output file suffix`
- `Merge Mode`
- `Ignore YAML Frontmatter`
- `Demote Content Headings`
- `Wrapper Heading Level`
- `Content separator`

### Writer's Cockpit

- `Rime Log CSV Path`

### UI enhancements

- `Enable Scrollbar Markers`
- `Smart Tab Reuse`

## Recommended workflows

### MOC to draft

1. 建一个 MOC 或大纲笔记
2. 用 `[[链接]]` 排好子文档顺序
3. 运行 `Merge Linked Notes`
4. 选择 `Clean`、`Append` 或 `Embed`
5. 在生成稿上继续写作或导出

### Reading to evidence note

1. 在源笔记中选中文字
2. 运行 `Quick Capture Evidence (Context-Aware)`
3. 选择课题笔记和目标标题
4. 输入简短注释
5. 插件自动把摘录归档到目标位置

### CriticMarkup review

1. 在文稿中使用标准 CriticMarkup 语法写审稿意见
2. 切到阅读视图查看可视化效果
3. 若需要继续改原始标记，在 Live Preview 中点击对应标签
4. 在 Obsidian 内直接完成审稿、返修与复核

### Project and literature linking

1. 打开项目笔记或文献笔记
2. 运行 `Create Project Lens Note (Context-Aware)`
3. 让插件自动建立对应的透镜笔记
4. 在 Lens 中填写案例、机制与意义

## Installation

### Manual install

将以下文件放入你的 vault 目录：

```text
.obsidian/plugins/note-merger/
```

至少需要：

- `main.js`
- `manifest.json`
- `styles.css`

然后在 Obsidian 中：

1. 打开 **Settings → Community plugins**
2. 启用 `Note Merger`

### From source

如果你正在本地开发这个插件：

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

## Development notes

- 入口文件：`main.ts`
- 主要源码目录：`src/`
- 构建工具：`esbuild`
- 语言：TypeScript
- UI 依赖：React、Ant Design、@ant-design/plots

主要模块分布：

- `src/merger.ts`
- `src/evidence/`
- `src/lens-crafter/`
- `src/writer-cockpit/`
- `src/obhtml-loader/`
- `src/table-tool/`
- `src/marker/`
- `src/tab-manager/`

## Privacy and behavior

这个插件默认在本地工作，不依赖在线服务。当前功能主要读写 Obsidian 库内文件与本地界面状态，不包含远程遥测逻辑。

## Archive

历史 README 已归档到：

- `归档/README_v20260324.md`

## License

MIT

## Author

`narra`
