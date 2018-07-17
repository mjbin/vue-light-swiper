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
const TIME = '0.3';
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
      startY: null,
      offsetX: null,
      offsetY: null,
      offsetNum: 0,
      isTouch: false,
      isLast: false,
      isFirst: true,
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
      // 检测误滑
      firstMove: false,
      horizontalMove: false,
      isLoop: false, // 是否循环
      isAuto: false, // 是否自动滚动
    };
  },
  computed: {
    list() {
      const childrens = this.$children;
      return childrens;
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
      if (this.list.length > 0) {
        this.initLoop(); // 初始化循环设定值
        this.initAuto(); // 初始化自动滚动值
        if (this.isLoop) {
          this.clearCopies();
          this.addCopies();
        }
        this.getlimitCurrent();
        this.listLength = this.list.length;
        this.list[this.current].active = true;
        this.currentWidth = this.getSwiperItemWidth(this.list[this.current]);
        let containWidth = 0;
        this.list.forEach((item, index) => {
          containWidth += this.getSwiperItemWidth(item);
          item.index = index;
        });
        this.containWidth = containWidth;
      }
    },
    init() {
      this.$nextTick(() => {
        this.autoSlider();
      });
      this.$refs.swiper.addEventListener('touchstart', this.handleTouchStart, false);
      this.$refs.swiper.addEventListener('touchmove', this.handleTouchMove, false);
      this.$refs.swiper.addEventListener('touchend', this.handleTouchEnd, false);
    },
    initLoop() {
      // 根据宽度来控制循环设定值是否可以生效
      const flag = this.list.every(i => this.getSwiperItemWidth(i) === this.swiperContainWidth);
      this.isLoop = this.loop && (this.width === '100%' || flag);
    },
    initAuto() {
      this.isAuto = this.isLoop && this.auto;
    },
    autoSlider() {
      if (this.isAuto) {
        this.interval = setInterval(() => {
          const index = this.current >= this.limitCurrent ? 0 : this.current + 1;
          this.touchSliderTo(index);
        }, 3000);
      }
    },
    handleTouchStart(e) {
      const touch = e.changedTouches[0];
      this.startX = touch.pageX;
      this.startY = touch.clientY;
      this.isTouch = true;
      this.firstMove = true;
      clearInterval(this.interval);
      this.touchStartTime = Date.now();
    },
    handleTouchMove(e) {
      const touch = e.changedTouches[0];
      this.offsetX = this.startX - touch.pageX;
      this.offsetY = this.startY - touch.clientY;
      // 判断用户是横向滑动还是纵向滑动，以此来避免误滑
      if (this.firstMove) {
        this.firstMove = false;
        this.horizontalMove = Math.abs(this.offsetX) >= Math.abs(this.offsetY);
      }
      // 用户非水平滑动屏幕
      if (!this.horizontalMove) {
        return;
      }
      e.preventDefault(); // 防止move的时候容器页面上下滚动

      const radiu = Math.abs(this.offsetY) / Math.abs(this.offsetX)
        < Math.tan((30 * 2 * Math.PI) / 360);
      if (radiu) {
        this.currentStyle = {
          transform: `translate3d(${-(this.offsetX + this.lastTouchOffset)}px, 0, 0)`,
        };
      }
    },
    handleTouchEnd() {
      if (!this.horizontalMove) return;

      if (this.offsetX <= -50) {
        this.sliderToPrev();
      } else if (this.offsetX >= 50) {
        this.sliderToNext();
      }

      this.touchEndTime = Date.now();
      this.autoSlider();
      this.emitSwiperHandle();
      this.firstPrevSliderByLoop();
      this.lastNextSliderByLoop();
      if (this.isFirst && this.prev) {
        this.lastTouchOffset = 0;
        if (!this.isLoop) {
          this.currentStyle = {
            transition: `all ${TIME}s`,
            transform: 'translate3d(0, 0, 0)',
          };
        }
      } else {
        this.calcDistance();
        this.sliderTo(this.distance);
      }
      this.resetStyle();
    },
    firstPrevSliderByLoop() {
      if (this.isFirst && this.prev && this.isLoop) {
        // 循环时，从左向右滑动
        this.currentStyle = {
          transition: `all ${TIME}s`,
          transform: `translate3d(${this.currentWidth}px, 0, 0)`,
        };
        this.updateCurrentStyle(1);
      }
    },
    lastNextSliderByLoop() {
      if (this.next && this.isLast && this.isLoop) {
        // 重置当前设定值
        this.updateCurrentStyle(0);
      }
    },
    emitSwiperHandle() {
      if (this.next && this.isLast && !this.isLoop) {
        this.$emit('swiperLast');
      }
    },
    updateCurrentStyle(key) {
      // 设置定时器，300ms后重置当前样式
      const width = key ? this.containWidth - this.currentWidth : 0;
      const current = key ? this.list.length - 1 : 0;

      const timeOut = window.setTimeout(() => {
        clearTimeout(timeOut);
        this.currentStyle = {
          transform: `translate3d(-${width}px, 0, 0)`,
        };
        this.lastTouchOffset = width;
        this.current = current;
        this.isFirst = this.current === 0;
        this.isLast = this.current === this.list.length - 1;
      }, 300);
    },
    resetStyle() {
      this.isFirst = this.current === 0;
      this.isLast = this.current === this.list.length - 1;
      this.prev = false;
      this.next = false;
      this.isTouch = false;
      this.offsetX = 0;
      this.distance = 0;
    },
    sliderToPrev() {
      this.prev = true;
      this.next = false;
      this.commonSliderTo(-1, 0);
    },
    sliderToNext() {
      this.next = true;
      this.prev = false;
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
      if (this.isLoop) {
        this.distance = this.swiperContainWidth;
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
    /**
     * 删除复制的节点
     */
    clearCopies() {
      const children = this.$refs.swiperContain.querySelectorAll('.swiper-item-copy');
      [...children].forEach((el) => {
        this.$refs.swiperContain.removeChild(el);
      }, this);
      this.$refs.swiperContain.style.marginLeft = '0';
    },
    /**
     * 插入复制的节点
     */
    addCopies() {
      const fronts = [];
      const ends = [];
      // copy 前两个和最后两个元素
      this.list.forEach((item, index) => {
        if (index === 0) {
          const copy = item.$el.cloneNode(true);
          copy.classList.add('swiper-item-copy');
          fronts.push(copy);
        }
        if (index === this.list.length - 1) {
          const copy = item.$el.cloneNode(true);
          copy.classList.add('swiper-item-copy');
          ends.push(copy);
        }
      }, this);

      // insert node
      while (ends.length) {
        const item = ends.pop();
        const firstNode = this.$refs.swiperContain.querySelector('.swiper-item');
        this.$refs.swiperContain.insertBefore(item, firstNode);
      }

      while (fronts.length) {
        const item = fronts.shift();
        this.$refs.swiperContain.appendChild(item);
      }

      this.$refs.swiperContain.style.width = '100%';
      this.$refs.swiperContain.style.marginLeft = `-${this.currentWidth}px`;
    },
  },
  beforeDestroy() {
    clearInterval(this.interval);
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
