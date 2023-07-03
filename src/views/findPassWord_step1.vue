<!-- 找回密码 第一步 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-nav-bar title="找回密码 第一步" left-text="返回" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                <template #right>
                    <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                </template>
            </van-nav-bar>
            <van-pull-refresh v-model="form.isRefreshing" success-text="刷新成功" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
            
                <div class="findPassWordModule" >
                    <van-tabs v-model:active="form.type" swipeable>
                        <van-tab title="账号密码找回" :name="10">
                            <van-form ref="formAccountRef" label-width="3.2em" :scroll-to-error="true" class="form-container">
                                <van-cell-group inset>
                                    <van-field v-model.trim="form.account" label="账号" placeholder="请输入账号" maxlength="25" clearable :rules="[{ validator: validatorAccount }]" :error-message="error.account"/>
                                    
                                    <van-field v-model="form.captchaValue" v-if="form.showCaptcha" class="captcha-item" label="验证码" placeholder="请输入验证码" maxlength="4" center clearable :rules="[{ validator: checkCaptchaValue }]" :error-message="error.captchaValue">
                                        <template #button>
                                            <van-image :src="form.imgUrl" @click="replaceCaptcha" class="captcha-image"/>
                                        </template>
                                        <template #extra >
                                            <span class="captcha-replace" @click="replaceCaptcha">换一幅</span>
                                        </template>
                                    </van-field>
                                
                                </van-cell-group>
                                <div class="submitButton">
                                    <van-button round block type="primary" native-type="submit" @mousedown="onSubmit" :disabled="form.allowSubmit">提交</van-button>
                                </div>
                            </van-form>
                        </van-tab>
                        <van-tab title="手机号找回" :name="20">
                            <van-form ref="formMobileRef" label-width="3.2em" :scroll-to-error="true" class="form-container">
                                <van-cell-group inset>
                                    <van-field v-model.trim="form.mobile" label="手机号" placeholder="请输入手机" maxlength="11"  type="tel" clearable :rules="[{ validator: validatorMobile }]" :error-message="error.mobile"/>
                                
                                    <van-field v-model="form.captchaValue" v-if="form.showCaptcha" class="captcha-item" label="验证码" placeholder="请输入验证码" maxlength="4" center clearable :rules="[{ validator: checkCaptchaValue }]" :error-message="error.captchaValue">
                                        <template #button>
                                            <van-image :src="form.imgUrl" @click="replaceCaptcha" class="captcha-image"/>
                                        </template>
                                        <template #extra >
                                            <span class="captcha-replace" @click="replaceCaptcha">换一幅</span>
                                        </template>
                                    </van-field>
                                
                                </van-cell-group>
                                <div class="submitButton">
                                    <van-button round block type="primary" native-type="submit" @mousedown="onSubmit" :disabled="form.allowSubmit">提交</van-button>
                                </div>
                            </van-form>
                        </van-tab>
                    </van-tabs>
                </div>
            </van-pull-refresh>
        </div>
    </div>
</template>


<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, ref, watchEffect, onActivated} from 'vue'
    import { onBeforeRouteUpdate, useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { getUri, getUrlParam, processErrorInfo} from '@/utils/tool';
    import pinia from '@/store/store'
    import { storeToRefs } from 'pinia';
    import {useStore} from '@/store'
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';


    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
    const formAccountRef = ref();
    const formMobileRef = ref();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)
 


    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = '找回密码 - ' + titleValue;
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })



    const form = reactive({
        type:10,//类型 10.账号密码找回 20.手机号找回
        account:'',//账号
        mobile:'',//手机号
        showCaptcha:true,//是否显示验证码
        captchaKey: '',//验证码key
        captchaValue: '',//验证码值
        imgUrl: '',//验证码图片
        allowSubmit:false,//提交按钮disabled状态

        isRefreshing:false,//是否处于下拉加载中状态
    });
    

    //错误
    const error = reactive({
        account:'',//账号
        mobile:'',//手机号
        captchaValue:'',//验证码
    })

    //下拉刷新时触发
    const onRefresh = () => {
        form.isRefreshing = false;

        //重置
        form.type = 10;//类型 10.账号密码找回 20.手机号找回
        form.account = '';//账号
        form.mobile = '';//手机号
        form.showCaptcha = true;//是否显示验证码
        form.captchaKey =  '';//验证码key
        form.captchaValue =  '';//验证码值
        form.imgUrl =  '';//验证码图片
        form.allowSubmit = false;//提交按钮disabled状态
        
        init();
    };

    //查询找回密码第一步
    const queryFindPassWord_step1 = () => {
        proxy?.$axios({
            url: '/findPassWord/step1',
            method: 'get',
            params:  { 
               
            },
            //showLoading: false,//是否显示加载图标
            //loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                form.captchaKey = result.captchaKey;
                replaceCaptcha();
            }
            
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    

     //校验账号
     const validatorAccount = (val:any):boolean => {
        if(val != ''){
            if(val.length <3 || val.length>25){
                error.account = "账号在 3 至 25个字符之间"
                return false;
            }
        }else{
            error.account = "账号不能为空"
            return false;
        }
        error.account = "";
        return true;
    }
    //校验手机号
    const validatorMobile = (val:any):boolean => {
        if(val != ''){
            if(val.length <11 || val.length>11){
                error.mobile = "手机号为11个数字"
                return false;
            }
        }else{
            error.mobile = "手机号不能为空"
            return false;
        }
        error.mobile = "";
        return true;
    }

    //刷新验证码
    const replaceCaptcha = () => {
        form.imgUrl = store.apiUrl+"captcha/" + form.captchaKey + ".jpg?" + Math.random();
    }
    //校验验证码
    const checkCaptchaValue = (val:any):Promise<boolean | string> => {
        return new Promise((resolve) => {
            if(form.captchaKey != null && form.captchaKey != ''){
                if(val != ''){
                    if (val.length < 4) {
                        error.captchaValue = "验证码长度为4个字符"
                        resolve(false);
                    } else { 
                    
                        proxy?.$axios({
                            url: '/userVerification',
                            method: 'get',
                            params:  {
                                captchaKey:form.captchaKey,
                                captchaValue:form.captchaValue
                            },
                            showLoading: false,//是否显示加载图标
                            loadingMask:false,// 是否显示遮罩层
                        })
                        .then((response: AxiosResponse) => {
                            if(response){
                                const result: any = response.data;
                                if(!JSON.parse(result)){
                                    error.captchaValue = "验证码错误"
                                    resolve(false);
                                }else{
                                    error.captchaValue = "";
                                    resolve(true);
                                }
                            }
                        }).catch((error: any) =>{
                            console.log(error);
                        });
                    }
                }else{
                    error.captchaValue = "验证码不能为空"
                    resolve(false);
                }

            }else{
                error.captchaValue = "";
                resolve(true);
            }
        });
    }


    //提交数据
    const onSubmit = () => {
        form.allowSubmit = true;//提交按钮disabled状态


        const p1 = new Promise<void>((resolve, reject) => {
            if(form.type == 10){//账号密码用户
                // 全局表单验证
                formAccountRef.value.validate().then(() => {
                    resolve();
                }).catch(() => {
                    form.allowSubmit = false;//提交按钮disabled状态
                })
            }else{
                resolve();
            }
            
        });

        const p2 = new Promise<void>((resolve, reject) => {
            if(form.type == 20){//手机号用户
                // 全局表单验证
                formMobileRef.value.validate().then(() => {
                    resolve();
                }).catch(() => {
                    form.allowSubmit = false;//提交按钮disabled状态
                })
            }else{
                resolve();
            }
        });
        Promise.all([p1,p2])
            .then(() => {
                //清空error的属性值
                Object.keys(error).map(key => {
                    Object.assign(error, {[key] : ''});
                })
            

                let formData = new FormData();
                if(form.type == 10){//10:本地账号密码用户
                    formData.append('type', String(form.type));
                    //账号
                    if(form.account != ''){
                        formData.append('account', form.account);
                    }
                }else if(form.type == 20){//20: 手机用户
                    formData.append('type', String(form.type));
                    //手机号
                    if(form.mobile != ''){
                        formData.append('mobile', form.mobile);
                    }
                }
                //验证码Key
                formData.append('captchaKey', form.captchaKey);
                //验证码值
                if(form.captchaValue != ''){
                    formData.append('captchaValue', form.captchaValue.trim());
                }

                proxy?.$axios({
                    url: '/findPassWord/step1',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;
                        let jumpUrl = result.jumpUrl;
                        if(JSON.parse(result.success)){

                            let uri = getUri(jumpUrl);
                            let userName = getUrlParam(jumpUrl,'userName');
                            let mobile = getUrlParam(jumpUrl,'mobile');

                            router.push({
                                path : '/'+uri,
                                query:{
                                    userName: userName,
                                    mobile:mobile
                                }
                            });
                        }else{
                            //处理错误信息
                            processErrorInfo(result.error as Map<string,string> , error,()=>{});
                            

                            form.allowSubmit = false;//提交按钮disabled状态

                            if(result.captchaKey != null){
                                form.showCaptcha = true;
                                form.captchaKey = result.captchaKey;
                                replaceCaptcha();
                            }

                        }
                    }
                })
                .catch((error: any) =>{
                    console.log(error);
                    form.allowSubmit = false;//提交按钮disabled状态
                });
            }).catch(() => {
                console.log("提交数据错误");
            });

    }
    //导航守卫
    onBeforeRouteUpdate((to, from, next) => {
        if(to.name == 'findPassWord_step1'){
            queryFindPassWord_step1();
        }
        
        next();
    });
    onMounted(() => {
        init();
        
    }) 

    //初始化
    const init = () => {
		queryFindPassWord_step1();
        
	}
    
    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = '找回密码 - ' + titleValue;
        }
    })
</script>

<style scoped lang="scss">
.findPassWordModule{
    margin-top: var(--van-cell-group-inset-padding);
    :deep(.van-tabs--line .van-tabs__wrap) {
        margin-left: var(--van-cell-group-inset-padding);
        margin-right: var(--van-cell-group-inset-padding);
        padding-bottom: 10px;
        background: #fff;
        border-radius: var(--van-cell-group-inset-border-radius) var(--van-cell-group-inset-border-radius) 0px 0px;
    }
    :deep(.van-cell-group--inset) {
        margin: 0px var(--van-cell-group-inset-padding);
        border-radius: 0px 0px var(--van-cell-group-inset-border-radius) var(--van-cell-group-inset-border-radius);
    }
    :deep(.van-tabs__line) {
        background: var(--van-blue);
    }
}
</style>
