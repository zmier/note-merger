# CriticMarkup 快捷键补充 PRD

## 1. 背景

当前 `note-merger` 已经支持 CriticMarkup 的可视化展示，但在实际写审稿意见时，用户仍然需要手动输入：

- `{++ ++}`
- `{-- --}`
- `{== ==}`
- `{~~ ~> ~~}`
- `{>> <<}`

这会带来两个问题：

1. 写批注时打断节奏，尤其是高频审稿场景。
2. CriticMarkup 虽然已经“好看了”，但还不够“好写”。

因此，这次小版本补充需求的重点，不是渲染，而是“录入效率”。

## 2. 需求总结

用户希望为 CriticMarkup 增加一组快捷键命令，使得在编辑器中可以快速插入或包裹 CriticMarkup 语法。

更具体地说：

### 情况 A：没有选中文本

如果当前没有选中文本，则执行快捷键后：

- 在当前光标位置插入对应的 CriticMarkup 模板
- 并将光标放到模板中间，方便继续输入

例如：

- Addition 快捷键：插入 `{++光标放这里++}`
- Deletion 快捷键：插入 `{--光标放这里--}`
- Highlight 快捷键：插入 `{==光标放这里==}`
- Comment 快捷键：插入 `{>>光标放这里<<}`

对于 Substitution，建议插入：

- `{~~原文~>改文~~}`

并优先将光标放在“原文”部分，或选中一个默认占位区域，便于继续改写。

### 情况 B：选中了文本

如果当前已经选中文本，则执行快捷键后：

- 在选中文本前后添加对应的 CriticMarkup 符号

例如，选中 `这句话` 后：

- Addition 快捷键变为 `{++这句话++}`
- Deletion 快捷键变为 `{--这句话--}`
- Highlight 快捷键变为 `{==这句话==}`
- Comment 快捷键可变为 `{>>这句话<<}`，但通常更适合作为独立批注

对于 Substitution，如果选中了文本，建议生成：

- `{~~这句话~>改文~~}`

即把选中文本自动放入“旧文本”位置。

## 3. 目标

为 CriticMarkup 提供“插入模板”和“包裹选区”的快捷录入能力，让用户在 Obsidian 内几乎不需要手打原始语法。

## 4. 本次补充版本范围

本期建议优先支持以下类型：

- Addition
- Deletion
- Highlight
- Comment
- Substitution

本期不处理：

- 复杂多选区智能分发
- 嵌套 CriticMarkup 自动纠错
- 快捷键冲突自动检测
- 图形化工具栏或右键菜单

## 5. 功能设计

## 5.1 命令层

插件中新增一组命令，每个命令可由用户在 Obsidian 的 Hotkeys 中自行绑定快捷键。

建议命令名：

- `CriticMarkup: Insert Addition`
- `CriticMarkup: Insert Deletion`
- `CriticMarkup: Insert Highlight`
- `CriticMarkup: Insert Comment`
- `CriticMarkup: Insert Substitution`

## 5.2 编辑器行为

### Addition / Deletion / Highlight / Comment

#### 无选区

插入完整模板，并把光标移动到中间。

示例：

- Addition: `{++ ++}`
- Deletion: `{-- --}`
- Highlight: `{== ==}`
- Comment: `{>> <<}`

说明：

- 实际实现中不需要真的插入“光标放这里”这几个字
- 更合理的交互是插入空模板，然后把光标置于中间

#### 有选区

把选中文本包裹进模板中。

示例：

- 选中 `文本` 后执行 Addition
- 结果：`{++文本++}`

### Substitution

#### 无选区

插入：

```text
{~~~~>~~}
```

但为了更好的可编辑性，建议实际插入带占位结构的模板，并把光标优先落在旧文本位置。

更推荐的交互理解：

- 生成 substitution 骨架
- 让用户先输入“原文”
- 再移动到 `~>` 后输入“改文”

#### 有选区

选中文本自动放入旧文本位置。

示例：

- 选中 `原句`
- 执行后得到：`{~~原句~>~~}`

此时光标应落在 `~>` 后面，方便直接输入替换内容。

## 6. 交互细节建议

### 光标定位

这是本需求里很关键的一点。

建议规则：

- 普通包裹类命令：无选区时，光标落在中间
- Substitution：有选区时，光标落在新文本区域
- Substitution：无选区时，光标优先落在旧文本区域

### 多光标

第一版建议只保证单选区和单光标体验稳定。

如果 Obsidian 编辑器本身支持多选区，第一版可沿用默认编辑器替换行为，但不承诺复杂场景的完美体验。

### Comment 的语义

`{>> <<}` 严格来说更偏“独立批注”，不一定总适合包裹原文。

因此这里要分两个层次理解：

- 技术上允许“包裹选区”
- 语义上它更适合“插入一个评论块”

后续如果体验上发现不自然，可以把 Comment 命令拆成：

- `Insert Comment`
- `Append Comment After Selection`

## 7. 用户价值

- 明显减少手打符号的成本
- 让 CriticMarkup 真正进入高频写作工作流
- 和现有可视化能力形成闭环：既好看，又好写

## 8. 验收标准

满足以下条件即可视为本小版本完成：

1. 至少有 5 个 CriticMarkup 快捷命令可用。
2. 无选区时，命令能插入对应模板。
3. 有选区时，命令能包裹选中文本。
4. 光标会落到最合理的编辑位置，而不是停在模板外侧。
5. 不破坏现有 CriticMarkup 可视化渲染。
6. 在普通 Markdown 编辑场景中可稳定运行。

## 9. 我的看法

这是一个很值得做的小版本，而且性价比非常高。

因为：

- 它实现成本不高
- 但会显著提升 CriticMarkup 的真实使用频率
- 也能把“可视化展示”从一个被动查看功能，推进成一个真正可写、可用的工作流工具

如果继续推进，我建议这个迭代可以直接作为：

- `v1.4.1` 的增强项，若只做快捷键命令
- 或 `v1.5.0` 的一部分，若还要顺手补按钮、菜单或命令分组

## 10. 当前实现备注

当前版本已按本 PRD 的主路径落地为一组编辑器命令，供用户在 Obsidian `Hotkeys` 中自行绑定快捷键：

- `CriticMarkup: Insert Addition`
- `CriticMarkup: Insert Deletion`
- `CriticMarkup: Insert Highlight`
- `CriticMarkup: Insert Comment`
- `CriticMarkup: Insert Substitution`

当前行为：

- 无选区时插入对应模板
- 有选区时包裹选中文本
- `Substitution` 在有选区时，会将光标落在 `~>` 后的“新文本”区域
