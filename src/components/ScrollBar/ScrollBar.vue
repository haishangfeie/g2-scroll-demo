<template>
  <div class="scrollBar"
       ref="scrollBar"
       v-if="isShow">
    <div class="scrollBarInner"
         :style="scrollBarInnerStyle"
         ref="scrollBarInner"
         @mousedown="onmousedown"></div>
  </div>
</template>

<script>
/*
  滚动条：暂时只支持水平滚动
*/
export default {
  data () {
    return {
      isShow: false,
      scrollBarWidth: null,
      scrollBarInnerWidth: 0,
      tranX: 0,
      mousedownPosX: null
    }
  },
  computed: {
    scrollBarInnerStyle () {
      return {
        width: `${this.scrollBarInnerWidth}px`,
        transform: `translate3d(${this.tranX}px,0,0)`
      }
    }
  },
  beforeDestroy () {
    document.removeEventListener('mousemove', this.onmousemove)
    document.removeEventListener('mouseup', this.onmouseup)
  },
  methods: {
    /**
     * {Number} proportion - 滚动条占总长比例,[0,1],1时不需要显示
     * {Number} pos - 滚动条初始位置的起点坐标与总长的比值，范围：[0,(1-滚动条占总长比例)]
     */
    initScroll (proportion = 0, pos) {
      if (!proportion) {
        return
      }
      if (proportion >= 1) {
        this.isShow = false
        return
      } else {
        this.isShow = true
      }
      this.$nextTick(() => {
        const scrollBar = this.$refs.scrollBar
        const scrollBarInner = this.$refs.scrollBarInner
        if (scrollBar && scrollBarInner) {
          this.scrollBarWidth = scrollBar.offsetWidth
          const width = (this.scrollBarWidth * proportion) || 0
          this.scrollBarInnerWidth = width
        }
        if (pos >= 0) {
          this.switchPos(pos)
        }
      })
    },
    onmousedown (e) {
      this.mousedownPosX = this.getRelativePosX(e)
      this.mousedownTranX = this.tranX
      // 给全局绑定移动事件，结束时要移除事件
      document.addEventListener('mousemove', this.onmousemove.bind(this))
      document.addEventListener('mouseup', this.onmouseup.bind(this))
    },
    onmousemove (e) {
      if (this.mousedownPosX === null) {
        return
      }
      const currentMousePosX = this.getRelativePosX(e)
      // 处理边界问题
      let tranX = this.mousedownTranX + currentMousePosX - this.mousedownPosX
      tranX = this.getValidTranX(tranX)
      this.tranX = tranX
      this.$emit('updatePosRate', tranX / this.scrollBarWidth)
    },
    onmouseup (e) {
      this.mousedownPosX = null
      document.removeEventListener('mousemove', this.onmousemove)
      document.removeEventListener('mouseup', this.onmouseup)
    },
    // 获取鼠标相对于scrollBar的水平位置
    getRelativePosX (e) {
      const scrollBar = this.$refs.scrollBar
      if (!scrollBar) {
        return 0
      }
      const rect = scrollBar.getBoundingClientRect()
      const mounseX = Math.round(e.clientX - rect.left)
      return mounseX
    },
    // 切换位置:posRate是位置比例，是滚动条起始位置/滚动条长度的值，范围是[0,(1-显示所占比例)]，needEmitUpdate:默认为false，即不会发送updatePosRate事件
    switchPos (posRate, needEmitUpdate = false) {
      let tranX = posRate * this.scrollBarWidth
      tranX = this.getValidTranX(tranX)
      this.tranX = tranX
      if (needEmitUpdate) {
        this.$emit('updatePosRate', tranX / this.scrollBarWidth)
      }
    },
    getValidTranX (tranX) {
      if (tranX < 0) {
        tranX = 0
      } else if (tranX + this.scrollBarInnerWidth > this.scrollBarWidth) {
        tranX = this.scrollBarWidth - this.scrollBarInnerWidth
      }
      return tranX
    }
  }
}
</script>

<style lang="scss" scoped>
.scrollBar {
  width: 100%;
}
.scrollBarInner {
  height: 6px;
  border-radius: 6px;
  background: rgba(#cdcdcd, 1);
}
</style>
