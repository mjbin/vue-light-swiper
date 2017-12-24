<template>
  <div class="home">
    <div class="page">
      <p>demo1:</p>
      <article class="demo-1">
        <LightSwiper class="swiper">
          <LightSwiperItem class="swiper-item swiper-item-1" v-for="i in 10" :key="i">pane-{{i}}</LightSwiperItem>
        </LightSwiper>
      </article>
      <p>demo2:</p>
      <article class="demo-2">
        <LightSwiper class="swiper">
          <LightSwiperItem class="swiper-item swiper-item-2" v-for="i in 5" :key="i">pane-{{i}}</LightSwiperItem>
        </LightSwiper>
      </article>
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
  }
}

.swiper {
  border: @border;
  box-sizing: border-box;
  .swiper-item {
    height: 100px;
    // border-right: @border;
    &:first-of-type{
      // border-left: @border;
    }
  }
}

.swiper-item-1 {
  width: 150px;
}

.swiper-item-2 {
  width: 100%;
}
</style>
