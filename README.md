
# Note Merger for Obsidian

A powerful plugin for Obsidian users who leverage the Map of Content (MOC) or Zettelkasten methodologies. It allows you to instantly compile all notes linked from an active file into a single, cohesive document. Consolidate scattered thoughts, compile research, or export your writing projects with a single command.

-----

## Features

  - **Merge from Wikilinks**: Intelligently parses the active note and finds all `[[wikilinks]]` to other markdown files.
  - **Automatic Title Generation**: Each merged note's content is automatically prefixed with a customizable heading that links back to the original source note (e.g., `## [[Source Note]]`).
  - **Highly Customizable Output**: Control the final document's structure through the settings panel:
      - Customize the output filename suffix (e.g., `_merged`, `-compiled`).
      - Choose the heading level (H1 to H6) for each merged section.
      - Define your own markdown separator (`---`, `***`, etc.).
  - **Unique Link Handling**: Automatically handles duplicate links, ensuring each note's content is included only once.
  - **Simple Workflow**: Activate the merge process with a single command from the Obsidian command palette.

## How to Use (Workflow)

1.  **Create your "Map"**: Open or create a central note (your MOC) that contains `[[wikilinks]]` to all the other notes you wish to combine. The order of the links in this file will determine the order of the content in the final merged document.
2.  **Run the Command**: While the MOC file is active, open the Command Palette (`Cmd+P` or `Ctrl+P`) and run the command **"Merge Linked Notes"**.
3.  **Find Your File**: A new file, named `[Your-MOC-Name]_merged.md` (or with your custom suffix), will be instantly created in the same folder, containing all the compiled content.

## Installation

### From Community Plugins (Coming Soon)

Once this plugin is accepted into the official community plugin store:

1.  Go to `Settings` -\> `Community plugins`.
2.  Make sure "Safe mode" is **off**.
3.  Click `Browse` community plugins.
4.  Search for "Note Merger".
5.  Click `Install`, then `Enable`.

### Manual Installation (For Now)

1.  Go to the [latest release](https://www.google.com/search?q=https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/releases/latest) on the GitHub repository.
2.  Download the three files: `main.js`, `manifest.json`, and `styles.css`.
3.  In your Obsidian vault, navigate to the `.obsidian/plugins/` directory.
4.  Create a new folder named `note-merger`.
5.  Copy and paste the three downloaded files into this new `note-merger` folder.
6.  Restart Obsidian or reload the app (`Cmd/Ctrl + R`).
7.  Go to `Settings` -\> `Community plugins` and enable "Note Merger".

## Configuration

Navigate to `Settings` -\> `Community plugins` -\> `Note Merger` to configure the following options:

  - **Output file suffix**: The text appended to the original filename to create the merged file. Defaults to `_merged`.
  - **Heading level**: The markdown heading level (`#` to `######`) used for the title of each merged note section. Defaults to `H2 (##)`.
  - **Content separator**: The markdown used to separate the content of one note from the next. Defaults to `---`.

## For Developers (Contributing)

This plugin is built with TypeScript and ❤️. If you'd like to contribute:

1.  Clone this repository.
2.  Run `npm install` to install dependencies.
3.  Run `npm run dev` to start compilation in watch mode.

## License

Released under the [MIT License](https://www.google.com/search?q=LICENSE).

## Author

Developed by **narra**.

-----

-----

# Note Merger for Obsidian (中文说明)

这是一款强大的 Obsidian 插件，专为使用“内容地图 (MOC)”或“卡片盒笔记法”的用户设计。它不仅能简单合并文档，还能像“组装工厂”一样，根据你的需求将分散的笔记组装成一篇完整的文章。

## 核心功能

- **三种灵活的合并模式**:
    
    - **纯净模式 (Clean)**: 生成的新文件仅包含被链接笔记的内容。
        
    - **追加模式 (Append)**: 保留当前 MOC 笔记的原文，并将被链接笔记的内容追加到底部。
        
    - **嵌入模式 (Embed)**: **[特色功能]** 生成的新文件中，原笔记内的 `[[双向链接]]` 会被**原位替换**为该笔记的实际正文内容。这使得你可以用 MOC 写大纲，然后一键生成长文。
        
- **证据收集 (Evidence Mapper - 新功能!)**:
    
    - **上下文感知收集**: 在阅读时选中文字，一键归档到指定的“课题笔记”和“标题”下，自动生成双向链接，极大提升研究效率。
        
    - **自动 Block-ID**: 自动为选中的源文本生成块引用 ID，确保引用精准稳定。
        
    - **智能格式化**: 自动识别多行文本，并将其格式化为引用块 (Blockquote)。
        
- **版本快照 (Version Control)**: 一键为当前笔记创建带时间戳的备份副本（如 `MyNote_V-251121_1430.md`），自动归档到专属的 `[笔记名]-版本` 文件夹中，让你的写作更有安全感。
    
- **智能内容处理**:
    
    - **过滤 YAML**: 可选是否移除被合并笔记顶部的 YAML 属性块 (Frontmatter)，保持文档整洁。
        
    - **标题自动降级**: 自动调整被合并内容的标题级别。例如，你可以设定被合并的内容从 H3 开始，插件会自动将原文档的 H1 降级为 H3，H2 降级为 H4，从而完美适配你的大纲层级。
        
- **标题管理命令**: 插件附带了两个实用的编辑器命令，可批量调整选中文字中的标题级别（一键升级或降级），写作时调整结构非常方便。
    
- **自动生成包装标题**: 每个合并区块前自动添加指向源笔记的标题，方便溯源。
    

## 如何使用

### 合并笔记

1. **创建你的“地图”**: 打开或创建一个核心笔记（MOC），在其中用 `[[双向链接]]` 的形式链接其他笔记。
    
2. **运行命令**: 打开命令面板 (`Cmd+P` 或 `Ctrl+P`)，搜索并运行 **"Merge Linked Notes"**。
    
3. **查看结果**: 插件会在当前目录下生成一个新的合并文档 (如 `笔记名_merged.md`)。
    

### 收集证据 (Evidence Mapper)

通过上下文感知的收集系统，在不打断阅读心流的情况下，将证据直接归档到你的课题笔记中。

1. **选中文字**: 在任意笔记中选中你想要收集的文本。
    
2. **极速收集**: 运行命令 **"Quick Capture Evidence (Context-Aware)"**。
    
    - **首次使用 (冷启动)**: 插件会提示你选择 **目标课题 (Target Topic)** 和 **目标论点 (Target Claim)**。
        
    - **后续使用 (热启动)**: 插件会记住当前的上下文。它将跳过选择步骤，直接提示你输入语境笔记。
        
3. **更改目标**: 如果需要保存到其他位置，运行 **"Redirect Capture Evidence"** 或点击底部的状态栏图标（如 `🎯 我的课题 > 导言`）。
    
4. **结果**: 选中的文本会自动生成块引用 ID，并在目标笔记的指定标题下生成一条带有跳转链接的引用。
    

### 创建版本快照 (后悔药)

在进行大改之前，快速备份你的工作：

1. 打开你正在编辑的笔记。
    
2. 运行命令 **"Create Version (Snapshot)"**。
    
3. 插件会在当前目录下自动创建一个名为 `[笔记名]-版本` 的文件夹（如果不存在），并在其中保存一份当前笔记的副本，文件名包含日期和时间。
    

### 调整标题 (辅助工具)

在任何文档的编辑模式下：

1. 选中包含标题的一段文本。
    
2. 运行 **"Demote Headings in Selection"**：选中区域内所有标题降一级 (增加一个 #)。
    
3. 运行 **"Promote Headings in Selection"**：选中区域内所有标题升一级 (减少一个 #)。
    

## 插件配置

进入 `设置` -> `第三方插件` -> `Note Merger`：

### 基础设置

- **输出文件后缀 (Output file suffix)**: 生成文件的后缀名 (默认 `_merged`)。
    
- **合并模式 (Merge Mode)**:
    
    - `Clean`: 仅包含合并后的子文档内容。
        
    - `Append`: 父文档内容 + 子文档内容。
        
    - `Embed`: 父文档内容，但其中的链接被子文档内容替换。
        
- **内容分隔符**: 笔记之间的分隔符 (仅在 Clean/Append 模式下有效)。
    

### 内容处理

- **忽略 YAML (Ignore YAML)**: 是否移除合并内容的元数据块。
    
- **内容标题降级 (Demote Content Headings)**: 设定被合并内容的**起始标题级别**。
    
    - _例如_: 设为 "Start at H3"，则子文档里的一级标题 (`#`) 会自动变成三级标题 (`###`)。
        
- **包装标题级别 (Wrapper Heading Level)**: 插件自动生成的、包裹每个子文档内容的标题级别 (如 `## [[子文档名]]`)。
## 安装方法

### 从社区插件市场安装 (即将上线)

一旦此插件被官方社区插件市场收录：

1.  进入 `设置` -\> `第三方插件`。
2.  确保“安全模式”已**关闭**。
3.  点击 `浏览` 社区插件。
4.  搜索 "Note Merger"。
5.  点击 `安装`，然后点击 `启用`。

### 手动安装 (当前)

1.  前往本项目的 GitHub 仓库，在 [Releases 页面](https://www.google.com/search?q=https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/releases/latest) 下载最新版本。
2.  下载三个文件: `main.js`, `manifest.json`, 和 `styles.css`。
3.  在你的 Obsidian 仓库中，找到并进入 `.obsidian/plugins/` 目录。
4.  在此目录下创建一个新文件夹，命名为 `note-merger`。
5.  将下载的三个文件复制并粘贴到这个新建的 `note-merger` 文件夹中。
6.  重启 Obsidian 或重载应用 (`Cmd/Ctrl + R`)。
7.  进入 `设置` -\> `第三方插件`，找到并启用 "Note Merger"。

## 插件配置

进入 `设置` -\> `第三方插件` -\> 点击 "Note Merger" 旁边的选项按钮，你可以配置以下选项：

  - **输出文件后缀 (Output file suffix)**: 添加到原文件名后，用于构成合并后文件名的文本。默认为 `_merged`。
  - **标题级别 (Heading level)**: 用于每个被合并笔记区块标题的 Markdown 标题级别 (`#` 到 `######`)。默认为 `H2 (##)`。
  - **内容分隔符 (Content separator)**: 用于分隔不同笔记内容的 Markdown 文本。默认为 `---`。

## 开发者 (贡献代码)

本插件使用 TypeScript 和 ❤️ 构建。如果你希望贡献代码：

1.  克隆本仓库。
2.  运行 `npm install` 安装依赖。
3.  运行 `npm run dev` 以观察模式启动实时编译。

## 许可证

本项目基于 [MIT 许可证](https://www.google.com/search?q=LICENSE) 发布。

## 作者

由 **miyuer** 开发。


# J-251229-版本升级文档

# Note Merger 版本更新记录

**当前版本**: v1.1.0  
**代号**: Writer's Cockpit (写手驾驶舱)  
**发布时间**: 2025-12-29

---

## 🚀 [v1.1.0] - 重大更新：写手驾驶舱上线

本次更新标志着 Note Merger 从单一的“笔记整理工具”进化为全方位的**“写作生产力系统”**。我们引入了全新的 **Writer's Cockpit (写手驾驶舱)** 模块，配合 Rime 输入法后端，实现了毫秒级的码字数据统计与可视化分析。

### ✨ 新增功能 (New Features)

#### 1. 📊 Writer's Cockpit (写手驾驶舱)
新增基于 **React 18** + **Ant Design 5.x** + **G2Plot** 构建的独立数据看板：
* **多维核心指标**:
    * **⚡️ 即时速度**: 实时计算最近 1 分钟的打字速度（滑动窗口算法），即时反馈心流状态。
    * **🚀 今日峰值**: 记录当天的最高手速（字/分），并在即时速度突破历史记录时自动修正。
    * **⏳ 活跃时长**: 精确统计今日产生过打字的非重复分钟数。
    * **📈 累计统计**: 包含今日总计、近1小时、近5天及年度总字数。
* **专业可视化图表**:
    * **速度趋势图 (双折线)**: 对比展示过去 14 天的“平均速度”与“峰值速度”走势。
    * **今日节奏图 (分钟级柱状)**: 复盘今日写作节奏，支持横向滚动查看每一分钟的产出。
    * **年度贡献图 (GitHub Style)**: 热力图直观展示全年打卡记录，Tooltip 支持显示具体日期。

#### 2. 🔄 每日日记自动同步 (Daily Note Sync)
* 插件后台实现 `FileSystemWatcher`，监听 Rime CSV 日志变化。
* 打字时自动更新今日日记的 YAML (Frontmatter)，新增字段：
    * `word_count`: 今日总字数
    * `last_writes`: 最后一次打字时间戳
* *注：若今日日记不存在，系统将静默跳过，不会报错。*

#### 3. ⚙️ 动态配置
* 设置页新增 **"Writer Cockpit"** 区域。
* 支持自定义 **Rime Log CSV Path**（默认为 `00 信息/工具/RIME/rime_log.csv`）。
* 修改路径配置后，Service 实例会自动热更新，无需重启插件。

### 🛠️ 技术改进 (Technical Improvements)
* **架构解耦**: 采用 DDD (领域驱动设计) 思想，将统计逻辑封装在 `StatsService` 中，UI 层 (`DashboardView`) 只负责渲染。
* **构建升级**: `esbuild` 配置升级支持 `.tsx` 编译；项目 TypeScript 升级至最新版。
* **类型修复**:
    * 修复了 Obsidian 插件中 `moment` 命名空间调用的类型报错。
    * 修复了 Ant Design `Divider` 组件 `orientation` 属性的类型兼容性问题。
* **生产环境优化**: 移除了 SourceMap，减小了插件体积。

---

## 📝 升级指南

1. **安装插件**: 替换最新的 `main.js`, `manifest.json`, `styles.css`。
2. **配置 Rime**: 确保您的 Rime 输入法已挂载 `stats.lua` 脚本，且日志输出路径与插件设置中的路径一致。

---

# Peer Review Guide: Writer's Cockpit Feature

## 📌 变更概述 (Overview)
本 PR 引入了名为 **Writer's Cockpit** 的子模块。这是一个集成了数据监听、统计计算和 React UI 可视化的完整功能闭环。
主要目的是通过读取 Rime 输入法生成的 CSV 日志，在 Obsidian 内展示写作数据并同步到 Daily Note。

## 🏗️ 架构变动
* **`src/writer-cockpit/`**: 新增目录，包含所有相关代码。
    * `services/StatsService.ts`: 核心业务逻辑，负责解析 CSV、计算分钟级指标、写 YAML。
    * `views/DashboardView.tsx`: 前端视图，使用 React + AntD + G2Plot。
    * `types.ts`: 类型定义。
* **`esbuild.config.mjs`**: 修改为支持 `.tsx` 编译。
* **`package.json`**: 升级 `typescript` 依赖，新增 `react`, `antd`, `@ant-design/plots` 等依赖。

## 🧪 测试环境准备 (Prerequisites)

由于本功能依赖外部 CSV 文件，请 Reviewer 按以下步骤准备环境：

1. **模拟数据源**:
   在你的 Obsidian 仓库根目录下，创建一个测试用的 CSV 文件（路径：`00 信息/工具/RIME/rime_log.csv`），并填入以下模拟数据：
   ```csv
   2025-12-28 10:00:01, 50
   2025-12-28 10:00:30, 30
   2025-12-28 10:01:05, 100
   2025-12-29 09:00:00, 20
   ```

构建项目:

Bash

npm install
npm run build

🔍 重点审查项 (Checklist)
1. 功能验收
[ ] 仪表盘渲染: 打开左侧侧边栏的“图表”图标，确认 React 视图能正确加载，无白屏。
[ ] 图表交互:

确认折线图 Tooltip 能显示单位（"xx 字/分"）。

确认分钟级柱状图在数据较多时会出现横向滚动条。

确认热力图 Tooltip 显示具体日期。

[ ] 数据联动:

手动修改上述 CSV 文件（增加一行），保存文件。

观察仪表盘数字是否在 5 秒内自动刷新。

观察“今日日记”的 Frontmatter 是否新增了 word_count 字段。

2. 代码质量
[ ] TypeScript 类型: 检查 src/writer-cockpit/types.ts 定义是否清晰。
[ ] React Hooks: 检查 DashboardView.tsx 中的 useEffect 依赖项是否正确，定时器是否正确清除 (clearInterval)。
[ ] 异常处理: 检查 StatsService 在 CSV 文件不存在或格式错误时，是否做到静默失败而不崩溃插件。

3. 已知 Hack / 妥协
TS 类型断言: 在 DashboardView.tsx 中，AntD 的 Divider 组件使用了 orientation={"left" as any}。这是由于 AntD 类型定义与新版 TS 的推断冲突导致的，暂时采用 any 绕过编译报错，不影响运行。

🚀 部署建议
此版本包含较大的 node_modules 变动（引入了 React 全家桶），生成的 main.js 体积会有所增加。建议在 Release 时使用 npm run build 进行生产环境压缩。
