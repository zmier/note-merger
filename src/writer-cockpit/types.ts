export interface RimeLogEntry {
    timestamp: string;
    count: number;
}

export interface DashboardData {
    // --- 核心总量指标 ---
    todayCount: number;
    lastHourCount: number;
    last5DaysCount: number;
    last30DaysCount: number;
    totalCountYear: number;

    // --- 速度与专注指标 ---
    last1MinCount: number;
    todayActiveMinutes: number;
    todayAvgSpeed: number;
    todayMaxSpeed: number;

    // --- 图表数据 ---
    heatmapData: { weekOffset: number; dayIndex: number; date: string; count: number }[];

    // 【修改】改为更加通用的 rhythmData，不再只是 hourly
    // timeStr: "10:05", value: 30
    rhythmData: { timeStr: string; value: number }[];

    speedTrendData: { date: string; type: string; value: number }[];

    lastUpdated: string;
}
