import { TextFileView, WorkspaceLeaf, TFile, normalizePath, TAbstractFile, MarkdownRenderer } from 'obsidian';

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
        await super.onOpen();

        // 监听文件变动 (Hot Reload)
        this.registerEvent(this.app.vault.on('create', (file) => this.onFileChanged(file)));
        this.registerEvent(this.app.vault.on('modify', (file) => this.onFileChanged(file)));
        this.registerEvent(this.app.vault.on('delete', (file) => this.onFileChanged(file)));
    }

    // 🔥 热重载处理逻辑
    onFileChanged(file: TAbstractFile) {
        if (!this.file || !this.file.parent) return;

        // 判断变动文件是否属于当前 App 目录
        // 注意：如果是引用的外部公共目录(../../../)，这里的逻辑可能监听不到变动，这是预期行为
        // 因为我们只监听了 App 目录下的变动。如果需要监听全局，开销太大。
        if (file.path.startsWith(this.file.parent.path)) {
            if (file.path === this.file.path) return;
            console.log(`[HotReload] Detected change in ${file.name}, reloading App...`);
            this.setViewData(this.data, true);
        }
    }

    processCss(css: string, containerClass: string): string {
        let isolatedCss = css.replace(/:root/g, `.${containerClass}`);
        isolatedCss = isolatedCss.replace(/(^|[\s,}])(body|html)(?=[{\s,:])/g, `$1.${containerClass}`);
        return isolatedCss;
    }

    async setViewData(data: string, clear: boolean) {
        const container = this.contentEl;
        container.empty();

        const CONTAINER_CLASS = 'obhtml-container';
        container.addClass(CONTAINER_CLASS);
        container.setAttribute('style', 'padding: 0; margin: 0; height: 100%; width: 100%; overflow: hidden; display: flex; flex-direction: column; background-color: var(--background-primary);');

        let dv: any = null;
        // @ts-ignore
        const dvPlugin = this.app.plugins.getPlugin("dataview");
        if (dvPlugin && dvPlugin.api) {
            dv = dvPlugin.api;
        }

        (window as any).MarkdownRenderer = MarkdownRenderer;

        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');

        if (!this.file) return;

        // 获取当前 App 的根目录路径 (e.g., "03 Projects/MyProj/Dashboard")
        const appBasePath = this.file.parent ? this.file.parent.path : "/";

        // ============================================================
        // 🧠 智能路径解析器 (修复版：手动处理 .. 回退)
        // ============================================================
        const resolveFile = (relPath: string | null): TFile | null => {
            if (!relPath) return null;
            const cleanUrl = relPath.split('?')[0].split('#')[0];

            if (cleanUrl.startsWith('http') || cleanUrl.startsWith('data:')) return null;

            const decodedPath = decodeURIComponent(cleanUrl);
            let targetPath = "";

            // 策略 A: 绝对路径 (以 / 开头)
            if (decodedPath.startsWith('/')) {
                targetPath = normalizePath(decodedPath.substring(1));
            }
            // 策略 B: 相对路径 (支持 ../../../)
            else {
                // 1. 将基准路径打散为数组
                // 如果是根目录 "/"，则数组为空
                const baseParts = (appBasePath === "/" || appBasePath === "") ? [] : appBasePath.split("/");

                // 2. 将相对路径打散
                // 将反斜杠统一为正斜杠
                const relParts = decodedPath.replace(/\\/g, "/").split("/");

                // 3. 模拟路径栈操作
                for (const part of relParts) {
                    if (part === "." || part === "") continue; // 忽略 . 和空
                    if (part === "..") {
                        if (baseParts.length > 0) {
                            baseParts.pop(); // 回退一层
                        }
                    } else {
                        baseParts.push(part); // 进入目录
                    }
                }

                // 4. 重组路径
                targetPath = baseParts.join("/");
            }

            const file = this.app.vault.getAbstractFileByPath(targetPath);

            // 调试辅助：如果没找到，看看算出的是啥
            if (!file && (relPath.endsWith('.js') || relPath.endsWith('.css'))) {
                console.warn(`[OBHTML] Resolve Failed: "${relPath}" \n  Base: "${appBasePath}" \n  Calc: "${targetPath}"`);
            }

            return file instanceof TFile ? file : null;
        };

        // === A. 处理 CSS ===
        const links = doc.querySelectorAll('link[rel="stylesheet"]');
        for (const link of Array.from(links)) {
            const href = link.getAttribute('href');
            const cssFile = resolveFile(href);
            if (cssFile) {
                let cssContent = await this.app.vault.read(cssFile);
                cssContent = this.processCss(cssContent, CONTAINER_CLASS);
                const styleEl = document.createElement('style');
                styleEl.textContent = cssContent;
                container.appendChild(styleEl);
            } else {
                if (href && !href.startsWith('http')) {
                    // console.warn(`[OBHTML] CSS not found: ${href}`);
                }
            }
        }

        doc.querySelectorAll('style').forEach(s => {
            const fixedContent = this.processCss(s.textContent || "", CONTAINER_CLASS);
            s.textContent = fixedContent;
            container.appendChild(s.cloneNode(true));
        });

        // === B. 构建 DOM ===
        const appRoot = container.createDiv({ cls: 'app-root' });
        appRoot.setAttribute('style', 'width:100%; height:100%; overflow: auto;');
        appRoot.innerHTML = doc.body.innerHTML;

        appRoot.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                const file = resolveFile(src);
                if (file) {
                    img.src = this.app.vault.adapter.getResourcePath(file.path);
                }
            }
        });

        // === C. 处理 JS ===
        const scripts = Array.from(doc.querySelectorAll('script'));

        for (const scriptEl of scripts) {
            let code = scriptEl.textContent || "";
            const src = scriptEl.getAttribute('src');

            if (src) {
                const jsFile = resolveFile(src);
                if (jsFile) {
                    code = await this.app.vault.read(jsFile);
                } else {
                    // 已经在 resolveFile 里输出了详细警告，这里就不重复了
                    continue;
                }
            }

            if (code) {
                try {
                    // ✨ 这里的 MarkdownRenderer 参数允许你在脚本中直接使用该类，不需要 window.MarkdownRenderer
                    // ✨ 注入 component (this) 以解决 MarkdownRenderer 内存泄漏警告
                    const runScript = new Function("app", "dv", "container", "window", "MarkdownRenderer", "component", code);
                    runScript(this.app, dv, appRoot, window, MarkdownRenderer, this);
                } catch (e: any) {
                    console.error(`[OBHTML] Error executing script (${src || 'inline'}):`, e);
                }
            }
        }
    }

    getViewData(): string {
        return this.data;
    }

    async clear() {
        this.contentEl.empty();
    }
}
