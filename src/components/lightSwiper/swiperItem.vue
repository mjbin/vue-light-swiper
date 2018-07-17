<template>
<div class="swiper-item" :class="{active: active}" :style="itemStyle" @click="sliderTo">
  <slot></slot>
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
  },
  methods: {
    sliderTo() {
      if (this.hasAction) {
        const index = this.index >=
          this.$parent.limitCurrent ? this.$parent.limitCurrent : this.index;
        this.$parent.touchSliderTo(index);
        this.$emit('clickAction');
      }
    },
  },
  computed: {
    hasAction() {
      return this.$listeners.clickAction;
    },
  },
  mounted() {
    const parentWidth = this.$parent.$options.propsData.width;
    this.itemStyle.width = this.width || parentWidth;
  },
  updated() {
    this.$parent.updateContain();
  },
};
</script>

<style lang="less" scoped>
.swiper-item {
    background: #fff;
    max-width: 100%;
    flex-shrink: 0;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    position: relative;
}
</style>
