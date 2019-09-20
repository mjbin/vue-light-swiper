<template>
  <div class="home">
    <div class="page">
      <p>demo1:</p>
      <article class="demo-1">
        <LightSwiper class="swiper" :pagination='true'>
          <LightSwiperItem class="swiper-item swiper-item-1" :class="{last: i == 10 }" v-for="i in 10" :key="i">
            <span class="inner-item">
              pane-{{i}}
            </span>
          </LightSwiperItem>
        </LightSwiper>
      </article>
      <p>demo2: 循环模式</p>
      <article class="demo-2">
        <LightSwiper class="swiper" :loop="true">
          <LightSwiperItem class="swiper-item swiper-item-2" v-for="i in 5" :key="i">
            <span class="inner-item">
              pane-{{i}}
            </span>
          </LightSwiperItem>
        </LightSwiper>
      </article>
      <span class="tip">请先设置loop=true, 必须在宽屏模式下使用</span>
      <p>demo3: 支持缩放</p>
      <article class="demo-3">
        <LightSwiper class="swiper" :loop="true" :zoom="true">
          <LightSwiperItem class="swiper-item swiper-item-2" v-for="i in 5" :key="i">
            <span class="inner-item">
              pane-{{i}}
            </span>
          </LightSwiperItem>
        </LightSwiper>
      </article>
      <span class="tip">请先设置zoom=true, 必须在宽屏模式下使用</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {

    };
  },
};
</script>

<style lang="less" scoped>
@border: 1px solid #e3e3e3;

.home{
  padding: 10px;
  .page {
    width: 100%;
    overflow: hidden;
    p {
      font-weight: bold;
    }
  }
}

.swiper {
  border: @border;
  .swiper-item {
    height: 100px;
    line-height: 100px;
    text-align: center;
    background: #f5f5f5;
    &:nth-of-type(2n) {
      background: #fff;
    }
  }
}

.swiper-item-1 {
  width: 33.33333%;
  &.last {
    width: 200px;
  }
}

.swiper-item-2 {
  width: 100%;
}

.demo-3 {
  .swiper-item {
    height: 200px;
  }
}

.tip {
  font-size: 13px;
}
</style>
