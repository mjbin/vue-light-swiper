// 公用组件
import LightSwiper from '@/components/lightSwiper';

const common = {
  LightSwiper,
  LightSwiperItem: LightSwiper.LightSwiperItem,
};

const plugin = {};

plugin.install = function install(Vue) {
  Object.keys(common).forEach((key) => {
    Vue.component(key, common[key]);
  });
};

export default plugin;
