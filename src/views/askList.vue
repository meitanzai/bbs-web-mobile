<!--问答列表-->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <div class="headModule">
                    <div class="container">
                        <div class="left-layout">
                            <div class="tagIcon" @click="displayAllTag();"><Icon name="menu-alt" :size="convertViewportWidth('18px')" class="icon"/></div>
					        <div class="tagName" @click="displayAllTag();">{{state.questionTagName == '' ?  '全部' : state.questionTagName}}</div>
                        </div>
                        <div class="right-layout">
                            <van-button plain round type="primary" @click="router.push({path: '/addQuestion'})">提问题</van-button>
                        </div>
                    </div>
                </div>
            </van-sticky>
            <van-popup v-model:show="state.popup_allTag" safe-area-inset-top safe-area-inset-bottom :close-on-popstate="true" position="left" closeable close-icon="close" class="custom-left-popupModule" :style="{ width: '50%',height: '100%'  }">
                <div class="scroll">
                    <van-sidebar v-model="state.tag_sidebar_active" @change="onChangeTag" class="tag-sidebar">
                        <van-sidebar-item title="全部"/>
                    
                        <template v-for="(tag,index) in state.tagList" :key="tag.id">
                            <van-sidebar-item >
                                <template #title>
                                    <div class="name">{{tag.name}}</div>
                                </template>
                            </van-sidebar-item>
                            <template v-for="(childTag,index2) in tag.childTag" :key="childTag.id">
                                <van-sidebar-item >
                                    <template #title>
                                        <div class="name">{{childTag.name}}</div>
                                    </template>
                                </van-sidebar-item>
                            </template>
                        </template>
                    </van-sidebar>
                </div>
            </van-popup>

            <div class="navTabModule">
                <van-tabs v-model:active="state.filterCondition" :shrink="true" @click-tab="onClickNavTab">
                    <van-tab title="最新" :name="10"></van-tab>
                    <van-tab title="未解决" :name="20"></van-tab>
                    <van-tab title="已解决" :name="30"></van-tab>
                    <van-tab title="积分悬赏" :name="40"></van-tab>
                    <van-tab title="现金悬赏" :name="50"></van-tab>
                </van-tabs>
            </div>
            <van-pull-refresh v-model="state.isRefreshing" success-text="刷新成功" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
                <div class="askListModule" >
                    <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" error-text="请求失败，点击重新加载" finished-text="没有更多了" @load="onLoad">
                        <div v-for="(question,index) in state.questionList" :key="question.id" class="item">
                            <div class="top-container">
                                <div class="left-layout">
                                    <router-link v-if="question.account != null && question.account != ''" tag="a" :to="{path:'/user/control/home',query: {userName: question.userName}}">
                                        <span class="avatarImg">
                                            <img v-if="question.avatarName != null" :src="question.avatarPath+'100x100/'+question.avatarName" class="img">
                                        
                                            <img v-if="question.avatarName == null" :src="question.avatar" class="img"/>
                                        </span>
                                    </router-link>
                                    <template v-if="question.account == null || question.account == ''">
                                        <span class="avatarImg">
                                            <img v-if="question.avatarName == null" :src="question.avatar" class="img"/>
                                        </span>
                                    </template>
                                </div>
                                <div class="middle-layout">
                                    <div class="userInfo">
                                        
                                        
                                        <span v-if="question.nickname == null || question.nickname == ''" class="account">{{question.account}}</span>
                                        <span v-if="question.nickname != null && question.nickname != ''" class="account">{{question.nickname}}</span>
                                        <span class="userRoleName" v-for="roleName in question.userRoleNameList">{{roleName}}</span>
                                         
                                        <span class="staff" v-if="question.isStaff">官方人员</span>
                                        
                                        <div v-if="question.account == null || question.account == ''" class="cancelAccount">此用户账号已注销</div>
                                        <span class="time">{{question.postTime}}</span>
                                    </div>
                                </div>
                                <div class="right-layout">
                                    <div class="solve">
                                        <span class="adoption" v-if="Long.fromString(question.adoptionAnswerId).gt(0)">解决</span>
                                    </div>
                                </div>
                            </div>
                            <div class="middle-container">
                                <div class="cancelAccount" v-if="question.account == null || question.account == ''">此用户账号已注销</div>
                                <div class="topic-layout">
                                    <router-link tag="span" class="title" :to="{path: '/question', query: {questionId: question.id}}" >{{question.title}}</router-link>
                                </div>
                                <div class="summary van-multi-ellipsis--l2">
                                    <router-link tag="span" :to="{path: '/question', query: {questionId: question.id}}" >{{question.summary}}</router-link>
                                </div>
                                
                            </div>
                            <div class="middle-lower-container"  v-if="parseFloat(question.amount) > 0 || Long.fromString(question.point).gt(0)">
                                <div class="reward" >
                                    <span class="rewardInfo" >
                                        悬赏<span v-if="parseFloat(question.amount) >0">金额<span class="symbol">¥</span><span class="amount">{{question.amount}}</span>元</span>
                                            
                                        <span v-if="Long.fromString(question.point).gt(0)"><span class="point">{{question.point}}</span>积分</span>
                                    </span>
                                </div>
                            </div>
                            <div class="bottom-container">
                                <div class="left-layout">
                                    <div class="tagName-box">
                                        <div class="tagName" v-for="questionTagAssociation in question.questionTagAssociationList">{{questionTagAssociation.questionTagName}}</div>
                                    </div>
                                </div>
                                <div class="right-layout">
                                    <div class="statistics">
                                        <Icon name="info-alt" :size="convertViewportWidth('14px')" class="icon"/><span class="commentTotal">{{question.answerTotal}}</span>
				            	        <Icon name="view" :size="convertViewportWidth('14px')" class="icon"/><span class="viewTotal">{{question.viewTotal}}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </van-list>
                </div>
            </van-pull-refresh>
        </div>
    </div>
    <!-- 底部导航栏-->
    <BottomTabbar/>
</template>
<script lang="ts" setup>
    import { onMounted, getCurrentInstance, ComponentInternalInstance, reactive, watchEffect, onActivated, } from 'vue'
    import { AxiosResponse } from 'axios'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { onBeforeRouteUpdate } from 'vue-router';
    import { useRouter } from 'vue-router'
    import { PageView, Question, QuestionTag, } from '@/types';
    import { letterAvatar } from '@/utils/letterAvatar';
    import Long from "long";

    
    const store = useStore(pinia);
    const router = useRouter();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;

    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)
 
 
    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = '问答 - ' + titleValue;
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })

    const state = reactive({
        popup_allTag :false,
        tag_sidebar_active:0,//Sidebar 侧边导航
        questionTagId :'',//标签Id
		questionTagName :'',//标签名称
        tagList:[] as Array<QuestionTag>,//标签 
        filterCondition:10,//过滤条件

        questionList:[] as Array<Question>,
        totalrecord : 0, //总记录数
		currentpage : 0, //当前页码
        totalpage : 1, //总页数
        maxresult: 12, //每页显示记录数  
        
        isRefreshing:false,//是否处于下拉加载中状态
        isError:false,//是否列表数据加载失败
        isLoading:false,//是否处于加载中状态
        isFinished:false,//是否加载完毕
        isSkeleton:true,//是否显示骨架屏
        isShowPage:false,//是否显示分页

    });


    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        //重置
        state.popup_allTag = false;
        state.tag_sidebar_active = 0;//Sidebar 侧边导航
        state.questionTagId ='';//标签Id
		state.questionTagName ='';//标签名称
        state.tagList.length =0;//标签 
        state.filterCondition =10;//过滤条件

        state.questionList.length = 0;
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数   
        
        state.isError = false;//是否列表数据加载失败
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        init();
        queryQuestionList(state.questionTagId,state.filterCondition,state.currentpage+1);
    };
    //加载列表
    const onLoad = () => {
        queryQuestionList(state.questionTagId,state.filterCondition,state.currentpage+1);
    }

    //显示所有标签选择
    const displayAllTag = () => {
        state.popup_allTag = true;
        if(state.questionTagId == ''){
            state.tag_sidebar_active = 0;
            return;
        }else{
            if(state.tagList != null && state.tagList.length >0){
                let count =0;
                for(let i=0; i<state.tagList.length; i++ ){
                    let questionTag = state.tagList[i];
                    count++;
                    if(questionTag.id == state.questionTagId){
                        state.tag_sidebar_active = (count);
                        break;
                    }
                    if (questionTag.childTag != null && questionTag.childTag.length > 0) {
                        for (let j = 0; j < questionTag.childTag.length; j++) {
                            let childQuestionTag = questionTag.childTag[j];
                            count++;
                            if(state.questionTagId == childQuestionTag.id){
                                state.tag_sidebar_active = (count);
                                break;
                            }
                        }
                        
                    }
                }
            }
        }
    }

    //查询所有问题标签
    const queryTagList = () => {
        proxy?.$axios({
            url: '/queryAllQuestionTag',
            method: 'get',
            params:  {},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: Array<QuestionTag>) => {
           

            if (data != null && data.length > 0) {
                let count =0;
                for (let i= 0; i < data.length; i++) {
                    let questionTag = data[i];
                    count++;
                    if(state.questionTagId == questionTag.id){
                        state.tag_sidebar_active = (count);
                        state.questionTagName = questionTag.name;
                        break;
                    }
                    if (questionTag.childTag != null && questionTag.childTag.length > 0) {
                        for (let j = 0; j < questionTag.childTag.length; j++) {
                            count++;
                            let childQuestionTag = questionTag.childTag[j];
                            if(state.questionTagId == childQuestionTag.id){
                                state.tag_sidebar_active = (count);
                                state.questionTagName = childQuestionTag.name;
                                break;
                            }
                        }
                        
                    }
                }
            }

            state.tagList = data;
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //侧边导航选中标签
    const onChangeTag = (index:number) => {
        if(index == 0){
            state.popup_allTag = false;
            router.push({path: '/askList'});
            return;
        }
        if(state.tagList != null && state.tagList.length >0){
            let count =0;
            for(let i=0; i<state.tagList.length; i++ ){
                let questionTag = state.tagList[i];
                count++;
                if(index == count){
                    state.popup_allTag = false;
                    router.push({path: '/askList', query:{ questionTagId : questionTag.id}})
                    break;
                }
                if (questionTag.childTag != null && questionTag.childTag.length > 0) {
                    for (let j = 0; j < questionTag.childTag.length; j++) {
                        count++;
                        let childQuestionTag = questionTag.childTag[j];
                        if(index == count){
                            state.popup_allTag = false;
                            router.push({path: '/askList', query:{ questionTagId : childQuestionTag.id}})
                            break;
                        }
                    }
                    
                }
            }
        }
    }

    
     //标签导航
     const onClickNavTab = ( {name} :any) => {
        setTimeout(function () {//让底部方块滑完再跳转
            if(name == 10){//最新
                router.push({path: '/askList'});
            }else if(name == 20){
                router.push({path: '/askList', query: {filterCondition: 20}});
            }else if(name == 30){
                router.push({path: '/askList', query: {filterCondition: 30}});
            }else if(name == 40){
                router.push({path: '/askList', query: {filterCondition: 40}});
            }else if(name == 50){
                router.push({path: '/askList', query: {filterCondition: 50}});
            }
        }, 300);
        
     }

    //查询问题列表
    const queryQuestionList = (questionTagId:string,filterCondition:number,page: number) => {
        let param = {} as any
        if(questionTagId){
			param.questionTagId = questionTagId
		}
        if(filterCondition){
			param.filterCondition = filterCondition
		}
        if(page){
            param.page = page
        }
        
        proxy?.$axios({
            url: '/queryQuestionList',
            method: 'get',
            params:  param,
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: PageView<Question>) => {
            state.isSkeleton = false;//关闭骨架屏
           

            if(data.records != null && data.records.length >0){
                for(let i:number=0; i<data.records.length; i++){
                    let question = data.records[i];
                    if(question.nickname != null && question.nickname !=''){
                        question.avatar = letterAvatar(question.nickname, 40);
                    }else{
                        question.avatar = letterAvatar(question.account, 40);
                    }
                    
                }
                state.questionList.push.apply(state.questionList,data.records)
            }


            
            state.totalrecord = parseInt(data.totalrecord);//服务器返回的long类型已转为String类型
            state.currentpage = data.currentpage;
            state.totalpage = parseInt(data.totalpage);//服务器返回的long类型已转为String类型
            state.maxresult = data.maxresult;

            state.isShowPage = true;//显示分页栏
            if(state.totalpage == 0 || state.totalpage == page){//如果没有内容或是最后一页，则不再加载
                state.isFinished = true;
            }
            state.isLoading = false;//加载状态结束



        })
        .catch((error: any) =>{
            state.isError = true;
            state.isLoading = false;//加载状态结束
            console.log(error);
        });
    }

    
    //导航守卫
    onBeforeRouteUpdate((to, from, next) => {
        if(to.name == 'askList'){
            if(to.query.questionTagId != undefined){
                state.questionTagId = to.query.questionTagId as string
            }
            if(to.query.filterCondition != undefined){
                state.filterCondition = parseInt(to.query.filterCondition as string)
            }
            //删除缓存
            store.setCacheNumber(to.name)
           // init();
        }
        next();
    });

    onMounted(() => {
        state.questionTagId = router.currentRoute.value.query.questionTagId != undefined ? router.currentRoute.value.query.questionTagId as string :'';
        state.filterCondition = router.currentRoute.value.query.filterCondition != undefined ? parseInt(router.currentRoute.value.query.filterCondition as string) :10;

        init();
    }) 

    //初始化
    const init = () => {
        queryTagList();

        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))
    }

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = '问答 - ' + titleValue;
        }
    })
</script>
<style scoped lang="scss">
.headModule{
    background: #fff;
    box-shadow: 0 2px 12px rgba(100, 101, 102, .12);
    padding: 8px;
    .container{
        display: flex;
        align-items: center;
        margin-top: 4px;
        margin-bottom: 4px;
        .left-layout{
            flex: 1;
            display: flex;
            margin-right: 12px;
            overflow:hidden;
            position: relative;
            .tagIcon{
                margin-left: 8px;
                font-size: 18px; 
                color:var(--van-blue);
                padding:4px 0;
                margin-top: 3px;
            }
            .tagName{
                margin-left:12px;
               
                font-size: 16px; 
                color:var(--van-blue);
                border-bottom:2px solid var(--van-blue);
                padding:4px 0;
                white-space:nowrap;
            }
            &::before {
                content: " ";
                position: absolute;
                width: 16px;
                height: 100%;
                right:0;
                top: 0px;
                background-image: linear-gradient(90deg,rgba(255,255,255,0) 0%,#fff 100%);
            }
            
        }
        
        .right-layout{
            margin-right: 8px;
            :deep(.van-button){
                height: 36px;
            }
        }
    }
   
}

.tag-sidebar{
    width: auto;
    margin-right: 10px;
    overflow:hidden;//让栏目触摸可以滑动
    .name{
        line-height: 24px;
    }
    .allowRoleView{
        line-height: 28px;
        color: var(--van-gray-6);
        .space{
            margin-right: 6px;
        }
    }
    :deep(.van-sidebar-item--select){
        &:before{
            background-color: var(--van-blue);
        }
        
    }
}

.navTabModule{
    :deep(.van-tabs__nav){
        background: transparent;
    }
    :deep(.van-tab--shrink){
        padding-right: 12px; 
        padding-left: 12px; 
    }
    :deep(.van-tabs__line){
        background: var(--van-blue);
    }
    :deep(.van-tab--active) {
        color: var(--van-blue);
    }
}

.askListModule{
    margin: var(--van-cell-group-inset-padding) var(--van-cell-group-inset-padding) 58px var(--van-cell-group-inset-padding);
   
    .item{
        padding: 12px 12px 12px 12px;
        margin-bottom: 8px;
        border-radius: var(--van-border-radius-lg);
        background: #fff;
        position: relative;
        .top-container{
            display: flex;
            .left-layout{
                .avatarImg{
                    img {
                        width: 40px;
                        height: 40px;
                        border-radius:40px;
                        vertical-align: middle;
                    }
                }
            }
            .middle-layout{
                flex: 1;
                margin-left: 10px;
                margin-right: 10px;
                .userInfo{
                    display: flex; 
                    align-items: center;
                    flex-wrap: wrap;
                    .cancelAccount{
                        display: inline-block;
                        vertical-align: middle;
                        padding: 4px 4px;
                        font-size: 12px;
                        line-height: 12px;
                        -webkit-border-radius: 2px;
                        -moz-border-radius: 2px;
                        border-radius: 2px;
                        color: var(--van-gray-5);
                        background-color: var(--van-gray-1);
                        position: relative;
                        left: -5px;
                        margin-top: 2px;
                        margin-bottom: 2px;
                    }
                    .account{
                        color: var(--van-gray-7);
                        margin-right: 5px;
                        position: relative;
                        top: -2px;
                    }  
                    .userRoleName{
                        display: inline-block;
                        white-space:nowrap;
                        vertical-align: middle;
                        padding: 3px 4px;
                        margin-right: 5px;
                        margin-bottom: 5px;
                        font-size: 12px;
                        line-height: 12px;
                        -webkit-border-radius: 2px;
                        -moz-border-radius: 2px;
                        border-radius: 2px;
                        color:#e2b46e;
                        background-color:#f8e7c4;
                        position: relative;
                        top: 1px;
                    }
                    .staff{
                        display: inline-block;
                        white-space:nowrap;
                        vertical-align: middle;
                        padding: 3px 4px;
                        margin-right: 5px;
                        margin-bottom: 5px;
                        font-size: 12px;
                        line-height: 12px;
                        -webkit-border-radius: 2px;
                        -moz-border-radius: 2px;
                        border-radius: 2px;
                        color:#4CD263;
                        background-color:#cafcc7;
                        position: relative;
                        top: 1px;
                    }
                    .time{
                        width:100%;
                        color: var(--van-gray-6);
                        font-size: 12px;
                        margin-top: 3px;
                    }
                }
                
            }
            .right-layout{
                .solve{
                    .adoption{
                        margin-left:3px;
                        white-space:nowrap;
                        color:#fff;
                        background-color:#26a2ff;
                        border-radius:4px;
                        padding:1px 5px;
                        font-size: 12px;
                    }	
                }
            }
        }
        .middle-container{
            margin-top: 10px;
            .cancelAccount{
                display: inline-block;
                vertical-align: middle;
                padding: 6px 6px;
                font-size: 14px;
                line-height: 14px;
                -webkit-border-radius: 2px;
                -moz-border-radius: 2px;
                border-radius: 2px;
                color: var(--van-gray-5);
                background-color: var(--van-gray-1);
                margin-bottom: 6px;
            }
            .topic-layout {
                font-size:0;/*父级元素设置font-size:0; 解决 display：inline-block两个元素之间的默认空格 */
                .title{
                    color: var(--van-gray-8);
                    font-size: 18px;
                    line-height: 32px;
                }
            }
            .summary{
                margin-top: 6px;
                a{
                    font-size: 15px;
                    line-height: 28px;
                    font-weight:normal;
                    text-decoration:none;
                    color: var(--van-gray-7);
                }
            }
        }
        .middle-lower-container{
            display: flex;
            justify-content: flex-end;
            margin-top: 8px;
            .reward{
                background: #fcf3e6;
                border-radius:3px;
                padding: 2px 0px;
               .rewardInfo{
                    padding: 1px 5px;
                    color: #e2b46d;
                    font-size: 14px;
                    .symbol{
                        font-family:Arial;
                        font-weight:normal; 
                        vertical-align: middle; 
                        display:inline-block;
                        margin-left: 5px;
                        color: #cca558;
                        font-size: 13px;
                    }
                    .amount{
                        margin-left: 1px;
                        color: #cca558; 
                        margin-right: 5px;
                        font-weight: 600;
                        font-size: 16px;
                        position: relative;
                        top: 1px;
                    }
                    .point{
                        color: #cca558; 
                        margin-left: 3px;
                        margin-right: 5px;
                        font-weight: 600;
                        font-size: 16px;
                        position: relative;
                        top: 1px;
                    }
                }
            }
        }
        .bottom-container{
            margin-top: 15px;
            display: flex;
            .left-layout{
                flex: 1;
                margin-right: 10px;
                overflow:hidden;
                position: relative;
                .tagName-box{
                    display: flex;
                    overflow-x: auto;
                    .tagName{
                        background-color: var(--van-gray-1);
                        font-size: 14px;
                        line-height: 14px;
                        display: inline-block;
                        padding: 6px 6px 6px 6px;
                        -moz-border-radius: 2px;
                        -webkit-border-radius: 2px;
                        border-radius: 2px;
                        text-decoration: none;
                        color: var(--van-gray-6);
                        white-space:nowrap;
                        margin-right: 6px;
                    }
                    &::-webkit-scrollbar {
                        display: none;
                    }
                }
                &::before {
                    content: " ";
                    position: absolute;
                    width: 16px;
                    height: 100%;
                    right:0;
                    top: 0px;
                    background-image: linear-gradient(90deg,rgba(255,255,255,0) 0%,#fff 100%);
                }
                
            }
            .right-layout{
                color: var(--van-gray-6);
                font-size: 14px;
                margin-top: 3px;
                .statistics{
                    .icon{
                        position: relative;
                        top: 2px;
                    }
                    .commentTotal{
                        margin-left: 2px;
                        margin-right: 12px;
                    }
                    .viewTotal{
                        margin-left: 2px;
                    }
                }
                
            }
        }
    }
}
</style>