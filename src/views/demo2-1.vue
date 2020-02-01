<template>
  <div class="container">
    <h1>g2图表滚动方案2</h1>
    <p>使用DataSet控制图表视图显示的区域，自定义一个滚动条组件，给用户滚动，滚动时更新DataSet的State，从而更新视图范围。</p>
    <p>说明：图表每隔5秒刷新一次数据，数据长度随机</p>
    <p>data长度:{{data.length}}</p>
    <div class="chart">
      <div class="chart-demo-wrap">
        <div id="chartDemo"></div>
        <div class="scrollBarWrap">
          <ScrollBar ref="scrollBar"
                     @updatePosRate="throttleUpdateDs" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import G2 from '@antv/g2'
import DataSet from '@antv/data-set'
import { getMockChartData } from '../api/api'
import ScrollBar from '@/components/ScrollBar/ScrollBar.vue'
import throttle from '@/common/js/throttle'

// 以10条作为基准
const BASE_LEN = 10
const REFRESH_INTERVAL = 5000 // 5秒

export default {
  components: {
    ScrollBar
  },
  data () {
    return {
      data: {},
      average: null
    }
  },
  created () {
    // 不需要与视图交互的变量都定义在created这里
    this.refreshTimer = null
    this.scrollProportion = 0
    this.chart = null
    this.chartView = null
    this.ds = null

    // 定时获取数据
    this.getDataRealTime()
  },
  beforeDestroy () {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }
  },
  methods: {
    getDataRealTime () {
      this.getData()
        .then(() => {
          // 渲染图表
          this.renderChart()
          if (this.refreshTimer) {
            clearTimeout(this.refreshTimer)
          }
          this.refreshTimer = setTimeout(() => {
            // 请求之后重新设置定时器
            this.getDataRealTime()
          }, REFRESH_INTERVAL)
        })
        .catch(() => {
          // 不管请求成功还是失败都不会进入这里
        })
    },
    getData () {
      const randomLen = Math.max(1, Math.floor((Math.random()) * 100))
      return getMockChartData(randomLen)
        .then(res => {
          if (res.code === 200 && res.data) {
            this.data = res.data.list || []
            this.average = res.data.average > 0 ? res.data.average : null
          } else {
            this.data = []
            this.average = null
          }
        })
        .catch(() => {
          this.data = []
        })
    },
    renderChart () {
      const isFirstRender = !this.chartView
      if (isFirstRender) {
        this.initChart()
      } else {
        this.updateChart()
      }
    },
    initChart () {
      let baseRate = 1
      const data = this.data
      if (data.length > BASE_LEN) {
        baseRate = BASE_LEN / data.length
      }
      this.scrollProportion = baseRate
      this.$refs.scrollBar.initScroll(baseRate)
      this.ds = new DataSet({
        state: {
          start: 0,
          end: baseRate
        }
      })

      const dv = this.ds.createView('origin').source(data)
      dv.transform({
        type: 'filter',
        callback: (obj, index, arr) => {
          return (index + 1) / arr.length >= this.ds.state.start && (index + 1) / arr.length <= this.ds.state.end
        }
      })
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
      this.chartView.source(dv, scales)
      this.chartView
        .interval()
        .size(40)
        .position('name*praise')
        .color('praise', '#00c55d-#4edc66')

      this.setChartViewGuide()
      this.chart.render()
    },
    updateChart () {
      let baseRate = 1
      const data = this.data
      if (data.length > BASE_LEN) {
        baseRate = BASE_LEN / data.length
      }
      this.scrollProportion = baseRate

      this.ds.getView('origin').source(data)

      let currentPos = this.ds.state.start

      // 处理边界情况
      if (currentPos + this.scrollProportion > 1) {
        currentPos = 1 - this.scrollProportion
      }
      let endPos = Math.min(1, currentPos + this.scrollProportion)
      // 处理精度误差问题
      if (1 - endPos < 1 / data.length) {
        endPos = 1
      }
      this.ds.setState('start', currentPos)
      this.ds.setState('end', endPos)

      this.$refs.scrollBar.initScroll(baseRate)
      this.chartView
        .guide()
        .clear()
      this.setChartViewGuide()
      // 让guide可以刷新，同时让tooltip刷新
      this.chart.repaint()
      this.$refs.scrollBar.initScroll(this.scrollProportion, this.ds.state.start)
    },
    setChartViewGuide () {
      if (this.average) {
        this.chartView
          .guide()
          .line({
            top: true,
            start: ['start', this.average],
            end: ['end', this.average]
          })
          .text({
            content: `平均好评率：${this.average}`,
            position: ['end', this.average],
            offsetY: -10,
            offsetX: -120
          })
      }
    },
    throttleUpdateDs: throttle(function updateDs (rate) {
      this.ds.setState('start', rate)

      let endPos = rate + this.scrollProportion
      // 处理精度误差问题
      if (1 - endPos < 1 / this.data.length) {
        endPos = 1
      }
      this.ds.setState('end', endPos)
    }, 50)
  }
}
</script>

<style lang="scss" scoped>
.chart-demo-wrap {
  position: relative;
  width: 900px;
  margin: 0 auto;
}
.scrollBarWrap {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 10;
  width: 100%;
}
</style>
