<!-- 积分 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <van-nav-bar title="积分" left-text="返回" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <van-pull-refresh v-model="state.isRefreshing" success-text="刷新成功" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
                
                <div class="headModule">
                    <div class="container">
                        <div class="layout">
                            <span class="text">
                                <span class="name">发表话题奖励积分：</span><span class="quantity">{{state.rewardPointInfo.topic_rewardPoint}}</span>
                            </span>
                        </div>
                        <div class="layout">
                            <span class="text">
                                <span class="name">发表评论奖励积分：</span><span class="quantity">{{state.rewardPointInfo.comment_rewardPoint}}</span>
                            </span>
                        </div>
                        <div class="layout">
                            <span class="text">
                                <span class="name">发表回复奖励积分：</span><span class="quantity">{{state.rewardPointInfo.reply_rewardPoint}}</span>
                            </span>
                        </div>
                        <div class="layout">
                            <span class="text">
                                <span class="name">提交问题奖励积分：</span><span class="quantity">{{state.rewardPointInfo.question_rewardPoint}}</span>
                            </span>
                        </div>
                        <div class="layout">
                            <span class="text">
                                <span class="name">提交答案奖励积分：</span><span class="quantity">{{state.rewardPointInfo.answer_rewardPoint}}</span>
                            </span>
                        </div>
                        <div class="layout">
                            <span class="text">
                                <span class="name">提交答案回复奖励积分：</span><span class="quantity">{{state.rewardPointInfo.answerReply_rewardPoint}}</span>
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="pointModule" >
                    <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" error-text="请求失败，点击重新加载" finished-text="没有更多了" @load="onLoad">
                    
                        <div v-for="(pointLog,index) in state.pointLogList" :key="pointLog.id" class="item van-hairline--bottom">
                            <div class="top-container">
                                <div class="left-layout">
                                    <div class="time">{{pointLog.times}}</div>
                                    <div class="module">
                                        <span v-if="pointLog.module == 100">发表话题</span>
                                        <span v-if="pointLog.module == 200">发表评论</span>
                                        <span v-if="pointLog.module == 300">发表回复</span>
                                        <span v-if="pointLog.module == 400">积分解锁话题隐藏内容</span>
                                        <span v-if="pointLog.module == 500">会员卡订单支付</span>
                                        <span v-if="pointLog.module == 600">充值</span>
                                        <span v-if="pointLog.module == 700">问题</span>
                                        <span v-if="pointLog.module == 800">答案</span>
                                        <span v-if="pointLog.module == 900">答案回复</span>
                                        <span v-if="pointLog.module == 1000">悬赏积分</span>
                                        <span v-if="pointLog.module == 1100">采纳答案</span>
                                        <span v-if="pointLog.module == 1200">调整赏金</span>
                                    </div>
                                    <div class="remark">{{pointLog.remark}}</div>
                                </div>
                                <div class="right-layout">
                                    <span class="state" :class="pointLog.pointState == 1 ? 'income' : 'outgoings'">
                                        <span v-if="pointLog.pointState == 1">+</span>
                                        <span v-if="pointLog.pointState == 2">-</span>
                                        {{pointLog.point}}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </van-list>
                    
                    <van-skeleton :row="3" :loading="state.isSkeleton" class="skeleton"/>
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
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { PointLog, RewardPointInfo, User } from "@/types/index";


    const store = useStore(pinia);
    const router = useRouter();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)
 

    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = '积分 - ' + titleValue;
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })

    const state = reactive({
        rewardPointInfo:{} as RewardPointInfo,//奖励积分信息
        user:{} as User,
        pointLogList:[] as Array<PointLog>,
        totalrecord : 0, //总记录数
		currentpage : 0, //当前页码
        totalpage : 1, //总页数
        maxresult: 12, //每页显示记录数     

        isRefreshing:false,//是否处于下拉加载中状态
        isError:false,//是否列表数据加载失败
        isLoading:false,//是否处于加载中状态
        isFinished:false,//是否加载完毕
        isSkeleton:true,//是否显示骨架屏
        isShowPage:false//是否显示分页
    });
    //错误
    const error = reactive({})

    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        //重置
        state.rewardPointInfo = {} as RewardPointInfo,//奖励积分信息
        state.user = {} as User,
        state.pointLogList.length = 0;
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数   
        state.isError = false;//是否列表数据加载失败 
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        queryPoint(state.currentpage+1);
    };
    //加载列表
    const onLoad = () => {
        queryPoint(state.currentpage+1);
    }

    //查询积分
    const queryPoint = (page: number) => {
        proxy?.$axios({
            url: '/user/control/point',
            method: 'get',
            params:  { 
                page: page
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            if(response){
                const data: any = response.data;
                if(data){
                    state.isSkeleton = false;//关闭骨架屏

                    state.rewardPointInfo = data.rewardPointInfo;
                    state.user = data.user;

                    if(data.pageView.records != null && data.pageView.records.length >0){
                        state.pointLogList.push.apply(state.pointLogList,data.pageView.records)
                    }
                    

                    state.totalrecord = parseInt(data.pageView.totalrecord);//服务器返回的long类型已转为String类型
                    state.currentpage =data.pageView.currentpage;
                    state.totalpage = parseInt(data.pageView.totalpage);//服务器返回的long类型已转为String类型
                    state.maxresult = data.pageView.maxresult;

                    state.isShowPage = true;//显示分页栏
                    if(state.totalpage == 0 || state.totalpage == page){//如果没有内容或是最后一页，则不再加载
                        state.isFinished = true;
                    }
                    state.isLoading = false;//加载状态结束
                }
            }
        })
        .catch((error: any) =>{
            state.isError = true;
            state.isLoading = false;//加载状态结束
            console.log(error);
        });
    }

  
    onMounted(() => {
    })

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = '积分 - ' + titleValue;
        }
    })
</script>

<style scoped lang="scss">
.headModule{
    margin: var(--van-cell-group-inset-padding);
    border-radius: var(--van-border-radius-lg);
    background: #fff;
    padding: 8px;
    .container{
        display: flex;
        margin-left: 8px;
        padding-top: 8px;
        padding-bottom: 8px;
        flex-flow: wrap; 
        .layout{
            .text{
                font-size: 14px;
                line-height: 28px;
                color: var(--van-gray-7);
                .quantity{
                    margin-right:15px;
                }
            }
            
        }
    }
}

.pointModule{
    margin: var(--van-cell-group-inset-padding);
    border-radius: var(--van-border-radius-lg);
    background: #fff;
    .item{
        margin-left: 8px;
        margin-right: 8px;
        padding: 8px 0px 8px 0px;
        .top-container{
            display: flex;
            align-items: center;
            .left-layout{
                flex: 1;
                min-height: 1px;
                margin-right: 15px;
                .time{
                    font-size: 14px;
                    line-height: 28px;
                    color: var(--van-gray-7);
                }
                .module{
                    font-size: 14px;
                    line-height: 28px;
                    color: var(--van-gray-8);
                }
                .remark{
                    font-size: 14px;
                    line-height: 28px;
                    color: var(--van-gray-6);
                }
            }
            .right-layout{
              //  box-sizing: border-box;
                min-height: 1px;
                margin-right: 10px;
                .state{
                    font-size: 18px;
                }
                .income{
                    color: var(--van-green);
                }
                .outgoings{
                    color: var(--van-blue);
                }
            }
        }
        
    }
    .skeleton{
        padding-top: 16px;
        padding-bottom: 16px;
    }
}

</style>