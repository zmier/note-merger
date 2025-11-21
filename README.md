
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
