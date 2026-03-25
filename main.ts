import { Plugin, Notice, MarkdownView, WorkspaceLeaf, debounce } from 'obsidian'; // 确保 WorkspaceLeaf 被导入
import { NoteMergerSettingTab } from './src/ui/SettingTab';
import { NoteMergerSettings, DEFAULT_SETTINGS } from './src/settings';
import { mergeLinkedFiles } from './src/merger';
import { adjustHeadingLevel } from './src/heading-adjuster';
import { createFileVersion } from './src/versioning';
import { compareWithLatestVersion, compareWithSelectedVersion, compareWithAnyFile } from './src/diff-view';
import { MergeOptionsModal } from './src/ui/MergeOptionsModal';
import { EvidenceManager } from './src/evidence/EvidenceManager';
import { LensManager } from './src/lens-crafter/LensManager';

// ▼▼▼ Writer Cockpit 模块引入 ▼▼▼
import { StatsService } from './src/writer-cockpit/services/StatsService';
import { WriterCockpitView, VIEW_TYPE_WRITER_COCKPIT } from './src/writer-cockpit/views/DashboardView';
// ▲▲▲ 引入结束 ▲▲▲

// 【新增】引入 App Loader
import { ObHtmlView, VIEW_TYPE_OBHTML } from './src/obhtml-loader/ObHtmlView';

import { TableToExcelManager } from './src/table-tool/TableToExcelManager';
import { ScrollbarMarkerManager } from './src/marker/ScrollbarMarkerManager';
import { TabReuseManager } from './src/tab-manager/TabReuseManager';
import { CriticMarkupManager } from './src/criticmarkup/CriticMarkupManager';

export default class NoteMerger extends Plugin {
    settings: NoteMergerSettings;
    evidenceManager: EvidenceManager;
    lensManager: LensManager;

    // 🚨 【修复关键点】: 必须在这里声明 statsService 属性，否则 TS 会报错
    statsService: StatsService;

	// ▼▼▼ 新属性 ▼▼▼
    tableManager: TableToExcelManager;
    markerManager: ScrollbarMarkerManager;
    tabReuseManager: TabReuseManager;
    criticMarkupManager: CriticMarkupManager;

    async onload() {
       await this.loadSettings();

       // --- 0. Init Stats Service (Writer Cockpit) ---
       // 【修改】从设置中读取路径，而不是硬编码
       this.statsService = new StatsService(this.app, this.settings.rimeLogPath);

       // --- Register View ---
       this.registerView(
           VIEW_TYPE_WRITER_COCKPIT,
           (leaf) => new WriterCockpitView(leaf, this.statsService)
       );

       // --- Add Ribbon Icon ---
       this.addRibbonIcon('bar-chart', 'Open Writer Cockpit', () => {
           this.activateCockpitView();
       });

       // --- Setup CSV Watcher (Daemon) ---
       this.registerEvent(this.app.vault.on('modify', async (file) => {
           // 【修改】动态对比当前设置的路径
           if (file.path === this.settings.rimeLogPath) {
               // console.log("[WriterCockpit] CSV detected change, syncing...");
               await this.statsService.syncToDailyNote();
           }
       }));

		// ============================================
        // 🚀 注册新功能：ObHtml App Loader
        // ============================================

        // 1. 注册视图
        this.registerView(
            VIEW_TYPE_OBHTML,
            (leaf) => new ObHtmlView(leaf)
        );

        // 2. 注册文件后缀 .obhtml
        try {
            this.registerExtensions(['obhtml'], VIEW_TYPE_OBHTML);
        } catch (error) {
            console.log("OBHTML extension might be already registered by another plugin.");
        }

        console.log("🔪 Swiss Army Knife: ObHtml Loader Module Armed.");


		// --- Init Table Tool ---
       // ▼▼▼ 初始化表格工具 ▼▼▼
       this.tableManager = new TableToExcelManager(this.app);

       // 注册事件监听：光标移动或文本变更时检查表格
       // 1. 用户点击或移动光标
       this.registerDomEvent(document, 'click', () => this.tableManager.checkTable());
       this.registerDomEvent(document, 'keyup', () => this.tableManager.checkTable());

       // 2. 编辑器内容更新 (这个其实包含在 keyup 里，但为了保险可以加上)
       // 注意：obsidian 的 editor-change 事件可能触发太频繁，我们在 Manager 里做了 debounce
       this.registerEvent(this.app.workspace.on('editor-change', () => {
           this.tableManager.checkTable();
       }));

       // 3. 切换文件时
       this.registerEvent(this.app.workspace.on('active-leaf-change', () => {
           // 切换文件时先隐藏按钮，再尝试检查
           this.tableManager.hideButton();
           // 稍微延迟一下等待视图渲染
           setTimeout(() => this.tableManager.checkTable(), 200);
       }));
       // ▲▲▲ 初始化结束 ▲▲▲

       // --- Init Managers ---
       this.evidenceManager = new EvidenceManager(this.app, this.settings, this.saveSettings.bind(this));
       this.lensManager = new LensManager(this.app);
       this.criticMarkupManager = new CriticMarkupManager(this);
       this.criticMarkupManager.register();

       // --- UI Setup ---
       const statusBarItem = this.addStatusBarItem();
       this.evidenceManager.setStatusBar(statusBarItem);
       statusBarItem.addClass('mod-clickable');
       statusBarItem.onClickEvent(() => {
           this.evidenceManager.quickCapture(true);
       });

       // --- 1. Lens Crafter Commands ---
       this.addCommand({
           id: 'create-project-lens',
           name: 'Create Project Lens Note (Context-Aware)',
           icon: 'glasses',
           callback: () => {
               this.lensManager.triggerLensCreation();
           }
       });

       // --- 2. Evidence Mapper Commands ---
       this.addCommand({
           id: 'quick-capture-evidence',
           name: 'Quick Capture Evidence (Context-Aware)',
           icon: 'zap',
           checkCallback: (checking: boolean) => {
               if (checking) return !!this.app.workspace.getActiveViewOfType(MarkdownView);
               this.evidenceManager.quickCapture(false);
           }
       });

       this.addCommand({
           id: 'redirect-capture-evidence',
           name: 'Redirect Capture Evidence (Change Topic)',
           icon: 'navigation',
           checkCallback: (checking: boolean) => {
               if (checking) return !!this.app.workspace.getActiveViewOfType(MarkdownView);
               this.evidenceManager.quickCapture(true);
           }
       });

       // --- 3. Note Merger Commands ---
       this.addCommand({
          id: 'merge-linked-notes',
          name: 'Merge Linked Notes',
          callback: () => {
             new MergeOptionsModal(this.app, this.settings, (runtimeOptions) => {
                 mergeLinkedFiles(this.app, runtimeOptions);
             }).open();
          }
       });

       // --- 4. Utilities ---
       this.addCommand({ id: 'create-file-version', name: 'Create Version (Snapshot)', icon: 'history', callback: () => createFileVersion(this.app) });
       this.addCommand({ id: 'compare-latest-version', name: 'Compare with Latest Version', icon: 'file-diff', callback: () => compareWithLatestVersion(this.app) });
       this.addCommand({ id: 'compare-specific-version', name: 'Compare with Specific Version...', icon: 'search', callback: () => compareWithSelectedVersion(this.app) });
       this.addCommand({ id: 'compare-any-file', name: 'Compare with Any File...', icon: 'files', callback: () => compareWithAnyFile(this.app) });
       this.addCommand({ id: 'demote-headings-in-selection', name: 'Demote Headings in Selection', icon: 'arrow-down', editorCallback: (editor) => adjustHeadingLevel(editor, 1) });
       this.addCommand({ id: 'promote-headings-in-selection', name: 'Promote Headings in Selection', icon: 'arrow-up', editorCallback: (editor) => adjustHeadingLevel(editor, -1) });

       this.addSettingTab(new NoteMergerSettingTab(this.app, this));

        // ============================================
        // 🎨 1. 初始化 Scrollbar Marker
        // ============================================
        this.markerManager = new ScrollbarMarkerManager(this.app, this.settings);

        // 事件 A: 打开新文件时，延迟计算并渲染
        this.registerEvent(this.app.workspace.on('file-open', () => {
             // 稍微延迟确保 DOM 渲染完毕
             setTimeout(() => this.markerManager.refreshActiveLeaf(), 300);
        }));

        // 事件 B: 编辑器内容变化时，防抖更新
        const debouncedUpdate = debounce((view: MarkdownView) => {
            this.markerManager.updateMarkers(view);
        }, 500, true);

        this.registerEvent(this.app.workspace.on('editor-change', (editor, info) => {
            // 需要找到对应的 view
            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (view && view.editor === editor) {
                debouncedUpdate(view);
            }
        }));
        
        // 事件 C: 布局改变（窗口调整大小）时刷新
        this.registerEvent(this.app.workspace.on('resize', () => {
             this.markerManager.refreshActiveLeaf();
        }));


        // ============================================
        // 📑 2. 初始化 Tab Reuse
        // ============================================
        this.tabReuseManager = new TabReuseManager(this.app, this.settings);

        // 使用 DOM 捕获阶段监听 (capture: true)
        // 这样我们可以在 Obsidian 内部逻辑处理之前拦截点击
        this.registerDomEvent(
            document, 
            'click', 
            this.tabReuseManager.handleFileClick, 
            { capture: true }
        );

        console.log("🚀 Enhancements: Scrollbar Markers & Smart Tab loaded.");
    }

    onunload() {}

    async loadSettings() {
       this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
       // 这里加个非空判断，防止插件刚加载还没初始化 manager 时出错
       if (this.evidenceManager) this.evidenceManager.loadContext();
    }

    async saveSettings() {
       await this.saveData(this.settings);
    }

    // 打开视图的辅助函数
    async activateCockpitView() {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_WRITER_COCKPIT);

        if (leaves.length > 0) {
            // 如果已经打开，就聚焦
            leaf = leaves[0];
        } else {
            // 否则在右侧侧边栏打开 (split: false 表示不拆分主区域，而是侧边)
            // 如果想在主区域打开新标签页，可以用 workspace.getLeaf(true)
            leaf = workspace.getRightLeaf(false);
            if (leaf) {
                await leaf.setViewState({ type: VIEW_TYPE_WRITER_COCKPIT, active: true });
            }
        }

        if (leaf) {
            workspace.revealLeaf(leaf);
        }
    }
}
