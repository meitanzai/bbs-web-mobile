<!-- 更换绑定手机第二步 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-nav-bar title="修改手机绑定" left-text="返回" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                <template #right>
                    <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                </template>
            </van-nav-bar>
            <van-pull-refresh v-model="form.isRefreshing" success-text="刷新成功" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
             
                <div class="updatePhoneBindingModule" >
                    <div class="container">
                        <div class="title">修改手机绑定 -- 绑定新手机号</div>
                        <van-form ref="formRef" :scroll-to-error="true" class="form-container">
                            <van-cell-group inset>
                                <van-field v-model.trim="form.mobile" name="mobile" label="新手机号" placeholder="请输入手机" maxlength="11"  type="tel" clearable :rules="[{ validator: validatorMobile }]" :error-message="error.mobile"/>
                                <div class="van-cell cell-field">
                                    <div class="van-cell__title van-field__label cell-field-title">
                                        <span>短信验证码</span>
                                    </div>
                                    <div class="van-cell__value">
                                        <span>
                                            <van-field v-model.trim="form.smsCode" name="smsCode" class="cell-field-value" placeholder="请输入" maxlength="6" clearable :rules="[{ validator: validatorSmsCode }]" :error-message="error.smsCode">
                                                <template #button>
                                                    <div class="smsCode">
                                                        <div v-if="form.counter <=0" class="button">
                                                            <span @mousedown="!form.allowSmsCodeSubmit ? getSmsCode() : ()=>{}">获取验证码</span>
                                                        </div>
                                                        <div v-if="form.counter >0" class="text">{{form.countdownText}}</div>
                                                    </div>
                                                </template>
                                            </van-field>
                                        </span>
                                    </div>
                                    <div class="van-cell__label cell-field-label" v-if="form.successInfo != null && form.successInfo != ''" >
                                        <div class="successInfo">{{form.successInfo}}</div>
                                    </div>
                                </div>
                                <van-field v-model="form.captchaValue"  name="captchaValue" v-if="form.showCaptcha" class="captcha-item captcha-input-left" label="验证码" placeholder="输入验证码" maxlength="4" center clearable :rules="[{ validator: checkCaptchaValue }]" :error-message="error.captchaValue">
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
                    </div>
                    
                </div>
            </van-pull-refresh>
        </div>
    </div>
</template>


<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, ref, watchEffect, onActivated} from 'vue'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { onBeforeRouteUpdate, useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { processErrorInfo} from '@/utils/tool';
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { Notify } from 'vant';

    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
    const formRef = ref();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)
 
    
    
    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = '更换绑定手机第二步 - ' + titleValue;
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })


    const form = reactive({
        mobile:'',//手机号
        smsCode:'',//短信验证码
        showCaptcha:true,//是否显示验证码
        captchaKey: '',//验证码key
        captchaValue: '',//验证码值
        imgUrl: '',//验证码图片
        allowSubmit:false,//提交按钮disabled状态
        allowSmsCodeSubmit:false,//提交按钮disabled状态
        successInfo: '',

        timer: '' as any,//计时器对象
        countdownText: '',//倒计时文本
        counter: 0,//计数器

        lastMobile:'',//上次获取验证码提交的手机号

        isRefreshing:false,//是否处于下拉加载中状态
    });
    

    //错误
    const error = reactive({
        mobile:'',//手机号
        smsCode:'',//短信验证码
        captchaValue:'',//验证码
    })

    //下拉刷新时触发
    const onRefresh = () => {
        form.isRefreshing = false;

        //重置
        form.mobile = '';//手机号
        form.smsCode = '';//短信验证码
        form.showCaptcha = true;//是否显示验证码
        form.captchaKey = '';//验证码key
        form.captchaValue = '';//验证码值
        form.imgUrl = '';//验证码图片
        form.allowSubmit = false;//提交按钮disabled状态
        form.allowSmsCodeSubmit = false;//提交按钮disabled状态
        form.successInfo = '';

        form.timer = '' as any;//计时器对象
        form.countdownText = '';//倒计时文本
        form.counter = 0;//计数器

        form.lastMobile = '';//上次获取验证码提交的手机号

        init();
    };

    //查询更换绑定手机第二步
    const queryUpdatePhoneBinding_step2 = () => {
        proxy?.$axios({
            url: '/user/control/updatePhoneBinding/step2',
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
    


    //获取短信验证码
    const getSmsCode = () => {
        form.allowSmsCodeSubmit = true;//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            // 局部表单验证
            formRef.value.validate('mobile').then(() => {
                resolve();
            }).catch(() => {
                form.allowSmsCodeSubmit = false;//提交按钮disabled状态
            })
            formRef.value.validate('captchaValue').then(() => {
                resolve();
            }).catch(() => {
                form.allowSmsCodeSubmit = false;//提交按钮disabled状态
            })
        });

        Promise.all([p1])
            .then(() => {
                //清空error的属性值
                Object.keys(error).map(key => {
                    Object.assign(error, {[key] : ''});
                })
                form.successInfo = "";
                //设置按钮禁用状态
                form.allowSmsCodeSubmit = true;//提交按钮disabled状态

                let formData = new FormData();
                if(form.mobile != null && form.mobile.trim() != ''){
                    formData.append('mobile', form.mobile);
                }

                formData.append('module', '3');

                //验证码Key
                formData.append('captchaKey', form.captchaKey);
                //验证码值
                if(form.captchaValue != ''){
                    formData.append('captchaValue', form.captchaValue.trim());
                }

                proxy?.$axios({
                    url: '/user/control/getSmsCode',
                    method: 'post',
                    data: formData,
                    //showLoading: false,//是否显示加载图标
                    //loadingMask:false,// 是否显示遮罩层
                })
                .then((response: AxiosResponse) => {
                    if(response){
                        const result: any = response.data;
                        let data = JSON.parse(result);
                        if(JSON.parse(data.success)){
                            form.successInfo = "短信验证码已发送";
                            countdown();
                            form.lastMobile = form.mobile.trim();
                        }else{
                            //处理错误信息
                            processErrorInfo(data.error as Map<string,string> , error,()=>{});
                            
                            if(data.captchaKey != null){
                                form.captchaKey = data.captchaKey;
                                replaceCaptcha();
                            }

                        }
                    }
                    
                    form.allowSmsCodeSubmit = false;//提交按钮disabled状态
                    form.showCaptcha = true;
                })
                .catch((error: any) =>{
                    console.log(error);
                });
            })
    }

    //倒计时
    const countdown = () => {
        form.counter = 60;//60秒
        form.countdownText = form.counter+"秒后可重新获取";

        form.timer = setInterval(() => {
          //替换文本
          form.countdownText = form.counter+"秒后可重新获取";
          form.counter--;
          if (form.counter < 0) {
            // 当计时小于零时，取消该计时器
            clearInterval(form.timer)
          }
        }, 1000)
    }

    //重置倒计时
    const resetCountdown = () => {
        form.successInfo = "";
        // 重置按钮可用
        form.allowSmsCodeSubmit = false,//提交按钮disabled状态
        // 重置文本内容
        form.countdownText = ''
        if (form.timer) {
            // 存在计时器对象，则清除
            clearInterval(form.timer)
            // 重置秒数
            form.counter = 0;
            // 计时器对象重置为空
            form.timer = null
        }
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

    //校验短信验证码
    const validatorSmsCode = (val:any) => {
        if(val != ''){
            if(val.length <6){
                error.smsCode = "验证码长度为6个字符"
                return false;
            }
        }else{
            error.smsCode = "短信验证码不能为空"
            return false;
        }
        error.smsCode = "";
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
            formRef.value.validate('mobile').then(() => {
                resolve();
            }).catch(() => {
                form.allowSubmit = false;//提交按钮disabled状态
            })
            formRef.value.validate('smsCode').then(() => {
                resolve();
            }).catch(() => {
                form.allowSubmit = false;//提交按钮disabled状态
            })
        });

        Promise.all([p1])
            .then(() => {
                //清空error的属性值
                Object.keys(error).map(key => {
                    Object.assign(error, {[key] : ''});
                })
            

                let formData = new FormData();
                if(form.mobile != null && form.mobile.trim() != ''){
                    formData.append('mobile', form.mobile);
                }
                formData.append('smsCode', form.smsCode);

                proxy?.$axios({
                    url: '/user/control/updatePhoneBinding/step2',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;
                        let jumpUrl = result.jumpUrl;
                        if(JSON.parse(result.success)){
                            Notify({ 
                                type: 'success', 
                                message: '提交成功，3秒后自动跳转到实名认证页',
                                onOpened: ()=>{
                                    router.push({
                                        path : '/user/control/realNameAuthentication'
                                    });
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
        if(to.name == 'updatePhoneBinding_step2'){
            queryUpdatePhoneBinding_step2();
        }
        
        next();
    });
    onMounted(() => {
        init();
        
    }) 

    //初始化
    const init = () => {
		queryUpdatePhoneBinding_step2();
        
	}
    
    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = '更换绑定手机第二步 - ' + titleValue;
        }
    })

</script>

<style scoped lang="scss">
.updatePhoneBindingModule{
    .container {
        .title{
            font-size: 15px;
            color: var(--van-gray-7);
            padding-left: 16px;
            line-height: 42px;
            margin: var(--van-cell-group-inset-padding);
            border-radius: var(--van-border-radius-lg);
            background: #fff;
        }
    }
    :deep(.van-cell-group--inset) {
        margin: 0px var(--van-cell-group-inset-padding);
        border-radius: var(--van-cell-group-inset-border-radius);
    }
}

</style>
