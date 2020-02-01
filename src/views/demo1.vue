<template>
  <div class="container">
    <h1>g2图表滚动方案1</h1>
    <p>g2容器自动根据宽度撑开（为此g2的父容器宽度要足够大），然后g2的父父容器宽度固定，设置样式让其可以水平滚动</p>
    <p>这个是我一开始的思路，但是最终没有深入下去，只是简单实现一个效果给博客用于截图，仅供参考。</p>
    <div class="chart">
      <div class="chart-demo-wrap">
        <div class="chart-demo-inner"
             ref="chartDemoInner">
          <div id="chartDemo"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import G2 from '@antv/g2'
import { getMockChartData } from '../api/api'

const BASE_WIDTH = 900
// 以10条作为基准
const BASE_LEN = 10

export default {
  data () {
    return {
      data: {},
      chart: null
    }
  },
  created () {
    this.getData()
      .then(this.initChart.bind(this))
  },
  methods: {
    getData () {
      return getMockChartData(100)
        .then(res => {
          if (res.code === 200 && res.data) {
            this.data = res.data.list || []
          }
        })
        .catch(() => {

        })
    },
    initChart () {
      const baseRate = Math.max(1, Math.floor(this.data.length / BASE_LEN))
      const chartDemoInner = this.$refs.chartDemoInner
      if (chartDemoInner) {
        chartDemoInner.style.width = `${BASE_WIDTH * baseRate}px`
      }
      this.$nextTick(() => {
        this.chart = new G2.Chart({
          container: 'chartDemo',
          forceFit: true,
          height: 270,
          animate: false,
          padding: [20, 60, 60, 40]
        })
        this.chart.legend(false)
        this.chartView = this.chart.view()
        const scales = {
          name: {
            alias: '书名'
          },
          praise: {
            alias: '好评率',
            type: 'linear',
            tickInterval: 20,
            min: 0,
            max: 100,
            minLimit: 0,
            maxLimit: 100,
            formatter: function formatter (val) {
              return val + '%'
            }
          }
        }
        this.chartView.source(this.data, scales)
        this.chartView
          .interval()
          .size(40)
          .position('name*praise')
          .color('praise', '#00c55d-#4edc66')

        this.chart.render()
      })
    }

  }
}
</script>

<style lang="scss" scoped>
.chart-demo-wrap {
  width: 900px;
  margin: 0 auto;
  overflow-x: auto;
}
</style>
