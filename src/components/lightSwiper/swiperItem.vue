<template>
  <div class="swiper-item" :class="{active: active}" :style="itemStyle" @click="sliderTo">
    <div class="swiper-item-box" :style="boxStyle">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'SwiperItem',
  data() {
    return {
      active: false,
      index: null,
      itemStyle: {
        width: 'auto',
      },
    };
  },
  props: {
    width: String,
    clickAction: Boolean,
  },
  methods: {
    sliderTo() {
      if (this.hasAction) {
        const index = this.index
          >= this.$parent.limitCurrent ? this.$parent.limitCurrent : this.index;
        this.$parent.touchSliderTo(index);
        this.$emit('clickAction');
      }
    },
  },
  computed: {
    hasAction() {
      return this.$listeners.clickAction || this.clickAction;
    },
    boxStyle() {
      const { zoomRate, dragX, dragY } = this.$parent;
      return {
        transform: `translate(${dragX}px, ${dragY}px) scale(${zoomRate})`,
      };
    },
  },
  mounted() {
    const parentWidth = this.$parent.$options.propsData.width;
    this.itemStyle.width = this.width || parentWidth;
  },
  updated() {
    this.$nextTick(() => {
      this.$parent.updateContain();
    });
  },
};
</script>

<style lang="less" scoped>
.swiper-item {
  background: transparent;
  flex-shrink: 0;
  justify-content: center;
  display: flex;
  overflow: hidden;
  .swiper-item-box {
    position: relative;
    width: 100%;
  }
}
</style>
