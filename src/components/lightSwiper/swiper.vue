<template>
  <div class="light-swiper" ref="swiper">
    <div class="light-swiper-content" ref='swiperContain' :style="currentStyle">
      <slot></slot>
    </div>
    <div class="light-swiper-pagination" v-if="listLength && pagination">
      <span class="dot" v-for="n in limitCurrent + 1" :key="n" :class="{active: current == n - 1}" @click='touchSliderTo(n - 1)'></span>
    </div>
  </div>
</template>

<script>
const TIME = '0.5';
export default {
  name: 'LightSwiper',
  props: {
    width: String,
    pagination: {
      type: Boolean,
      default: true,
    },
    loop: {
      type: Boolean,
      default: false,
    },
    auto: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      startX: null,
      offsetX: null,
      offsetNum: 0,
      isTouch: false,
      isLast: false,
      lastPoint: 0,
      prev: false,
      next: false,
      lastTouchOffset: 0,
      distance: 0,
      previous: 0,
      current: 0,
      currentStyle: null,
      containWidth: 0,
      limitCurrent: 0,
      touchStartTime: 0,
      touchEndTime: 0,
      listLength: 0,
      clickDot: false,
    };
  },
  computed: {
    list() {
      return this.$children;
    },
    swiperContainWidth() {
      return this.$refs.swiper.offsetWidth;
    },
  },
  methods: {
    getSwiperItemWidth(item) {
      return item.$el.offsetWidth;
    },
    getlimitCurrent() {
      let lastPaneWidth = 0;
      let limit = 0;
      const newArray = [].concat(this.list);
      newArray.reverse().forEach((item) => {
        lastPaneWidth += this.getSwiperItemWidth(item);
        if (lastPaneWidth <= this.swiperContainWidth) {
          limit += 1;
        }
      });
      this.limitCurrent = this.list.length - limit;
    },
    updateContain() {
      this.getlimitCurrent();
      this.listLength = this.list.length;
      this.list[this.current].active = true;
      this.currentWidth = this.getSwiperItemWidth(this.list[this.current]);
      let containWidth = 0;
      this.list.forEach((item) => {
        containWidth += this.getSwiperItemWidth(item);
      });
      this.containWidth = containWidth;
    },
    init() {
      this.$refs.swiper.addEventListener('touchstart', this.handleTouchStart, false);
      this.$refs.swiper.addEventListener('touchmove', this.handleTouchMove, false);
      this.$refs.swiper.addEventListener('touchend', this.handleTouchEnd, false);
    },
    handleTouchStart(e) {
      const touch = e.changedTouches[0];
      this.startX = touch.pageX;
      this.isTouch = true;
      this.touchStartTime = Date.now();
    },
    handleTouchMove(e) {
      const touch = e.changedTouches[0];
      this.offsetX = this.startX - touch.pageX;
      if (this.offsetX <= -50) {
        this.sliderToPrev();
      } else if (this.offsetX >= 50) {
        this.sliderToNext();
      }
      this.currentStyle = {
        transform: `translate3d(${-(this.offsetX + this.lastTouchOffset)}px, 0, 0)`,
      };
    },
    handleTouchEnd() {
      this.touchEndTime = Date.now();
      this.emitSwiperHandle();
      if (this.current === 0 && this.prev) {
        this.lastTouchOffset = 0;
        this.currentStyle = {
          transition: `all ${TIME}s`,
          transform: 'translate3d(0, 0, 0)',
        };
      } else {
        this.calcDistance();
        this.sliderTo(this.distance);
      }
      this.resetStyle();
    },
    emitSwiperHandle() {
      if (this.next && this.isLast) {
        this.$emit('swiperLast');
      }
    },
    resetStyle() {
      this.prev = false;
      this.next = false;
      this.isTouch = false;
      this.offsetX = 0;
      this.distance = 0;
    },
    sliderToPrev() {
      this.prev = true;
      this.commonSliderTo(-1, 0);
    },
    sliderToNext() {
      this.next = true;
      this.commonSliderTo(1, this.limitCurrent);
    },
    commonSliderTo(tap, limitValue) {
      if (this.isTouch) {
        this.isTouch = false;
        this.previous = this.current;
        this.current = this.checkIsAvalid(this.current += tap);
        if (limitValue === 0 && this.current <= limitValue) {
          this.current = 0;
        }
        if (limitValue === this.limitCurrent && this.current >= limitValue) {
          this.current = limitValue;
        }
      }
    },
    calcDistance() {
      if (this.current >= 0 && this.current <= this.limitCurrent) {
        const i = this.next ? this.previous : this.current;
        this.currentWidth = this.getSwiperItemWidth(this.list[i]);
        this.distance = this.next ? this.currentWidth : -this.currentWidth;
        if (Math.abs(this.offsetX) > window.screen.width / 3) {
          const fixedNumber = this.next ? -1 : 1;
          this.current = this.checkIsAvalid(this.current += fixedNumber);
          const oldPoint = this.current;
          const sliderDistance = Math.abs(this.offsetX) * this.getDistanceValue(); // 阀值计算
          const getCurrentPoint = (distance, list, index) => {
            let cw = this.getSwiperItemWidth(list[0]);
            if (index >= 0 && index <= this.limitCurrent) {
              cw = this.getSwiperItemWidth(list[index]);
              const num = this.next ? +1 : -1;
              if (Math.abs(distance) - cw > 0) {
                this.previous = this.current;
                this.current = this.checkIsAvalid(this.current += num);
                getCurrentPoint(distance - cw, list, this.current);
              } else if (Math.abs(distance) >= cw / 2) {
                this.previous = this.current;
                this.current = this.checkIsAvalid(this.current += num);
              }
            }
          };
          getCurrentPoint(sliderDistance, this.list, this.current);
          const firstPoint = Math.min(oldPoint, this.current);
          const lastPoint = Math.max(oldPoint, this.current);
          const arr = this.list.slice(firstPoint, lastPoint);
          let fixedSliderWidth = 0;
          arr.forEach((item) => {
            fixedSliderWidth += this.getSwiperItemWidth(item);
          });
          this.distance = this.next ? fixedSliderWidth : -fixedSliderWidth;
        }
        // 到达最后边缘位置修正滚动距离
        this.lastPaneDistance();
      }
    },
    checkIsAvalid(value) {
      if (this.isLast && value >= 0 && value <= this.limitCurrent && this.next) {
        return this.lastPoint;
      }
      if (value < 0) {
        return 0;
      }
      if (value > this.limitCurrent) {
        return this.limitCurrent;
      }
      return value;
    },
    getDistanceValue() {
      // 根据触摸时间返回滚动距离阀值
      const value = this.touchEndTime - this.touchStartTime;
      if (value > 1000) {
        return 1;
      }
      return 2.5;
    },
    lastPaneDistance() {
      const arr = this.list.slice(0, this.current);
      let fixedSliderWidth = 0;
      arr.forEach((item) => {
        fixedSliderWidth += this.getSwiperItemWidth(item);
      });
      if (this.containWidth - fixedSliderWidth <= this.swiperContainWidth && this.next) {
        this.lastPoint = this.current;
        this.isLast = true;
        this.distance = (this.containWidth - this.swiperContainWidth - this.lastTouchOffset) + 2;
      }
    },
    sliderTo(sliderWidth) {
      if (Math.abs(this.offsetX) >= 50 || this.clickDot) {
        this.clickDot = false;
        if (this.next) {
          const sliderDistance = sliderWidth;
          this.lastTouchOffset += sliderDistance;
        } else {
          this.isLast = false;
          const arr = this.list.slice(0, this.current);
          let fixedSliderWidth = 0;
          arr.forEach((item) => {
            fixedSliderWidth += this.getSwiperItemWidth(item);
          });
          this.lastTouchOffset = fixedSliderWidth;
        }
        let distance = 0;
        distance = this.lastTouchOffset;
        this.currentStyle = {
          transition: `all ${TIME}s`,
          transform: `translate3d(-${distance}px, 0, 0)`,
        };
      } else {
        this.currentStyle = {
          transition: `all ${TIME}s`,
          transform: `translate3d(-${this.lastTouchOffset}px, 0, 0)`,
        };
      }
    },
    touchSliderTo(index) {
      // 点击滑动
      const firstPoint = Math.min(this.current, index);
      const lastPoint = Math.max(this.current, index);
      const arr = this.list.slice(firstPoint, lastPoint);
      let fixedSliderWidth = 0;
      arr.forEach((item) => {
        fixedSliderWidth += this.getSwiperItemWidth(item);
      });
      this.next = this.current <= index;
      this.current = index;
      this.distance = this.next ? fixedSliderWidth : -fixedSliderWidth;
      this.clickDot = true;
      this.isLast = false;

      this.lastPaneDistance();
      this.sliderTo(this.distance);
    },
  },
  beforeDestroy() {
    this.$refs.swiper.removeEventListener('touchstart', this.handleTouchStart);
    this.$refs.swiper.removeEventListener('touchmove', this.handleTouchMove);
    this.$refs.swiper.removeEventListener('touchend', this.handleTouchEnd);
  },
  watch: {
    current(val) {
      if (val >= 0 && val <= this.list.length - 1) {
        this.list.forEach((item) => {
          item.active = false;
        });
        this.list[val].active = true;
      }
    },
  },
  mounted() {
    this.init();
    this.updateContain();
  },
};
</script>

<style lang="less" scoped>
@width: 6px;

.light-swiper {
  background: #fafafa;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  .light-swiper-content {
    display: flex;
    -webkit-display: flex;
    position: relative;
  }
  .light-swiper-pagination {
    text-align: center;
    position: absolute;
    bottom: 5px;
    left: 0;
    right: 0;
    .dot {
      width: @width;
      height: @width;
      background: #e6e6e6;
      border-radius: 50%;
      margin-left: @width;
      display: inline-block;
      &:first-of-type {
        margin-left: 0;
      }
      &.active {
        background: #999;
      }
    }
  }
}
</style>