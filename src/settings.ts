// src/settings.ts

// 定义我们所有设置的“形状”
export interface NoteMergerSettings {
    outputSuffix: string;
    headingLevel: number;
    separatorStyle: string;
}

// 为这些设置提供默认值
export const DEFAULT_SETTINGS: NoteMergerSettings = {
    outputSuffix: '_merged',
    headingLevel: 2,
    separatorStyle: '---'
}
