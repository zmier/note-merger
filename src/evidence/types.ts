import { TFile, Editor } from "obsidian"; // ◀︎ 1. 引入 Editor

export interface ActiveContextState {
    targetFilePath: string | null;
    targetHeading: string | null;
}

export interface IEvidenceService {
    loadContext(): void;

    // ◀︎ 2. 更新签名: 增加 editor 参数，返回值确定为 string (实现中去掉了 null 返回)
    ensureBlockId(editor: Editor): string;

    markFileAsTopic(file: TFile): Promise<void>;

    appendToTopic(
        targetFile: TFile,
        targetHeading: string,
        contentLine: string,
        annotation: string
    ): Promise<void>;

    updateStatusBar(): void;
}
