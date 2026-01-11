import { TextFileView, WorkspaceLeaf, TFile, normalizePath, TAbstractFile } from 'obsidian';

export const VIEW_TYPE_OBHTML = 'obhtml-view';

export class ObHtmlView extends TextFileView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_OBHTML;
    }

    getDisplayText() {
        return this.file ? this.file.basename : 'App';
    }

    // 🔥 生命周期：视图打开时注册热重载监听
    async onOpen() {
        // 注意：TextFileView 的基类 onOpen 不需要调用 super
		await  super.onOpen()
        // 监听文件变动 (Hot Reload)
        this.registerEvent(this.app.vault.on('create', (file) => this.onFileChanged(file)));
        this.registerEvent(this.app.vault.on('modify', (file) => this.onFileChanged(file)));
        this.registerEvent(this.app.vault.on('delete', (file) => this.onFileChanged(file)));
    }

    // 🔥 热重载处理逻辑
    onFileChanged(file: TAbstractFile) {
        // 1. 确保当前有文件打开
        if (!this.file || !this.file.parent) return;

        // 2. 判断变动文件是否属于当前 App 目录
        // 例如：当前 App 在 "99 Assets/Apps/ReactApp"，变动文件是里面的 "assets/index.js"
        if (file.path.startsWith(this.file.parent.path)) {

            // 防抖：如果是 .obhtml 主文件自己变了，TextFileView 会自动处理，我们不管
            if (file.path === this.file.path) return;

            console.log(`[HotReload] Detected change in ${file.name}, reloading App...`);

            // 3. 强制重绘 (相当于 F5)
            this.setViewData(this.data, true);
        }
    }

    // ✨ CSS 隔离处理器：防止 React 样式污染 Obsidian 全局
    processCss(css: string, containerClass: string): string {
        // 1. 保护 :root -> 替换为容器类名
        let isolatedCss = css.replace(/:root/g, `.${containerClass}`);

        // 2. 保护 body/html -> 替换为容器类名
        // 将 "body { ... }" 转换为 ".obhtml-container { ... }"
        isolatedCss = isolatedCss.replace(/(^|[\s,}])(body|html)(?=[{\s,:])/g, `$1.${containerClass}`);

        return isolatedCss;
    }

    // 🌟 核心渲染逻辑
    async setViewData(data: string, clear: boolean) {
        const container = this.contentEl;
        container.empty();

        // 1. 样式初始化 (定义容器类名)
        const CONTAINER_CLASS = 'obhtml-container';
        container.addClass(CONTAINER_CLASS);
        container.setAttribute('style', 'padding: 0; margin: 0; height: 100%; width: 100%; overflow: hidden; display: flex; flex-direction: column; background-color: var(--background-primary);');

        // 2. 准备依赖对象 (软依赖 Dataview)
        let dv: any = null;
        // @ts-ignore
        const dvPlugin = this.app.plugins.getPlugin("dataview");
        if (dvPlugin && dvPlugin.api) {
            dv = dvPlugin.api;
        }

        // 3. 解析 HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');

        // 获取当前 App 的根目录
        if (!this.file) return;
        const appBasePath = this.file.parent ? this.file.parent.path : "/";

        // ============================================================
        // 🧠 智能路径解析器 (支持 ./ 和 /)
        // ============================================================
        const resolveFile = (relPath: string | null): TFile | null => {
            if (!relPath) return null;
            if (relPath.startsWith('http') || relPath.startsWith('data:')) return null;

            let targetPath = "";

            // 策略 A: 绝对路径 (以 / 开头) -> 视为 App 根目录
            if (relPath.startsWith('/')) {
                const cleanPath = relPath.substring(1);
                targetPath = normalizePath(`${appBasePath}/${cleanPath}`);
            }
            // 策略 B: 相对路径 (以 ./ 开头 或 直接文件名)
            else {
                const cleanPath = relPath.startsWith('./') ? relPath.substring(2) : relPath;
                targetPath = normalizePath(`${appBasePath}/${cleanPath}`);
            }

            const file = this.app.vault.getAbstractFileByPath(targetPath);
            return file instanceof TFile ? file : null;
        };

        // === A. 处理 CSS (支持隔离与路径解析) ===
        const links = doc.querySelectorAll('link[rel="stylesheet"]');
        for (const link of Array.from(links)) {
            const href = link.getAttribute('href');
            const cssFile = resolveFile(href);
            if (cssFile) {
                let cssContent = await this.app.vault.read(cssFile);

                // 🔥 CSS 消毒：加上作用域前缀
                cssContent = this.processCss(cssContent, CONTAINER_CLASS);

                const styleEl = document.createElement('style');
                styleEl.textContent = cssContent;
                container.appendChild(styleEl);
            }
        }

        // 处理内联 <style>
        doc.querySelectorAll('style').forEach(s => {
            const fixedContent = this.processCss(s.textContent || "", CONTAINER_CLASS);
            s.textContent = fixedContent;
            container.appendChild(s.cloneNode(true));
        });

        // === B. 构建 DOM & 修正图片路径 ===
        const appRoot = container.createDiv({ cls: 'app-root' });
        appRoot.setAttribute('style', 'width:100%; height:100%; overflow: auto;');

        // 注入 HTML 内容
        appRoot.innerHTML = doc.body.innerHTML;

        // 修正 img 标签
        appRoot.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                const file = resolveFile(src);
                if (file) {
                    img.src = this.app.vault.adapter.getResourcePath(file.path);
                }
            }
        });

        // === C. 处理 JS (严格顺序执行) ===
        const scripts = Array.from(doc.querySelectorAll('script'));

        for (const scriptEl of scripts) {
            let code = scriptEl.textContent || "";
            const src = scriptEl.getAttribute('src');

            if (src) {
                const jsFile = resolveFile(src);
                if (jsFile) {
                    code = await this.app.vault.read(jsFile);
                } else {
                    console.warn(`[OBHTML] Script not found: ${src}`);
                    continue;
                }
            }

            if (code) {
                try {
                    // 构造闭包环境，注入核心变量
                    const runScript = new Function("app", "dv", "container", "window", code);
                    runScript(this.app, dv, appRoot, window);
                } catch (e: any) {
                    console.error(`[OBHTML] Error executing script (${src || 'inline'}):`, e);
                }
            }
        }
    }

    // 必须同步返回
    getViewData(): string {
        return this.data;
    }

    async clear() {
        this.contentEl.empty();
    }
}
