import { App, TFile } from 'obsidian';
import { DashboardData } from '../types';

declare global {
    interface Window {
        moment: any;
    }
}

export class StatsService {
    app: App;
    csvPath: string;

    constructor(app: App, csvPath: string) {
        this.app = app;
        this.csvPath = csvPath;
    }

    async getDashboardData(): Promise<DashboardData | null> {
        const file = this.app.vault.getAbstractFileByPath(this.csvPath);
        if (!(file instanceof TFile)) return null;

        const content = await this.app.vault.read(file);
        const lines = content.split('\n').filter(l => l.trim() !== '');

        const moment = window.moment;
        const now = moment();
        const todayStr = now.format('YYYY-MM-DD');

        // --- 1. 基础计数器 ---
        let totalYear = 0;
        let todayCount = 0;
        let lastHourCount = 0;
        let last1MinCount = 0;
        let last5DaysCount = 0;
        let last30DaysCount = 0;

        const oneMinAgo = now.clone().subtract(60, 'seconds'); // 严格的60秒滑动窗口
        const oneHourAgo = now.clone().subtract(1, 'hours');
        const fiveDaysAgo = now.clone().subtract(5, 'days').startOf('day');
        const thirtyDaysAgo = now.clone().subtract(30, 'days').startOf('day');

        // --- 2. 聚合容器 ---
        const dailyMap = new Map<string, number>();
        const dailyMinuteMap = new Map<string, Map<string, number>>(); // "YYYY-MM-DD" -> Map<"HH:mm", count>

        // --- 3. 遍历 CSV ---
        for (const line of lines) {
            const parts = line.split(',');
            if (parts.length < 2) continue;

            const tsStr = parts[0].trim();
            const count = parseInt(parts[1].trim());
            if (isNaN(count)) continue;

            const timeObj = moment(tsStr, "YYYY-MM-DD HH:mm:ss");
            if (!timeObj.isValid()) continue;

            const dateStr = timeObj.format('YYYY-MM-DD');
            const minuteStr = timeObj.format('HH:mm');

            // A. 基础累加
            totalYear += count;
            dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + count);

            // B. 分钟级聚合
            if (!dailyMinuteMap.has(dateStr)) dailyMinuteMap.set(dateStr, new Map<string, number>());
            const minMap = dailyMinuteMap.get(dateStr)!;
            minMap.set(minuteStr, (minMap.get(minuteStr) || 0) + count);

            // C. 今日数据 & 实时窗口
            if (dateStr === todayStr) {
                todayCount += count;
                // 滑动窗口判断
                if (timeObj.isAfter(oneHourAgo)) lastHourCount += count;
                if (timeObj.isAfter(oneMinAgo)) last1MinCount += count;
            }

            // D. 历史范围
            if (timeObj.isSameOrAfter(fiveDaysAgo)) last5DaysCount += count;
            if (timeObj.isSameOrAfter(thirtyDaysAgo)) last30DaysCount += count;
        }

        // --- 4. 计算统计指标 ---
        const calcDayStats = (dStr: string) => {
            const total = dailyMap.get(dStr) || 0;
            const minMap = dailyMinuteMap.get(dStr);
            if (!minMap || minMap.size === 0) return { avg: 0, max: 0, activeMins: 0 };

            const activeMins = minMap.size;
            const avg = activeMins > 0 ? Math.round(total / activeMins) : 0;

            let max = 0;
            for (const val of minMap.values()) {
                if (val > max) max = val;
            }
            return { avg, max, activeMins };
        };

        const todayStats = calcDayStats(todayStr);

        // 【修正】如果“即时速度”比“历史分钟峰值”还高，说明现在就是巅峰，强制更新 UI
        if (last1MinCount > todayStats.max) {
            todayStats.max = last1MinCount;
        }

        // --- 5. 构造分钟级节奏数据 (Rhythm) ---
        // 目标：找到今天最早和最晚的打字时间，填充中间的空缺
        const rhythmData: { timeStr: string; value: number }[] = [];
        const todayMinMap = dailyMinuteMap.get(todayStr);

        if (todayMinMap && todayMinMap.size > 0) {
            // 1. 转换所有 Key 为分钟数 (0-1439) 以便排序
            const timestamps: number[] = [];
            for (const tStr of todayMinMap.keys()) {
                const [h, m] = tStr.split(':').map(Number);
                timestamps.push(h * 60 + m);
            }
            timestamps.sort((a, b) => a - b);

            const startMin = timestamps[0]; // 最早
            const endMin = timestamps[timestamps.length - 1]; // 最晚

            // 2. 循环填充
            for (let i = startMin; i <= endMin; i++) {
                const h = Math.floor(i / 60);
                const m = i % 60;
                // 补零格式化 "9:5" -> "09:05"
                const timeKey = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                const val = todayMinMap.get(timeKey) || 0;
                rhythmData.push({ timeStr: timeKey, value: val });
            }
        } else {
            // 如果今天还没打字，给个空的占位
            rhythmData.push({ timeStr: now.format("HH:mm"), value: 0 });
        }

        // --- 6. 构造趋势图 (过去14天) ---
        const speedTrendData: { date: string; type: string; value: number }[] = [];
        const trendStartDate = now.clone().subtract(14, 'days');
        for (let i = 0; i <= 14; i++) {
            const d = trendStartDate.clone().add(i, 'days');
            const dStr = d.format('YYYY-MM-DD');
            const stats = calcDayStats(dStr);
            speedTrendData.push({ date: d.format('MM-DD'), type: '平均速度', value: stats.avg });
            speedTrendData.push({ date: d.format('MM-DD'), type: '峰值速度', value: stats.max });
        }

        // --- 7. 构造热力图 ---
        const heatmapData = [];
        const startDay = now.clone().subtract(1, 'year').startOf('week');
        let current = startDay.clone();
        while (current.isSameOrBefore(now)) {
            const dStr = current.format('YYYY-MM-DD');
            const val = dailyMap.get(dStr) || 0;
            heatmapData.push({
                date: dStr,
                weekOffset: current.diff(startDay, 'weeks'),
                dayIndex: current.day(),
                count: val
            });
            current.add(1, 'days');
        }

        return {
            todayCount,
            lastHourCount,
            last5DaysCount,
            last30DaysCount,
            totalCountYear: totalYear,

            last1MinCount,
            todayActiveMinutes: todayStats.activeMins,
            todayAvgSpeed: todayStats.avg,
            todayMaxSpeed: todayStats.max,

            heatmapData,
            rhythmData, // 替换了 hourlyData
            speedTrendData,

            lastUpdated: now.format('HH:mm:ss')
        };
    }

    async syncToDailyNote(): Promise<void> {
        // ... 保持原有逻辑不变
        const data = await this.getDashboardData();
        if (!data) return;
        const todayStr = window.moment().format("YYYY-MM-DD");
        const dailyNotePath = `00 Journal/${todayStr}.md`;
        let dailyFile = this.app.vault.getAbstractFileByPath(dailyNotePath);
        if (dailyFile instanceof TFile) {
            try {
                await this.app.fileManager.processFrontMatter(dailyFile, (fm) => {
                    fm['word_count'] = data.todayCount;
                    fm['last_writes'] = data.lastUpdated;
                });
            } catch (e) {
                console.error(e);
            }
        }
    }
}
