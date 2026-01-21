<template>
  <div class="home-container">
    <!-- 顶部欢迎和统计卡片 -->
    <div class="header-card card">
      <div class="header-content">
        <div class="greeting">
          <img src="@/assets/images/welcome.png" alt="welcome" class="welcome-img" />
          <div class="text">
            <h1>Admin，欢迎回来！</h1>
            <p>今天也是充满活力的一天，快来看看后台的最新动态吧！</p>
          </div>
        </div>
        <div class="stats-cards">
          <div class="stats-item">
            <div class="label">用户总数</div>
            <div class="value">{{ dashboardData.metrics.totalUsers }}</div>
            <div class="unit">人</div>
          </div>
          <div class="stats-item">
            <div class="label">今日活跃</div>
            <div class="value">{{ dashboardData.metrics.activeToday }}</div>
            <div class="unit">人</div>
          </div>
          <div class="stats-item">
            <div class="label">付费转化</div>
            <div class="value">{{ dashboardData.metrics.conversionRate }}%</div>
            <div class="unit">率</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据指标卡片 -->
    <el-row :gutter="20" class="metrics-row">
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <div class="metric-card card">
          <div class="metric-icon blue">
            <el-icon><User /></el-icon>
          </div>
          <div class="metric-info">
            <div class="label">总注册量</div>
            <div class="count">{{ dashboardData.metrics.totalUsers }}</div>
          </div>
          <div class="trend up">+12%</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <div class="metric-card card">
          <div class="metric-icon purple">
            <el-icon><Histogram /></el-icon>
          </div>
          <div class="metric-info">
            <div class="label">今日活跃</div>
            <div class="count">{{ dashboardData.metrics.activeToday }}</div>
          </div>
          <div class="trend up">+5%</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <div class="metric-card card">
          <div class="metric-icon orange">
            <el-icon><Star /></el-icon>
          </div>
          <div class="metric-info">
            <div class="label">付费用户</div>
            <div class="count">{{ dashboardData.metrics.paidUsers }}</div>
          </div>
          <div class="trend up">+28%</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <div class="metric-card card">
          <div class="metric-icon green">
            <el-icon><Cpu /></el-icon>
          </div>
          <div class="metric-info">
            <div class="label">今日 Token 消耗</div>
            <div class="count">{{ dashboardData.metrics.tokenUsageToday }}</div>
          </div>
          <div class="trend down">-2%</div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="16">
        <div class="chart-card card">
          <div class="title">会员增长与活跃趋势</div>
          <div ref="lineChartRef" class="chart-box"></div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="8">
        <div class="list-card card">
          <div class="title">最近加入的会员</div>
          <div class="member-list">
            <div v-for="user in dashboardData.recentUsers" :key="user.handle" class="member-item">
              <el-avatar :size="40" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <div class="info">
                <div class="name">{{ user.name }}</div>
                <div class="time">{{ user.timeAgo }}加入中心</div>
              </div>
              <el-icon class="arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 底部图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="12">
        <div class="chart-card card">
          <div class="title">用户类型分布</div>
          <div ref="pieChartRef" class="chart-box"></div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="chart-card card">
          <div class="title">数据概览（雷达图）</div>
          <div ref="radarChartRef" class="chart-box"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="home">
import { ref, onMounted, reactive, onUnmounted } from "vue";
import * as echarts from "echarts";
import { getDashboardData } from "@/api/modules/user";
import { User, Histogram, Star, Cpu, ArrowRight } from "@element-plus/icons-vue";

const lineChartRef = ref<HTMLElement>();
const pieChartRef = ref<HTMLElement>();
const radarChartRef = ref<HTMLElement>();

let lineChart: echarts.ECharts;
let pieChart: echarts.ECharts;
let radarChart: echarts.ECharts;

const dashboardData = reactive({
  metrics: {
    totalUsers: 0,
    activeToday: 0,
    paidUsers: 0,
    conversionRate: "0",
    tokenUsageToday: 0
  },
  charts: {
    days: [] as string[],
    registration: [] as number[],
    activity: [] as number[]
  },
  recentUsers: [] as any[]
});

const initCharts = () => {
  // 折线图
  if (lineChartRef.value) {
    lineChart = echarts.init(lineChartRef.value);
    const lineOption = {
      tooltip: { trigger: "axis" },
      legend: { data: ["注册量", "活跃量"], bottom: 0 },
      grid: { left: "3%", right: "4%", bottom: "10%", containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dashboardData.charts.days
      },
      yAxis: { type: "value" },
      series: [
        {
          name: "注册量",
          type: "line",
          smooth: true,
          data: dashboardData.charts.registration,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(64, 158, 255, 0.3)" },
              { offset: 1, color: "rgba(64, 158, 255, 0)" }
            ])
          },
          itemStyle: { color: "#409eff" }
        },
        {
          name: "活跃量",
          type: "line",
          smooth: true,
          data: dashboardData.charts.activity,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(103, 194, 58, 0.3)" },
              { offset: 1, color: "rgba(103, 194, 58, 0)" }
            ])
          },
          itemStyle: { color: "#67c23a" }
        }
      ]
    };
    lineChart.setOption(lineOption);
  }

  // 饼图
  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value);
    const pieOption = {
      tooltip: { trigger: "item" },
      legend: { orient: "vertical", left: "left" },
      series: [
        {
          name: "用户类型",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
          label: { show: false, position: "center" },
          emphasis: { label: { show: true, fontSize: "20", fontWeight: "bold" } },
          labelLine: { show: false },
          data: [
            { value: dashboardData.metrics.paidUsers, name: "付费用户" },
            { value: dashboardData.metrics.totalUsers - dashboardData.metrics.paidUsers, name: "免费用户" }
          ]
        }
      ]
    };
    pieChart.setOption(pieOption);
  }

  // 雷达图
  if (radarChartRef.value) {
    radarChart = echarts.init(radarChartRef.value);
    const radarOption = {
      radar: {
        indicator: [
          { name: "注册量", max: Math.max(...dashboardData.charts.registration, 10) * 1.2 },
          { name: "活跃度", max: Math.max(...dashboardData.charts.activity, 10) * 1.2 },
          { name: "转化率", max: 100 },
          { name: "Token消耗", max: dashboardData.metrics.tokenUsageToday * 1.5 || 1000 },
          { name: "付费用户", max: dashboardData.metrics.totalUsers || 10 }
        ]
      },
      series: [
        {
          name: "综合指标",
          type: "radar",
          data: [
            {
              value: [
                dashboardData.metrics.totalUsers,
                dashboardData.metrics.activeToday,
                dashboardData.metrics.conversionRate,
                dashboardData.metrics.tokenUsageToday,
                dashboardData.metrics.paidUsers
              ],
              name: "当前指标",
              areaStyle: { color: "rgba(103, 194, 58, 0.3)" }
            }
          ]
        }
      ]
    };
    radarChart.setOption(radarOption);
  }
};

const fetchData = async () => {
  try {
    const { data } = await getDashboardData();
    Object.assign(dashboardData, data);
    initCharts();
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  }
};

const handleResize = () => {
  lineChart?.resize();
  pieChart?.resize();
  radarChart?.resize();
};

onMounted(() => {
  fetchData();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  lineChart?.dispose();
  pieChart?.dispose();
  radarChart?.dispose();
});
</script>

<style scoped lang="scss">
.home-container {
  min-height: 100%;
  padding: 20px;
  background-color: #f0f2f5;
  .card {
    padding: 20px;
    margin-bottom: 20px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);
  }
  .header-card {
    padding: 30px;
    color: #ffffff;
    background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
    .header-content {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: center;
      justify-content: space-between;
    }
    .greeting {
      display: flex;
      gap: 20px;
      align-items: center;
      .welcome-img {
        width: 80px;
        height: 80px;
      }
      h1 {
        margin: 0 0 10px;
        font-size: 24px;
      }
      p {
        margin: 0;
        opacity: 0.8;
      }
    }
    .stats-cards {
      display: flex;
      gap: 40px;
      .stats-item {
        text-align: center;
        .label {
          margin-bottom: 8px;
          font-size: 14px;
          opacity: 0.7;
        }
        .value {
          font-size: 28px;
          font-weight: bold;
        }
        .unit {
          margin-top: 4px;
          font-size: 12px;
        }
      }
    }
  }
  .metric-card {
    position: relative;
    display: flex;
    align-items: center;
    padding: 25px;
    .metric-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      margin-right: 15px;
      font-size: 24px;
      border-radius: 12px;
      &.blue {
        color: #409eff;
        background: rgb(64 158 255 / 10%);
      }
      &.purple {
        color: #722ed1;
        background: rgb(144 147 153 / 10%);
      }
      &.orange {
        color: #e6a23c;
        background: rgb(230 162 60 / 10%);
      }
      &.green {
        color: #67c23a;
        background: rgb(103 194 58 / 10%);
      }
    }
    .metric-info {
      .label {
        margin-bottom: 5px;
        font-size: 14px;
        color: #909399;
      }
      .count {
        font-size: 22px;
        font-weight: bold;
        color: #303133;
      }
    }
    .trend {
      position: absolute;
      top: 25px;
      right: 20px;
      padding: 2px 8px;
      font-size: 12px;
      border-radius: 10px;
      &.up {
        color: #67c23a;
        background: rgb(103 194 58 / 10%);
      }
      &.down {
        color: #f56c6c;
        background: rgb(245 108 108 / 10%);
      }
    }
  }
  .chart-card,
  .list-card {
    .title {
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: bold;
      color: #303133;
    }
    .chart-box {
      width: 100%;
      height: 300px;
    }
  }
  .member-list {
    .member-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f2f5;
      &:last-child {
        border-bottom: none;
      }
      .info {
        flex: 1;
        margin-left: 12px;
        .name {
          font-size: 14px;
          font-weight: bold;
        }
        .time {
          margin-top: 4px;
          font-size: 12px;
          color: #909399;
        }
      }
      .arrow {
        color: #c0c4cc;
        cursor: pointer;
      }
    }
  }
}
</style>
