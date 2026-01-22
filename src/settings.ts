import { ActiveContextState } from './evidence/types';

export interface NoteMergerSettings {
    outputSuffix: string;
    headingLevel: number;
    separatorStyle: string;
    ignoreYAML: boolean;
    mergeMode: 'clean' | 'append' | 'embed';
    contentBaseLevel: number;

    // Evidence Mapper 设置
    lastActiveContext: ActiveContextState;
    evidenceTriggerSymbol: string;

    // ▼▼▼ 新增：Rime 日志路径配置 ▼▼▼
    rimeLogPath: string;

    // ▼▼▼ 新增需求配置 ▼▼▼
    
    // 1. 滚动条标记配置
    enableScrollbarMarkers: boolean;
    markerConfig: {
        pattern: string;   // 识别 [!T] 的 T
        color: string;     // 颜色 hex
    }[];
    markerDefaultColor: string; // 其他未知类型标记的颜色

    // 2. 标签页复用配置
    enableTabReuse: boolean;
}

export const DEFAULT_SETTINGS: NoteMergerSettings = {
    outputSuffix: '_merged',
    headingLevel: 2,
    separatorStyle: '---',
    ignoreYAML: true,
    contentBaseLevel: 0,
    mergeMode: 'append',

    lastActiveContext: {
        targetFilePath: null,
        targetHeading: null
    },
    evidenceTriggerSymbol: '💡',

    // ▼▼▼ 默认值 (保持你现在的路径) ▼▼▼
    rimeLogPath: '00 信息/工具/RIME/rime_log.csv',

    // ▼▼▼ 新增默认值 ▼▼▼
    enableScrollbarMarkers: true,
    markerConfig: [
        { pattern: 'T', color: '#3b82f6' }, // 蓝色
        { pattern: 'Q', color: '#f97316' }, // 橙色
        { pattern: 'TODO', color: '#ef4444' } // 红色 (示例)
    ],
    markerDefaultColor: '#9ca3af', // 灰色
    
    enableTabReuse: true,
}
