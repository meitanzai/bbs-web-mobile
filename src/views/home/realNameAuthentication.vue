<!-- 实名认证 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-nav-bar title="实名认证" left-text="返回" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                <template #right>
                    <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                </template>
            </van-nav-bar>
            <van-pull-refresh v-model="state.isRefreshing" success-text="刷新成功" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
                <div class="realNameAuthenticationModule" >
                    <div class="container">
                        <span v-if="state.user.mobile != null && state.user.mobile != ''" class="mobile">
                            您绑定的手机号：{{state.user.mobile}}
                        </span>
                        <span v-if="state.user.mobile == null || state.user.mobile == ''" class="mobile">
                            您还没绑定手机
                        </span>
                        <span class="operating" v-if="state.user.mobile != null && state.user.mobile != ''">
                            <span @click="router.push({path: '/user/control/updatePhoneBinding/step1'})">修改</span>
                        </span>
                        <span class="operating" v-if="state.user.mobile == null || state.user.mobile == ''">
                            <span @click="router.push({path: '/user/control/phoneBinding'})">立即绑定</span>
                        </span>
                    </div>
                </div>
            </van-pull-refresh>
        </div>
    </div>
</template>


<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, watchEffect, onActivated} from 'vue'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { onBeforeRouteUpdate, useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { User } from "@/types/index";
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)
 
    

    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = '实名认证 - ' + titleValue;
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })


    const state = reactive({
        user: {} as User,
        isRefreshing:false,//是否处于下拉加载中状态
    });

    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        //重置
        state.user = {} as User;

       
        init();
    };

    //查询实名认证
    const queryRealNameAuthentication = () => {
        proxy?.$axios({
            url: '/user/control/realNameAuthentication',
            method: 'get',
            params:  { 
               
            },
            //showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                state.user = result.user;
            }
            

        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    

    //导航守卫
    onBeforeRouteUpdate((to, from, next) => {
        if(to.name == 'realNameAuthentication'){
            queryRealNameAuthentication();
        }
        
        next();
    });
    onMounted(() => {
        init();

    }) 

    //初始化
    const init = () => {
		queryRealNameAuthentication();
	}
    
    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = '实名认证 - ' + titleValue;
        }
    })
</script>

<style scoped lang="scss">
.realNameAuthenticationModule{
    margin: var(--van-cell-group-inset-padding);
    border-radius: var(--van-border-radius-lg);
    background: #fff;
    .container {
        padding: 30px 16px 30px 16px;
        .mobile{
            font-size: 15px;
        }
        .operating{
            margin-left: 30px;
            position: relative;
            top: -1px;
            color: var(--van-blue);
        }
    } 
}

</style>
