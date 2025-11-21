export interface NoteMergerSettings {
    outputSuffix: string;
    headingLevel: number;
    separatorStyle: string;
    ignoreYAML: boolean;
    // includeParent: boolean; // [已废弃] 我们用下面的 mergeMode 代替它
    contentBaseLevel: number;

    // ▼▼▼ 新增：合并模式 ▼▼▼
    mergeMode: 'clean' | 'append' | 'embed';
}

export const DEFAULT_SETTINGS: NoteMergerSettings = {
    outputSuffix: '_merged',
    headingLevel: 2,
    separatorStyle: '---',
    ignoreYAML: true,
    contentBaseLevel: 0,

    // ▼▼▼ 默认为追加模式，符合你之前的测试习惯 ▼▼▼
    mergeMode: 'append'
}
