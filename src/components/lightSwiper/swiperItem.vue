<template>
  <div class="swiper-item" :class="{active: active}" :style="itemStyle">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'SwiperItem',
  data() {
    return {
      active: false,
      itemStyle: {
        width: 'auto',
      },
    };
  },
  props: {
    width: String,
  },
  methods: {},
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
