<template>
    <!--html页元信息
    <metainfo>
        <template v-slot:title="{ content }">{{ content }}</template>
    </metainfo>-->

    <router-view v-slot="{ Component }" v-if="supportAccessDevice == 1 || supportAccessDevice == 3">
        <!--:max 缓存组件最大数量-->
        <keep-alive :include="cacheComponents" :max="200">
            <component :is="Component" :key="store.getCacheKey" v-if="state.isRouterAlive"/>
        </keep-alive>
    </router-view>
    <van-empty v-if="supportAccessDevice != 1 && supportAccessDevice != 3" image="error" image-size="180" description="手机端浏览入口已关闭，请尝试使用电脑端浏览器访问本站">
        <van-button round type="primary" @click="setAccessMobile">访问电脑端网站</van-button>
    </van-empty>          
<div style="position: absolute;top: 100px;"></div>
</template>

<script setup lang="ts">
    import { onMounted, getCurrentInstance, ComponentInternalInstance, watch, reactive, computed, onUnmounted,} from 'vue'
    import { AxiosResponse } from 'axios'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { onBrowserback } from './utils/history';
import { onBeforeRouteUpdate } from 'vue-router';



    const store = useStore(pinia);
    const {baseURL,commonPath,contextPath,templateDir,title,keywords,description,systemUser,baseURI,fileStorageSystem,supportAccessDevice,weixin_oa_appid,userInfoVersion} = storeToRefs(store)
 


    const { proxy } = getCurrentInstance() as ComponentInternalInstance;


    const state = reactive({
        isRouterAlive: true, //控制视图是否显示的变量
    });

    const cacheComponents = computed(() => {
        return store.getCacheComponents
    });

   

    /**
     * 查询基本信息
     */
    const queryBaseInfo = () => {
        proxy?.$axios({
            url: '/baseInfo',
            method: 'get',
            params:  {
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            const result: any = response.data;
            if(result != ""){
                let resultData = JSON.parse(result);
                baseURL.value = resultData.baseURL
                commonPath.value = resultData.commonPath
                contextPath.value = resultData.contextPath
                templateDir.value = resultData.templateDir
                title.value = resultData.title
                keywords.value = resultData.keywords
                description.value = resultData.description
                if(resultData.systemUser != null){
                    systemUser.value = resultData.systemUser
                }
                baseURI.value = resultData.baseURI
                fileStorageSystem.value = resultData.fileStorageSystem
                supportAccessDevice.value = resultData.supportAccessDevice
                weixin_oa_appid.value = resultData.weixin_oa_appid

            }

        }).catch((error: any) =>{
            console.log(error);
        });

    }

    
    //设置访问电脑端(需要配合Nginx使用，Nginx配置文件加入判断Cookie值是否为pc)
    const setAccessMobile = () => {
        //accessModule: pc 或 mobile
        document.cookie = "accessModule=pc;path=/";
        window.location.reload();
    }

 
    //监听到用户信息版本号变化时执行刷新登录用户信息
    watch(() => userInfoVersion.value, (val, old) => {
        //查询基本信息(基本信息包含登录用户信息)
        queryBaseInfo();
    })

    onMounted(()=>{
        //查询基本信息
        queryBaseInfo();

        //挂载完成后，判断浏览器是否支持popstate
        if (window.history) {//监听浏览器前进后退按钮
			window.addEventListener('popstate', onBrowserback, false);
		}
    });
    //卸载组件实例后调用
    onUnmounted (()=>{
        //页面销毁时，取消监听
        window.removeEventListener('popstate', onBrowserback, false);
    })
</script>
