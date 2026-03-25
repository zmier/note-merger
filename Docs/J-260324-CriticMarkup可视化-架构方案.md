# CriticMarkup 可视化架构方案

## 1. 总体设计

本功能采用“单一解析器 + 双渲染层”的结构：

1. `parser`
   负责把原始文本解析为 CriticMarkup token。
2. `DOM renderer`
   负责在阅读视图中将 token 转为语义化 DOM。
3. `CodeMirror extension`
   负责在 Live Preview 中将 token 替换为可视化 widget。

这样做的好处是：

- 语法识别逻辑只有一份
- 阅读视图和编辑视图样式统一
- 后续要做导出、过滤视图、接受修改时都能复用 token 层

## 2. 模块划分

建议新增目录：

```text
src/criticmarkup/
  parser.ts
  renderer.ts
  editor-extension.ts
  CriticMarkupManager.ts
```

### `parser.ts`

职责：

- 识别五种 CriticMarkup 语法
- 输出 token 列表
- 输出“文本片段 + token 片段”的混合结果，供 DOM 渲染使用

### `renderer.ts`

职责：

- 将 token 转为 DOM 元素
- 在阅读视图容器中遍历文本节点
- 跳过 `code / pre / textarea / script / style`
- 用渲染后的 fragment 替换原始文本节点

### `editor-extension.ts`

职责：

- 注册 CodeMirror `ViewPlugin`
- 在 Live Preview 模式下，将 token 区间替换为 `WidgetType`
- 点击 widget 时，选中其底层原始语法，方便继续编辑

### `CriticMarkupManager.ts`

职责：

- 统一注册 `MarkdownPostProcessor`
- 统一注册 Editor Extension
- 作为插件入口与 CriticMarkup 模块之间的桥梁

## 3. 解析策略

本期采用轻量线性扫描，而不是完整语法树。

原因：

- CriticMarkup 语法规则短小、边界明确
- 当前需求是可视化，而不是复杂语法校验
- 线性扫描足以支持 90% 以上的团队使用场景

识别顺序：

- `{++ ++}`
- `{-- --}`
- `{~~ ~> ~~}`
- `{== ==}`
- `{>> <<}`

若遇到不完整标记，则按普通文本保留，不报错。

## 4. 阅读视图渲染流

流程：

1. Obsidian 完成 Markdown 到 HTML 的基础渲染
2. `registerMarkdownPostProcessor` 接收容器节点
3. 遍历其中的文本节点
4. 若文本节点包含 CriticMarkup，则拆解为 `text part / token part`
5. 将 token part 替换为带语义 class 的 DOM 元素

优点：

- 与 Obsidian 原生 Markdown 渲染兼容
- 不需要接管 Markdown 解析器
- 对现有文档无侵入

## 5. Live Preview 渲染流

流程：

1. CodeMirror 文档文本被读取
2. 解析器提取 token 的起止位置
3. 若当前不是 Live Preview，则不做任何替换
4. 若 token 未与当前选区相交，则以 `Decoration.replace` 替换为 widget
5. 点击 widget 时，将底层原始文本选中并显示出来

这样可以兼顾：

- 平时阅读时的干净视觉
- 需要修改时仍能回到原始语法

## 6. 样式系统

样式集中放在插件根目录 `styles.css`。

采用命名：

- `.note-merger-critic-*`

主要样式单元：

- `.note-merger-critic-addition`
- `.note-merger-critic-deletion`
- `.note-merger-critic-highlight`
- `.note-merger-critic-comment`
- `.note-merger-critic-substitution`
- `.note-merger-critic-widget`

视觉策略：

- 统一圆角
- 统一低饱和背景
- 统一轻边框
- 删除类保留删除线
- 替换类拆分为旧文本与新文本两个子块

## 7. 风险与边界

### 7.1 复杂嵌套

例如嵌套使用高亮、批注、替换的极端写法，本期不做完整支持。

策略：

- 优先保证常见写法稳定
- 对无法识别的结构保持原样

### 7.2 大文档性能

阅读视图需要遍历文本节点，Live Preview 需要扫描文档内容。

当前控制方式：

- 阅读视图仅在渲染后处理一次
- Live Preview 仅在文档变化、选区变化、视口变化后重算

如果未来遇到超长文档性能问题，可优化为“仅扫描可视区”。

### 7.3 交互可编辑性

若直接把 CriticMarkup 在编辑器中永久替换成 widget，用户会失去编辑入口。

解决策略：

- token 与选区相交时，不替换
- 点击 widget 时，自动选中原始文本

## 8. 集成方式

在 `main.ts` 中新增 CriticMarkup Manager 初始化：

1. 引入 `CriticMarkupManager`
2. 在 `onload()` 中注册
3. 样式复用现有 `styles.css`

## 9. 未来扩展方向

- 增加主题切换配置
- 增加“批注过滤器”
- 增加“接受全部修改 / 拒绝全部修改”命令
- 增加与审稿工作流联动的命令面板入口
