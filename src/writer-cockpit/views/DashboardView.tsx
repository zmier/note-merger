import { ItemView, WorkspaceLeaf } from 'obsidian';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Statistic, Card, Row, Col, Empty, Divider, Tooltip as AntTooltip } from 'antd';
import { Heatmap, Column, Line } from '@ant-design/plots';
import { StatsService } from '../services/StatsService';
import { DashboardData } from '../types';
import {
    ArrowUpOutlined, FireOutlined, CalendarOutlined, ThunderboltOutlined,
    ClockCircleOutlined, RocketOutlined, DashboardOutlined, InfoCircleOutlined
} from '@ant-design/icons';

export const VIEW_TYPE_WRITER_COCKPIT = 'writer-cockpit-view';

const CockpitBoard: React.FC<{ service: StatsService }> = ({ service }) => {
    const [data, setData] = React.useState<DashboardData | null>(null);

    const refresh = async () => {
        const d = await service.getDashboardData();
        setData(d);
    };

    React.useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 5000);
        return () => clearInterval(interval);
    }, [service]);

    if (!data) return <Empty description="数据加载中..." style={{marginTop: 50}}/>;

    // --- 图表 1: 今日分钟级节奏 (修复回归问题) ---
    const rhythmConfig = {
        data: data.rhythmData,
        xField: 'timeStr',
        yField: 'value',
        color: '#40c463',
        height: 180,
        scrollbar: { type: 'horizontal' as const },
        xAxis: {
            label: { autoHide: true, autoRotate: false },
            title: { text: 'Time', style: { fontSize: 10 } }
        },
        // 【关键修复】删除手动的 tooltip.formatter，改用 meta
        // 这样 G2Plot 会自动处理数据映射，不会出现 undefined
        meta: {
            timeStr: { alias: '时间' },
            value: { alias: '打字数' }
        }
    };

    // --- 图表 2: 速度趋势双折线图 (修复数值显示) ---
    const lineConfig = {
        data: data.speedTrendData,
        xField: 'date',
        yField: 'value',
        seriesField: 'type',
        height: 180,
        color: ['#1890ff', '#ff4d4f'],
        smooth: true,
        point: { shape: 'circle', size: 3 },
        yAxis: { grid: { line: { style: { lineDash: [4, 4] } } } },
        legend: { position: 'top-left' as const },
        // 【关键修复】使用 meta 全局定义格式，Tooltip 和 Y轴 都会自动生效
        meta: {
            value: {
                alias: '速度',
                formatter: (v: number) => `${v} 字/分` // 这里定义了，Tooltip 就会显示 "50 字/分"
            },
            date: { alias: '日期' }
        },
        // 这里不需要再写 formatter 了，meta 会自动接管
        tooltip: {
            showMarkers: true
        }
    };

    // --- 图表 3: 年度热力图 (修复 Tooltip) ---
    const heatmapConfig = {
        data: data.heatmapData,
        xField: 'weekOffset',
        yField: 'dayIndex',
        colorField: 'count',
        height: 160,
        color: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
        meta: {
            dayIndex: {
                type: 'cat',
                formatter: (val: number) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][val]
            },
            count: { alias: '字数' } // 给 tooltip 显示用
        },
        xAxis: {
            title: null,
            label: {
                formatter: (val: string) => `W${val}`,
                autoRotate: false,
                autoHide: true,
            },
            grid: null
        },
        yAxis: { title: null, grid: null },
        shape: 'square',
        heatmapStyle: { rx: 2, ry: 2, stroke: '#fff', lineWidth: 2 },
        // 【关键修复】指定 title 为 'date' 字段
        // 注意：G2Plot 只有在 tooltip 显式开启 fields 或者 title 时才能透传非 x/y 字段
        tooltip: {
            title: 'date',
            formatter: (datum: any) => {
                return { name: '打字数', value: datum.count };
            }
        }
    };

    return (
        <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
            <h2 style={{ marginBottom: '20px' }}>⚡️ Writer's Cockpit</h2>

            {/* Row 1: 核心产出指标 */}
            <Row gutter={[12, 12]}>
                <Col span={6}>
                    <Card size="small">
                        <Statistic title="今日总计" value={data.todayCount} prefix={<ArrowUpOutlined style={{color: '#52c41a'}}/>} valueStyle={{color: '#52c41a'}}/>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small">
                        <Statistic title="近1小时" value={data.lastHourCount} prefix={<ClockCircleOutlined />}/>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small">
                        <Statistic title="近5天" value={data.last5DaysCount} prefix={<FireOutlined style={{color: '#fa8c16'}}/>}/>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small">
                        <Statistic title="年度累计" value={data.totalCountYear} prefix={<CalendarOutlined style={{color: '#1890ff'}}/>}/>
                    </Card>
                </Col>
            </Row>

            {/* Row 2: 速度与专注 */}
            <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
                <Col span={6}>
                    <Card size="small" style={{background: '#f6ffed', borderColor: '#b7eb8f'}}>
                        <Statistic
                            title="即时速度 (近1分)"
                            value={data.last1MinCount}
                            suffix="字"
                            prefix={<ThunderboltOutlined style={{color: '#fadb14'}}/>}
                            valueStyle={{ color: '#389e0d', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small">
                        <Statistic
                            title="今日均速"
                            value={data.todayAvgSpeed}
                            suffix="字/分"
                            prefix={<DashboardOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small">
                        <Statistic
                            title="今日峰值"
                            value={data.todayMaxSpeed}
                            suffix="字/分"
                            prefix={<RocketOutlined style={{color: '#ff4d4f'}}/>}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small">
                        {/* 活跃时长 + Tooltip 说明 */}
                        <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(0, 0, 0, 0.45)', fontSize: '12px', marginBottom: '4px' }}>
                            <span>活跃时长</span>
                            <AntTooltip title="统计逻辑：今日产生过打字记录的非重复分钟数总和。">
                                <InfoCircleOutlined style={{ marginLeft: 6, cursor: 'help' }} />
                            </AntTooltip>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 600 }}>
                            {data.todayActiveMinutes} <span style={{ fontSize: '14px', fontWeight: 400 }}>分钟</span>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider orientation={"left" as any} style={{marginTop: 24}}>📈 速度趋势 (过去14天)</Divider>
            <div style={{ background: 'var(--background-secondary)', padding: 10, borderRadius: 8 }}>
                <Line {...lineConfig} />
            </div>

            <Divider orientation={"left" as any} style={{marginTop: 24}}>📊 今日节奏 (分钟级)</Divider>
            <div style={{ background: 'var(--background-secondary)', padding: 10, borderRadius: 8 }}>
                <Column {...rhythmConfig} />
            </div>

            <Divider orientation={"left" as any} style={{marginTop: 24}}>📅 每日记录 (Heatmap)</Divider>
            <div style={{ background: 'var(--background-secondary)', padding: 10, borderRadius: 8, overflowX: 'auto' }}>
                <div style={{ minWidth: 600 }}>
                     <Heatmap {...heatmapConfig} />
                </div>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                Synced at: {data.lastUpdated}
            </div>
        </div>
    );
};

export class WriterCockpitView extends ItemView {
    service: StatsService;
    root: ReactDOM.Root | null = null;
    constructor(leaf: WorkspaceLeaf, service: StatsService) { super(leaf); this.service = service; }
    getViewType() { return VIEW_TYPE_WRITER_COCKPIT; }
    getDisplayText() { return "Writer's Cockpit"; }
    getIcon() { return "bar-chart"; }
    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        this.root = ReactDOM.createRoot(container);
        this.root.render(<CockpitBoard service={this.service} />);
    }
    async onClose() { this.root?.unmount(); }
}
