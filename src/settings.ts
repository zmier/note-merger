import { ActiveContextState } from './evidence/types'; // 引入新定义

export interface NoteMergerSettings {
    outputSuffix: string;
    headingLevel: number;
    separatorStyle: string;
    ignoreYAML: boolean;
    mergeMode: 'clean' | 'append' | 'embed';
    contentBaseLevel: number;
    
    // ▼▼▼ 新增: Evidence Mapper 设置 ▼▼▼
    lastActiveContext: ActiveContextState;
    evidenceTriggerSymbol: string; // 默认 💡
}

export const DEFAULT_SETTINGS: NoteMergerSettings = {
    outputSuffix: '_merged',
    headingLevel: 2,
    separatorStyle: '---',
    ignoreYAML: true,
    contentBaseLevel: 0,
    mergeMode: 'append',

    // ▼▼▼ 默认值 ▼▼▼
    lastActiveContext: {
        targetFilePath: null,
        targetHeading: null
    },
    evidenceTriggerSymbol: '💡'
}
