<!-- 注册页 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-nav-bar title="注册" left-text="返回" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                <template #right>
                    <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                </template>
            </van-nav-bar>
            <van-pull-refresh v-model="form.isRefreshing" success-text="刷新成功" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
            
                <div class="registerModule" v-if="form.allowRegisterAccount.local == true || form.allowRegisterAccount.mobile == true">
                    <van-tabs v-model:active="form.type" swipeable>
                        <van-tab title="账号密码注册" :name="10" v-if="form.allowRegisterAccount.local == true">
                            <van-form ref="formAccountRef" :scroll-to-error="true" class="form-container">
                                <van-cell-group inset>
                                    <van-field v-model.trim="form.account" name="account" label="账号" placeholder="请输入账号" maxlength="25" :show-word-limit="true" clearable :rules="[{ validator: validatorAccount }]" :error-message="error.account"/>
                                    <van-field v-model.trim="form.password" name="password" type="password" label="密码" placeholder="请输入密码" maxlength="20" clearable :rules="[{ validator: validatorPassword }]" :error-message="error.password"/>
                                    <van-field v-model.trim="form.confirmPassword" name="confirmPassword" type="password" label="确认密码" placeholder="请输入密码" maxlength="20" clearable :rules="[{ validator: validatorConfirmPassword }]" :error-message="error.confirmPassword"/>
                                    <van-field v-model.trim="form.issue" name="issue" label="密码提示问题" placeholder="请输入密码提示问题" maxlength="25" :show-word-limit="true" clearable :rules="[{ validator: validatorIssue }]" :error-message="error.issue"/>
                                    <van-field v-model.trim="form.answer" name="answer" label="密码提示答案" placeholder="请输入密码提示答案" maxlength="25" :show-word-limit="true" clearable :rules="[{ validator: validatorAnswer }]" :error-message="error.answer"/>
                                    <van-field v-model.trim="form.email" name="email" label="邮箱" placeholder="请输入邮箱" maxlength="60" :show-word-limit="true" clearable :error-message="error.email"/>
                                    
                                    <template v-for="(userCustom,index) in form.userCustomList">
                                        <div class="van-cell cell-field"  v-if="userCustom.chooseType ==1">
                                            <div :class="userCustom.required ? 'van-field__label--required' : ''" class="van-cell__title van-field__label cell-field-title">
                                                <span>{{userCustom.name}}</span>
                                            </div>
                                            <div class="van-cell__value">
                                                <span>
                                                    <van-field v-model="form.userBoundField[index]" :required="userCustom.required" placeholder="请输入" :maxlength="userCustom.maxlength" class="cell-field-value" clearable :error-message="error.userCustom.get('userCustom_'+userCustom.id)" />
                                                </span>
                                            </div>
                                            <div class="van-cell__label cell-field-label" v-if="userCustom.tip != null && userCustom.tip != ''" >
                                                {{userCustom.tip}}
                                            </div>
                                        </div>
                                        <div class="van-cell cell-field"  v-if="userCustom.chooseType ==2">
                                            <div :class="userCustom.required ? 'van-field__label--required' : ''" class="van-cell__title van-field__label cell-field-title">
                                                <span>{{userCustom.name}}</span>
                                            </div>
                                            <div class="van-cell__value">
                                                <span>
                                                    <van-field class="cell-field-value" :error-message="error.userCustom.get('userCustom_'+userCustom.id)">
                                                        <template #input>
                                                            <van-radio-group v-model="form.userBoundField[index]" direction="horizontal" >
                                                                <van-radio :name="key" v-for="(value, key) in userCustom.itemValue" :key="key">{{value}}</van-radio>
                                                            </van-radio-group>
                                                        </template>
                                                    </van-field>
                                                    
                                                </span>
                                            </div>
                                            <div class="van-cell__label cell-field-label" v-if="userCustom.tip != null && userCustom.tip != ''" >
                                                {{userCustom.tip}}
                                            </div>
                                        </div>
                                        <div class="van-cell cell-field"  v-if="userCustom.chooseType ==3">
                                            <div :class="userCustom.required ? 'van-field__label--required' : ''" class="van-cell__title van-field__label cell-field-title">
                                                <span>{{userCustom.name}}</span>
                                            </div>
                                            <div class="van-cell__value">
                                                <span>
                                                    <van-field class="cell-field-value" :error-message="error.userCustom.get('userCustom_'+userCustom.id)">
                                                        <template #input>
                                                            <van-checkbox-group v-model="form.userBoundField[index]" direction="horizontal" >
                                                                <van-checkbox :name="key" v-for="(value, key) in userCustom.itemValue" :key="key" shape="square">{{value}}</van-checkbox>
                                                            </van-checkbox-group>
                                                        </template>
                                                    </van-field>
                                                    
                                                </span>
                                            </div>
                                            <div class="van-cell__label cell-field-label" v-if="userCustom.tip != null && userCustom.tip != ''" >
                                                {{userCustom.tip}}
                                            </div>
                                        </div>
                                        <div class="van-cell cell-field"  v-if="userCustom.chooseType ==4">
                                            <div :class="userCustom.required ? 'van-field__label--required' : ''" class="van-cell__title van-field__label cell-field-title">
                                                <span>{{userCustom.name}}</span>
                                            </div>
                                            <div class="van-cell__value">
                                                <span>
                                                    <van-field class="cell-field-value" v-if="!userCustom.multiple" :error-message="error.userCustom.get('userCustom_'+userCustom.id)">
                                                        <template #input>
                                                            <van-radio-group v-model="form.userBoundField[index]">
                                                                <van-radio :name="key" v-for="(value, key) in userCustom.itemValue" :key="key" class="cell-field-radio">{{value}}</van-radio>
                                                            </van-radio-group>
                                                        </template>
                                                    </van-field>
                                                    <van-field class="cell-field-value" v-if="userCustom.multiple" :error-message="error.userCustom.get('userCustom_'+userCustom.id)">
                                                        <template #input>
                                                            <van-checkbox-group v-model="form.userBoundField[index]">
                                                                <van-checkbox :name="key" v-for="(value, key) in userCustom.itemValue" :key="key" shape="square" class="cell-field-radio">{{value}}</van-checkbox>
                                                            </van-checkbox-group>
                                                        </template>
                                                    </van-field>
                                                </span>
                                            </div>
                                            <div class="van-cell__label cell-field-label" v-if="userCustom.tip != null && userCustom.tip != ''" >
                                                {{userCustom.tip}}
                                            </div>
                                        </div>
                                        <div class="van-cell cell-field"  v-if="userCustom.chooseType ==5">
                                            <div :class="userCustom.required ? 'van-field__label--required' : ''" class="van-cell__title van-field__label cell-field-title">
                                                <span>{{userCustom.name}}</span>
                                            </div>
                                            <div class="van-cell__value">
                                                <span>
                                                    <van-field v-model="form.userBoundField[index]" :required="userCustom.required" placeholder="请输入" :maxlength="userCustom.maxlength" :rows="userCustom.rows" type="textarea" autosize class="cell-field-value" clearable :error-message="error.userCustom.get('userCustom_'+userCustom.id)" />
                                                </span>
                                            </div>
                                            <div class="van-cell__label cell-field-label" v-if="userCustom.tip != null && userCustom.tip != ''" >
                                                {{userCustom.tip}}
                                            </div>
                                        </div>
                                    </template>
                                    <van-field v-model="form.captchaValue"  name="captchaValue" v-if="form.showCaptcha" class="captcha-item captcha-input-left" label="验证码" placeholder="输入验证码" maxlength="4" center clearable :rules="[{ validator: checkCaptchaValue }]" :error-message="error.captchaValue">
                                        <template #button>
                                            <van-image :src="form.imgUrl" @click="replaceCaptcha" class="captcha-image"/>
                                        </template>
                                        <template #extra >
                                            <span class="captcha-replace" @click="replaceCaptcha">换一幅</span>
                                        </template>
                                    </van-field>

                                    <van-field name="agreement" label="服务条款" :rules="[{ validator: validatorAgreement}]" :error-message="error.agreement">
                                        <template #input>
                                            <van-switch v-model="form.agreement" :size="convertViewportWidth('18px')">
                                                <template #node>
                                                    <span class="agreement-icon-wrapper">
                                                        <van-icon :name="form.agreement ? 'success' : 'cross'" />
                                                    </span>
                                                    
                                                </template>
                                            </van-switch>
                                            
                                            <span class="agreement">
                                                接受《<router-link to="/termsService" tag="span" class="link">服务协议</router-link>》条款
                                            </span>
                                        </template>
                                    </van-field>

                                </van-cell-group>
                                <div class="submitButton">
                                    <van-button round block type="primary" native-type="submit" @mousedown="onSubmit" :disabled="form.allowSubmit">提交</van-button>
                                </div>
                            </van-form>
                        </van-tab>
                        <van-tab title="手机号注册" :name="20" v-if="form.allowRegisterAccount.mobile == true">
                            <van-form ref="formMobileRef" :scroll-to-error="true" class="form-container">
                                <van-cell-group inset>
                                    <van-field v-model.trim="form.mobile" name="mobile" label="手机号" placeholder="请输入手机" maxlength="11"  type="tel" clearable :rules="[{ validator: validatorMobile }]" :error-message="error.mobile"/>
                                    <van-field v-model.trim="form.password" name="password"  type="password" label="密码" placeholder="请输入密码" maxlength="20" clearable :rules="[{ validator: validatorPassword }]" :error-message="error.password"/>
                                    <van-field v-model.trim="form.confirmPassword" name="confirmPassword" type="password" label="确认密码" placeholder="请输入密码"  maxlength="20" clearable :rules="[{ validator: validatorConfirmPassword }]" :error-message="error.confirmPassword"/>
                                    <template v-for="(userCustom,index) in form.userCustomList">
                                        <div class="van-cell cell-field"  v-if="userCustom.chooseType ==1">
                                            <div :class="userCustom.required ? 'van-field__label--required' : ''" class="van-cell__title van-field__label cell-field-title">
                                                <span>{{userCustom.name}}</span>
                                            </div>
                                            <div class="van-cell__value">
                                                <span>
                                                    <van-field v-model="form.userBoundField[index]" :required="userCustom.required" placeholder="请输入" :maxlength="userCustom.maxlength" class="cell-field-value" clearable :error-message="error.userCustom.get('userCustom_'+userCustom.id)" />
                                                </span>
                                            </div>
                                            <div class="van-cell__label cell-field-label" v-if="userCustom.tip != null && userCustom.tip != ''" >
                                                {{userCustom.tip}}
                                            </div>
                                        </div>
                                        <div class="van-cell cell-field"  v-if="userCustom.chooseType ==2">
                                            <div :class="userCustom.required ? 'van-field__label--required' : ''" class="van-cell__title van-field__label cell-field-title">
                                                <span>{{userCustom.name}}</span>
                                            </div>
                                            <div class="van-cell__value">
                                                <span>
                                                    <van-field class="cell-field-value" :error-message="error.userCustom.get('userCustom_'+userCustom.id)">
                                                        <template #input>
                                                            <van-radio-group v-model="form.userBoundField[index]" direction="horizontal" >
                                                                <van-radio :name="key" v-for="(value, key) in userCustom.itemValue" :key="key">{{value}}</van-radio>
                                                            </van-radio-group>
                                                        </template>
                                                    </van-field>
                                                    
                                                </span>
                                            </div>
                                            <div class="van-cell__label cell-field-label" v-if="userCustom.tip != null && userCustom.tip != ''" >
                                                {{userCustom.tip}}
                                            </div>
                                        </div>
                                        <div class="van-cell cell-field"  v-if="userCustom.chooseType ==3">
                                            <div :class="userCustom.required ? 'van-field__label--required' : ''" class="van-cell__title van-field__label cell-field-title">
                                                <span>{{userCustom.name}}</span>
                                            </div>
                                            <div class="van-cell__value">
                                                <span>
                                                    <van-field class="cell-field-value" :error-message="error.userCustom.get('userCustom_'+userCustom.id)">
                                                        <template #input>
                                                            <van-checkbox-group v-model="form.userBoundField[index]" direction="horizontal" >
                                                                <van-checkbox :name="key" v-for="(value, key) in userCustom.itemValue" :key="key" shape="square">{{value}}</van-checkbox>
                                                            </van-checkbox-group>
                                                        </template>
                                                    </van-field>
                                                    
                                                </span>
                                            </div>
                                            <div class="van-cell__label cell-field-label" v-if="userCustom.tip != null && userCustom.tip != ''" >
                                                {{userCustom.tip}}
                                            </div>
                                        </div>
                                        <div class="van-cell cell-field"  v-if="userCustom.chooseType ==4">
                                            <div :class="userCustom.required ? 'van-field__label--required' : ''" class="van-cell__title van-field__label cell-field-title">
                                                <span>{{userCustom.name}}</span>
                                            </div>
                                            <div class="van-cell__value">
                                                <span>
                                                    <van-field class="cell-field-value" v-if="!userCustom.multiple" :error-message="error.userCustom.get('userCustom_'+userCustom.id)">
                                                        <template #input>
                                                            <van-radio-group v-model="form.userBoundField[index]">
                                                                <van-radio :name="key" v-for="(value, key) in userCustom.itemValue" :key="key" class="cell-field-radio">{{value}}</van-radio>
                                                            </van-radio-group>
                                                        </template>
                                                    </van-field>
                                                    <van-field class="cell-field-value" v-if="userCustom.multiple" :error-message="error.userCustom.get('userCustom_'+userCustom.id)">
                                                        <template #input>
                                                            <van-checkbox-group v-model="form.userBoundField[index]">
                                                                <van-checkbox :name="key" v-for="(value, key) in userCustom.itemValue" :key="key" shape="square" class="cell-field-radio">{{value}}</van-checkbox>
                                                            </van-checkbox-group>
                                                        </template>
                                                    </van-field>
                                                </span>
                                            </div>
                                            <div class="van-cell__label cell-field-label" v-if="userCustom.tip != null && userCustom.tip != ''" >
                                                {{userCustom.tip}}
                                            </div>
                                        </div>
                                        <div class="van-cell cell-field"  v-if="userCustom.chooseType ==5">
                                            <div :class="userCustom.required ? 'van-field__label--required' : ''" class="van-cell__title van-field__label cell-field-title">
                                                <span>{{userCustom.name}}</span>
                                            </div>
                                            <div class="van-cell__value">
                                                <span>
                                                    <van-field v-model="form.userBoundField[index]" :required="userCustom.required" placeholder="请输入" :maxlength="userCustom.maxlength" :rows="userCustom.rows" type="textarea" autosize class="cell-field-value" clearable :error-message="error.userCustom.get('userCustom_'+userCustom.id)" />
                                                </span>
                                            </div>
                                            <div class="van-cell__label cell-field-label" v-if="userCustom.tip != null && userCustom.tip != ''" >
                                                {{userCustom.tip}}
                                            </div>
                                        </div>
                                    </template>
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
                                    <van-field v-model="form.captchaValue" name="captchaValue" v-if="form.showCaptcha" class="captcha-item captcha-input-left" label="验证码" placeholder="输入验证码" maxlength="4" center clearable :rules="[{ validator: checkCaptchaValue }]" :error-message="error.captchaValue">
                                        <template #button>
                                            <van-image :src="form.imgUrl" @click="replaceCaptcha" class="captcha-image"/>
                                        </template>
                                        <template #extra >
                                            <span class="captcha-replace" @click="replaceCaptcha">换一幅</span>
                                        </template>
                                    </van-field>
                                    <van-field name="agreement" label="服务条款" :rules="[{ validator: validatorAgreement}]" :error-message="error.agreement">
                                        <template #input>
                                            <van-switch v-model="form.agreement" :size="convertViewportWidth('18px')">
                                                <template #node>
                                                    <span class="agreement-icon-wrapper">
                                                        <van-icon :name="form.agreement ? 'success' : 'cross'" />
                                                    </span>
                                                    
                                                </template>
                                            </van-switch>
                                            
                                            <span class="agreement">
                                                接受《<router-link to="/termsService" tag="span" class="link">服务协议</router-link>》条款
                                            </span>
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
            <div v-if="form.allowRegisterAccount.local == false &&  form.allowRegisterAccount.mobile == false">
                <div class="resultModule">
                    <div class="result">
                        <div class="result-icon">
                            <van-icon name="warning" class="icon-warning" size="64px"/>
                        </div>
                        <div class="result-title">
                            <p>已关闭注册</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, ref, onUnmounted, watchEffect, onActivated} from 'vue'
    import { onBeforeRouteUpdate, useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { processErrorInfo} from '@/utils/tool';
    import { AllowRegisterAccount, UserCustom } from '@/types';
    import { SHA256} from 'crypto-js';
    import { jumpDataFormat } from '@/utils/jumpProcess';
    import { generateUUID } from '@/utils/uuid';
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { Notify } from 'vant'
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
            document.title = '注册 - ' + titleValue;
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })

    const form = reactive({
        type:10,//类型 10.账号密码注册 20.手机号注册
        userCustomList: {} as Array<UserCustom>,//用户自定义注册功能项
        userBoundField : [] as any, //用户自定义注册功能项绑定
        allowRegisterAccount: {} as AllowRegisterAccount,//允许注册账号类型

        account:'',//账号
        mobile:'',//手机号
        password:'',//密码
        confirmPassword:'',//确认密码
        issue:'',//密码提示问题
        answer:'',//密码提示答案
        email:'',//邮箱
        showCaptcha:true,//是否显示验证码
        captchaKey: '',//验证码key
        captchaValue: '',//验证码值
        imgUrl: '',//验证码图片
        agreement : true, //是否同意服务协议
        allowSubmit:false,//提交按钮disabled状态

        
        isRegisterCaptcha:false,//如果注册需要验证码(仅账号密码注册类型有效)
        allowSmsCodeSubmit:false,//提交按钮disabled状态
        successInfo: '',
        smsCode:'',//短信验证码
        timer: '' as any,//计时器对象
        countdownText: '',//倒计时文本
        counter: 0,//计数器

        isRefreshing:false,//是否处于下拉加载中状态
    });

    //错误
    const error = reactive({
        account:'',//账号
        mobile:'',//手机号
        password:'',//密码
        confirmPassword:'',//确认密码
        issue:'',//密码提示问题
        answer:'',//密码提示答案
        email:'',//邮箱
        captchaValue:'',//验证码
        smsCode:'',//短信验证码
        agreement : '', //是否同意服务协议
        userCustom:new Map(),
    })


     //下拉刷新时触发
     const onRefresh = () => {
        form.isRefreshing = false;

        //重置
        form.type = 10;//类型 10.账号密码注册 20.手机号注册
        form.userCustomList.length = 0;//用户自定义注册功能项
        form.userBoundField.length = 0; //用户自定义注册功能项绑定
        form.allowRegisterAccount =  {} as AllowRegisterAccount;//允许注册账号类型

        form.account = '';//账号
        form.mobile = '';//手机号
        form.password = '';//密码
        form.confirmPassword = '';//确认密码
        form.issue = '';//密码提示问题
        form.answer = '';//密码提示答案
        form.email = '';//邮箱
        form.showCaptcha = true;//是否显示验证码
        form.captchaKey =  '';//验证码key
        form.captchaValue =  '';//验证码值
        form.imgUrl =  '';//验证码图片
        form.agreement = true; //是否同意服务协议
        form.allowSubmit = false;//提交按钮disabled状态

        
        form.isRegisterCaptcha = false;//如果注册需要验证码(仅账号密码注册类型有效)
        form.allowSmsCodeSubmit = false;//提交按钮disabled状态
        form.successInfo =  '';
        form.smsCode = '';//短信验证码
        form.timer =  '' as any;//计时器对象
        form.countdownText =  '';//倒计时文本
        form.counter =  0;//计数器
        
        init();
    };

    //查询注册页
    const queryRegister = () => {
        proxy?.$axios({
            url: '/register',
            method: 'get',
            params:  { 
               
            },
            //showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                form.userCustomList = result.userCustomList;//用户自定义注册功能项
                form.allowRegisterAccount = result.allowRegisterAccount;//允许注册账号类型
                form.captchaKey = result.captchaKey;
                if(form.captchaKey != null && form.captchaKey != ''){
                    form.isRegisterCaptcha = true;
                }else{
                    form.isRegisterCaptcha = false;
                }
            
                //绑定字段
                if(form.userCustomList != null && form.userCustomList.length >0){
                    for (let i = 0; i < form.userCustomList.length; i++) {
                        let userCustom = form.userCustomList[i];
                        boundField(userCustom);
                    }
                }

                if(form.allowRegisterAccount.local == false || form.allowRegisterAccount.mobile == false){
                    if(form.allowRegisterAccount.local == true){
                        form.type = 10;
                    }
                    if(form.allowRegisterAccount.mobile == true){
                        form.type = 20;
                    }
                }
                if(form.type == 10){
                    if(form.isRegisterCaptcha){
                        form.showCaptcha = true;
                        replaceCaptcha();
                    }else{
                        form.showCaptcha = false;
                    }
                }else if(form.type == 20){
                    if(form.captchaKey == null || form.captchaKey == ''){
                        form.captchaKey = generateUUID();
                    }

                    form.showCaptcha = true;
                    replaceCaptcha();
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //绑定字段
    const boundField = (userCustom:UserCustom) => {
        if (userCustom.chooseType == 1) { //文本框
            let content = "";
            for (let i = 0; i < userCustom.userInputValueList.length; i++) {
                content = userCustom.userInputValueList[i].content;
            }
            form.userBoundField.push(content);
        } else if (userCustom.chooseType == 2) { //单选框
            let checked = "";

            for (let i = 0; i < userCustom.userInputValueList.length; i++) {
                let userInputValue = userCustom.userInputValueList[i];
                checked = userInputValue.options;

            }
            //默认选第一项 
            if (checked == "") {
                for (let itemValue in userCustom.itemValue) {
                    checked = itemValue;
                    break;
                }
            }
            form.userBoundField.push(checked);
        }else if (userCustom.chooseType == 3) { //多选框
            let checked = new Array();

            for (let i = 0; i < userCustom.userInputValueList.length; i++) {
                let userInputValue = userCustom.userInputValueList[i];
                checked.push(userInputValue.options);
            }
            form.userBoundField.push(checked);
        }else if (userCustom.chooseType == 4) { //下拉列表
            if (userCustom.multiple == true) { //允许多选
                let checked = new Array();

                A:for (let itemValue in userCustom.itemValue) {
                    for (let i = 0; i < userCustom.userInputValueList.length; i++) {
                        let userInputValue = userCustom.userInputValueList[i];
                        if (itemValue == userInputValue.options) {
                            checked.push(itemValue);
                            continue A;
                        }
                    }
                }
                form.userBoundField.push(checked);

            } else {
                
                let checked = "";

                A:for (let itemValue in userCustom.itemValue) {
                    for (let i = 0; i < userCustom.userInputValueList.length; i++) {
                        let userInputValue = userCustom.userInputValueList[i];
                        if (itemValue == userInputValue.options) {
                            checked = itemValue;
                            break A;
                        }
                    }
                }
                form.userBoundField.push(checked);
            }


        }else if (userCustom.chooseType == 5) { //文本域
            let content = "";
            for (let i = 0; i < userCustom.userInputValueList.length; i++) {
                content = userCustom.userInputValueList[i].content;
            }
            form.userBoundField.push(content);
        }

    }


    //获取短信验证码
    const getSmsCode = () => {
        form.allowSmsCodeSubmit = true;//提交按钮disabled状态
        
        const p1 = new Promise<void>((resolve, reject) => {
            // 局部表单验证
            formMobileRef.value.validate('mobile').then(() => {
                resolve();
            }).catch(() => {
                form.allowSmsCodeSubmit = false;//提交按钮disabled状态
            })
            formMobileRef.value.validate('captchaValue').then(() => {
                resolve();
            }).catch(() => {
                form.allowSmsCodeSubmit = false;//提交按钮disabled状态
            })
        });

        Promise.all([p1])
            .then(() => {
            new Promise((resolve) => {
                //清空error的属性值
                for (const [key, value] of Object.entries(error) as [string, string|Map<string,string>][]){
                    if(value instanceof Map){
                        value.clear();
                    }else{
                        Object.assign(error, {[key] : ''});
                    }
                }
                form.successInfo = "";
                //设置按钮禁用状态
                form.allowSmsCodeSubmit = true;//提交按钮disabled状态

                let formData = new FormData();
                if(form.mobile != null && form.mobile.trim() != ''){
                    formData.append('mobile', form.mobile);
                }

                formData.append('module', '100');

                //验证码Key
                formData.append('captchaKey', form.captchaKey);
                //验证码值
                if(form.captchaValue != ''){
                    formData.append('captchaValue', form.captchaValue.trim());
                }
                proxy?.$axios({
                    url: '/smsCode',
                    method: 'post',
                    data: formData,
                    //showLoading: false,//是否显示加载图标
                    //loadingMask:false,// 是否显示遮罩层
                })
                .then((response: AxiosResponse) => {
                    const result: any = response.data;
      
                    if(JSON.parse(result.success)){
                        form.successInfo = "短信验证码已发送";
                        countdown();
                        error.smsCode = "";
                        resolve(true);
                    }else{
                        //处理错误信息
                        processErrorInfo(result.error as Map<string,string> , error,()=>{});
                        
                        if(result.captchaKey != null){
                            form.captchaKey = result.captchaKey;
                            replaceCaptcha();
                        }
                        resolve(false);
                    }
                    form.allowSmsCodeSubmit = false;//提交按钮disabled状态
                    form.showCaptcha = true;
                })
                .catch((error: any) =>{
                    console.log(error);
                });
            })
        });
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
    //校验密码
    const validatorPassword = (val:any):boolean => {
        if(val != ''){
            if(val.length <7){
                error.password = "密码长度不能小于7个字符"
                return false;
            }
        }else{
            error.password = "密码不能为空"
            return false;
        }
        error.password = "";
        return true;
    }
    //校验确认密码
    const validatorConfirmPassword = (val:any):boolean => {
        if(val != ''){
            if(val.length <7){
                error.confirmPassword = "密码长度不能小于7个字符"
                return false;
            }else{
                if(form.password != val){
                    error.confirmPassword = "两次输入密码不相等"
                    return false;
                }
            }
        }else{
            error.confirmPassword = "密码不能为空"
            return false;
        }
        error.confirmPassword = "";
        return true;
    }

    //校验密码提示问题
    const validatorIssue = (val:any):boolean => {
        if(val != ''){
            if(val.length <7){
                error.issue = "密码提示问题不能小于7个字符"
                return false;
            }
        }else{
            error.issue = "密码提示问题不能为空"
            return false;
        }
        error.issue = "";
        return true;
    }
    //校验密码提示答案
    const validatorAnswer = (val:any):boolean => {
        if(val != ''){
            if(val.length <7){
                error.answer = "密码提示答案不能小于7个字符"
                return false;
            }
        }else{
            error.answer = "密码提示答案不能为空"
            return false;
        }
        error.answer = "";
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
   
     //校验服务条款
     const validatorAgreement = (val:any):boolean => {
        if(val != true){
            error.agreement = "同意服务条款才能注册"
            return false;
        }
        error.agreement = "";
        return true;
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
                // 局部表单验证
                formMobileRef.value.validate('mobile').then(() => {
                    resolve();
                }).catch(() => {
                    form.allowSubmit = false;//提交按钮disabled状态
                })
                formMobileRef.value.validate('password').then(() => {
                    resolve();
                }).catch(() => {
                    form.allowSubmit = false;//提交按钮disabled状态
                })
                formMobileRef.value.validate('confirmPassword').then(() => {
                    resolve();
                }).catch(() => {
                    form.allowSubmit = false;//提交按钮disabled状态
                })
                formMobileRef.value.validate('smsCode').then(() => {
                    resolve();
                }).catch(() => {
                    form.allowSubmit = false;//提交按钮disabled状态
                })
                formMobileRef.value.validate('agreement').then(() => {
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
                for (const [key, value] of Object.entries(error) as [string, string|Map<string,string>][]){
                    if(value instanceof Map){
                        value.clear();
                    }else{
                        Object.assign(error, {[key] : ''});
                    }
                }

                let formData = new FormData();
                if(form.type == 10){//10:本地账号密码用户
                    formData.append('type', String(form.type));
                    //账号
                    if(form.account != ''){
                        formData.append('account', form.account);
                    }
                    //密码提示问题
                    if(form.issue != null && form.issue.trim() != ''){
                        formData.append('issue', form.issue);
                    }
                    
                    //密码提示答案
                    if(form.answer != null && form.answer.trim() != ''){
                        formData.append('answer', SHA256(form.answer.trim()).toString());
                    }

                    //邮箱
                    if(form.email != null && form.email.trim() != ''){
                        formData.append('email', form.email);
                    }

                }else if(form.type == 20){//20: 手机用户
                    formData.append('type', String(form.type));
                    //手机号
                    if(form.mobile != ''){
                        formData.append('mobile', form.mobile);
                    }


                    formData.append('smsCode', form.smsCode);

                }


                //密码需SHA256加密
                 if(form.password != null && form.password.trim() != ''){
                    let SHA256Value = SHA256(form.password.trim()).toString();
                    formData.append('password', SHA256Value);
                }


                if (form.userCustomList != null && form.userCustomList.length > 0) {
                    for (let i = 0; i < form.userCustomList.length; i++) {
                        let userCustom = form.userCustomList[i];
                        
                        var fieldValue = form.userBoundField[i];

                        if (userCustom.chooseType == 1) { //文本框
                            formData.append('userCustom_'+ userCustom.id, fieldValue);
                        } else if (userCustom.chooseType == 2) { //单选框
                            formData.append('userCustom_'+ userCustom.id, fieldValue);
                        } else if (userCustom.chooseType == 3) { //多选框
                            for (var value in fieldValue) {
                                formData.append('userCustom_'+ userCustom.id, fieldValue[value]);
                            }
                        } else if (userCustom.chooseType == 4) { //下拉列表
                            if (userCustom.multiple == true) { //允许多选
                                for (var value in fieldValue) {
                                    formData.append('userCustom_'+ userCustom.id, fieldValue[value]);
                                }
                            }else{
                                formData.append('userCustom_'+ userCustom.id, fieldValue);
                                
                            }
                        } else if (userCustom.chooseType == 5) { //文本域
                            formData.append('userCustom_'+ userCustom.id, fieldValue);
                        }
                        
                        
                    }
                }


                //url跳转参数
                let jumpUrl:string = router.currentRoute.value.query.jumpUrl != undefined ? router.currentRoute.value.query.jumpUrl as string : '';
                if (jumpUrl != null && jumpUrl != '') {
                    formData.append('jumpUrl', jumpUrl);
                }

                //验证码Key
                formData.append('captchaKey', form.captchaKey);
                //验证码值
                if(form.captchaValue != ''){
                    formData.append('captchaValue', form.captchaValue.trim());
                }

                proxy?.$axios({
                    url: '/register',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){
                        const result: any = response.data;
                        if(JSON.parse(result.success)){
                            Notify({ 
                                type: 'success', 
                                message: '注册成功'
                            });

                            let jumpUrl = result.jumpUrl;
                            let systemUser = result.systemUser;
                            let accessToken = result.accessToken;
                            let refreshToken = result.refreshToken;

                            //访问令牌和刷新令牌存储到localStorage
                            window.localStorage.setItem("bbsToken", JSON.stringify({accessToken : accessToken, refreshToken : refreshToken}));

                            store_systemUser.value = systemUser;
                            
                            if (jumpUrl != null && jumpUrl != '' && jumpUrl != 'index') {

                                let decryptObject = jumpDataFormat(jumpUrl);
                                if(decryptObject.path == "/register"){
                                    router.push("/index");
                                }else{
                                    router.push({
                                        path : decryptObject.path,
                                        query: decryptObject.query
                                    });
                                }
                                

                            } else {
                                router.push("/index");
                            }
                            
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
        if(to.name == 'register'){
            queryRegister();
        }
        
        next();
    });
    onMounted(() => {
        init();
        
        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))
    }) 

    //初始化
    const init = () => {
		queryRegister();
        
	}
    //卸载组件实例后调用
    onUnmounted (()=>{
        if(form.timer != null){
            clearInterval(form.timer); //销毁
            form.timer = null
        }
    })
    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = '注册 - ' + titleValue;
        }
    })
</script>
<style scoped lang="scss">
.registerModule{
    margin-top: var(--van-cell-group-inset-padding);
    :deep(.van-tabs--line .van-tabs__wrap) {
        margin-left: var(--van-cell-group-inset-padding);
        margin-right: var(--van-cell-group-inset-padding);
        padding-bottom: 8px;
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

    .agreement{
        margin-left: 6px;
        .link{
            color: var(--van-blue);
        }
    }
}


</style>
