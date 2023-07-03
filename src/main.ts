import { createApp, nextTick } from 'vue'
import App from './App.vue'
import pinia from "@/store/store"
import router from '@/router/index'
import axiosInstance from '@/utils/http'//导入请求拦截器request
import { addScrollTop, pushHistory } from '@/utils/history'
import { Lazyload } from 'vant';
import '@/assets/css/base.css'

//Vant 中有个别组件是以函数的形式提供的，包括 Toast，Dialog，Notify 和 ImagePreview 组件。在使用函数组件时，unplugin-vue-components 无法自动引入对应的样式，因此需要手动引入样式
import 'vant/es/toast/style';
import 'vant/es/dialog/style';
import 'vant/es/notify/style';
import 'vant/es/image-preview/style';
import { getScrollTop } from './utils/tool'
import { Image as VanImage } from 'vant';
import Icon from "@/components/icon/Icon.vue";
import { statistic } from '@/utils/trackPageview'

const app = createApp(App);

app.use(router);

//在跳转之前监听路由
router.beforeEach((to,from,next)=>{
	if (to.path) {
        //访问统计
        statistic(to.fullPath,from.fullPath);
    }
	let scrollTop = getScrollTop();
    addScrollTop(from.fullPath,scrollTop) 
    
	next();
})
// afterEach记录历史记录
router.afterEach((to, from) => {
    nextTick(()=>{
        pushHistory(to.fullPath)
        
    })
})


app.use(VanImage);//富文本渲染展示需要全局注册
app.component('Icon', Icon)//富文本渲染展示需要全局注册

app.use(Lazyload);//Lazyload 不支持局部注册


//app.use(createMetaManager(false, {
//    meta: { tag: 'meta', nameless: true }, 
//}))

//axios
app.config.globalProperties.$axios=axiosInstance;


// 挂载到 Vue 根实例
app.use(pinia);

//运行时支持原生自定义元素   player为引入的播放器使用标签
app.config.compilerOptions.isCustomElement = (tag) => ['player','hide'].includes(tag)
app.mount('#app');

