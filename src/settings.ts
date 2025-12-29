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
    rimeLogPath: '00 信息/工具/RIME/rime_log.csv'
}
