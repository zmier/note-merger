
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

这是一款强大的 Obsidian 插件，专为使用“内容地图 (MOC)”或“卡片盒笔记法 (Zettelkasten)”的用户设计。它允许你通过一条命令，将当前笔记中链接的所有其他笔记内容，瞬间合并成一个完整、连贯的文档。无论是整合零散的思绪、汇编研究资料，还是导出你的写作项目，都轻而易举。

-----

## 核心功能

  - **从双向链接合并**: 智能解析当前笔记，并找出其中所有的 `[[双向链接]]`。
  - **自动生成标题**: 每个被合并笔记的内容前，都会自动添加一个可自定义级别的标题，该标题本身就是一个指回源笔记的反向链接（例如 `## [[源笔记]]`）。
  - **高度可定制化输出**: 通过设置面板，完全掌控最终文档的结构：
      - 自定义输出文件的后缀名 (例如 `_merged`, `-汇总`)。
      - 为每个合并区块选择标题级别 (H1 到 H6)。
      - 定义你自己的 Markdown 内容分隔符 (`---`, `***` 等)。
  - **自动处理重复链接**: 插件会自动处理重复的链接，确保每个笔记的内容只被包含一次。
  - **极简工作流**: 只需从命令面板激活一条命令，即可启动整个合并过程。

## 如何使用

1.  **创建你的“地图”**: 打开或创建一个核心笔记（你的 MOC），在其中用 `[[双向链接]]` 的形式，链接到所有你希望合并的笔记。链接的顺序将决定最终合并文档中的内容顺序。
2.  **运行命令**: 确保你的 MOC 笔记是当前正在编辑的文件，然后打开命令面板 (`Cmd+P` 或 `Ctrl+P`)，搜索并运行 **"Merge Linked Notes"** 命令。
3.  **找到你的文件**: 一个名为 `[你的MOC笔记名]_merged.md`（或使用你自定义的后缀）的新文件将立刻在同一个文件夹内被创建，其中包含了所有汇编好的内容。

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
