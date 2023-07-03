<!-- 发表话题页 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-nav-bar title="发表话题" left-text="返回" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                <template #right>
                    <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                </template>
            </van-nav-bar>
            <van-pull-refresh v-model="form.isRefreshing" success-text="刷新成功" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
            
                <div class="addTopicModule" v-if="store_systemUser != null && Object.keys(store_systemUser).length>0">
                    <van-form ref="formRef" :scroll-to-error="true" class="form-container" v-if="form.allowTopic">
                        <van-cell-group inset>
                            <van-field v-model.trim="form.title" label="标题" placeholder="请输入标题" maxlength="90" clearable :rules="[{ validator: validatorTitle }]" :error-message="error.title"/>
                            <van-field v-model="form.tagName" is-link readonly label="标签" placeholder="选择标签" @click="onShowTagPicker" class="tagPopup" :error-message="error.tagId"/>
                            <van-popup v-model:show="form.showTagPicker" round position="bottom">
                               <van-picker :columns="form.options" @cancel="form.showTagPicker = false" :columns-field-names="{text: 'label'}" :loading="form.loading" :item-height="convertViewportWidth('44px')" :show-toolbar="false" @change="onTagChange" />
                            </van-popup>
                            
                            <van-field is-link readonly label="红包" v-if="form.showRedEnvelopeText" :class="form.showRedEnvelopeForm ? 'redEnvelope-arrow-down':'redEnvelope-arrow-right'" @click="redEnvelopeForm">
                                <template #input>
                                    
                                </template>
                            </van-field>


                            <div v-if="form.showRedEnvelopeForm">
                                <van-field label="红包类型">
                                    <template #input>
                                        <van-radio-group v-model="form.giveRedEnvelope_type" direction="horizontal" @change="selectRedEnvelopeType()">
                                            <van-radio :name="20">随机金额红包</van-radio>
                                            <van-radio :name="30">固定金额红包</van-radio>
                                        </van-radio-group>
                                    </template>
                                </van-field>

                                <div class="van-cell cell-field"  v-if="form.giveRedEnvelope_type == 20">
                                    <div class="van-cell__title van-field__label cell-field-title">
                                        <span>红包总金额</span>
                                    </div>
                                    <div class="van-cell__value">
                                        <span>
                                            <van-field v-model.trim="form.giveRedEnvelope_totalAmount" placeholder="输入金额" @input="totalAmountCalculate()" maxlength="12" class="cell-field-value" :formatter="amountFormat" clearable :error-message="error.totalAmount"/>
                                        </span>
                                    </div>
                                    <div class="van-cell__label cell-field-label">
                                        <span class="help-text">
                                            <span v-if="parseFloat(form.giveRedEnvelopeAmountMin) >0">合计总金额不能少于 {{form.giveRedEnvelopeAmountMin}} 元；</span>	
                                            <span v-if="form.giveRedEnvelopeAmountMax != null && parseFloat(form.giveRedEnvelopeAmountMax) >0">合计总金额不能超过 {{form.giveRedEnvelopeAmountMax}} 元；</span>	
                                            <span>用户共有金额 {{form.deposit}} 元</span>
                                        </span>
                                    </div>
                                </div>

                                <div class="van-cell cell-field"  v-if="form.giveRedEnvelope_type == 30">
                                    <div class="van-cell__title van-field__label cell-field-title">
                                        <span>单个红包金额</span>
                                    </div>
                                    <div class="van-cell__value">
                                        <span>
                                            <van-field v-model.trim="form.giveRedEnvelope_singleAmount" placeholder="输入金额" @input="singleAmountCalculate()" maxlength="12"  class="cell-field-value" :formatter="amountFormat" clearable :error-message="error.singleAmount"/>
                                        </span>
                                    </div>
                                    <div class="van-cell__label cell-field-label">
                                        <span class="help-text">
                                            <span v-if="parseFloat(form.giveRedEnvelopeAmountMin) >0">合计总金额不能少于 {{form.giveRedEnvelopeAmountMin}} 元；</span>	
                                            <span v-if="form.giveRedEnvelopeAmountMax != null && parseFloat(form.giveRedEnvelopeAmountMax) >0">合计总金额不能超过 {{form.giveRedEnvelopeAmountMax}} 元；</span>	
                                            <span>用户共有金额 {{form.deposit}} 元</span>
                                        </span>
                                    </div>
                                </div>
                                <van-field v-model.trim="form.giveRedEnvelope_giveQuantity" type="digit" label="红包数量" placeholder="输入数量" @input="singleAmountCalculate()" maxlength="8" clearable :error-message="error.giveQuantity"/>
                            
                                <van-field label="合计总金额" center :error-message="error.redEnvelopeLimit">
                                    <template #input>
                                        {{form.giveRedEnvelope_totalAmountView}}
                                    </template>
                                </van-field>
                            </div>

                            <van-field center :error-message="error.content">
                                <template #input>
                                    <div style="margin-left: -5px;width: 100%;" :style="form.editorIconCount < 10 ? 'margin-left:0px;' : ''">
                                        <van-sticky :z-index="1" >
                                            <div ref="topicContentEditorToolbarRef" class="editor-toolbar" style="padding-top: 5px;margin-left: -7px;"></div>
                                        </van-sticky>
                                        <div ref="topicContentEditorTextRef"  class="editor-text" style="min-height: 320px;"></div>
                                    </div>
                                </template>
                            </van-field>


                            <van-field v-model="form.captchaValue" v-if="form.showCaptcha" class="captcha-item captcha-input-left" label="验证码" placeholder="请输入验证码" maxlength="4" center clearable :rules="[{ validator: checkCaptchaValue }]" :error-message="error.captchaValue">
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

                    <div class="resultModule" v-if="!form.allowTopic">
                        <div class="result">
                            <div class="result-icon">
                                <van-icon name="warning" class="icon-warning" size="64px"/>
                            </div>
                            <div class="result-title">
                                <p>发表话题功能已关闭</p>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="addTopicModule" v-if="store_systemUser == null || Object.keys(store_systemUser).length ==0">
                    <van-skeleton :row="3" class="skeleton"/>
                </div>
            </van-pull-refresh>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, ref, onUnmounted, nextTick, watchEffect, onActivated} from 'vue'
    import { onBeforeRouteUpdate, useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { calc_add, calc_multiply, getPageBasePath,processErrorInfo} from '@/utils/tool';
    import { Tag } from '@/types';
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { Notify } from 'vant'
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { createEditor, destroyEditor } from '@/utils/editor';
    
  
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
    const formRef = ref();
    const topicContentEditorToolbarRef = ref();
    const topicContentEditorTextRef = ref();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)

 
    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = '发表话题 - ' + titleValue;
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })
    
    //Select 选择器选项
    interface OptionsItem {
        value: string;
        label: string;
    }
    //表单
    const form = reactive({
        tagList:[] as Array<Tag>,//标签
        deposit:'',//用户共有预存款
        allowTopic:true,//是否允许提交话题
        giveRedEnvelopeAmountMin:'',//发红包金额下限
        giveRedEnvelopeAmountMax:'',//发红包金额上限  空为无限制 0则不允许发红包 
        userGradeList:[],//用户等级
        availableTag:[],//话题编辑器允许使用标签
        editorIconCount:0,//富文本框图标数量
        fileSystem:0,//文件存储系统

        showRedEnvelopeText:false,//显示发红包按钮
        showRedEnvelopeForm:false,//显示发红包表单
        giveRedEnvelope_type:20, //发红包类型
		giveRedEnvelope_totalAmount:'',//红包总金额
		giveRedEnvelope_singleAmount:'',//红包单个金额
		giveRedEnvelope_giveQuantity:'',//红包数量
		giveRedEnvelope_totalAmountView:'0.00',//红包合计总金额

        isAllowLoadTagGroup:true,//是否允许加载标签组
        loading :false,//是否正在从远程获取数据
        options: [] as Array<OptionsItem>,//Select 选择器标签数据

        tagId:'',//标签Id
        tagName:'',//标签名称
        title:'',//标题
        content:'',//内容
        showTagPicker:false,//是否显示标签选项

        showCaptcha:false,//是否显示验证码
        captchaKey: '',//验证码key
        captchaValue: '',//验证码值
        imgUrl: '',//验证码图片
        allowSubmit:false,//提交按钮disabled状态

        addTopicEditor :{} as any,//添加话题编辑器
		addTopicEditorCreateParameObject :{} as any,//添加话题编辑器的创建参数

        isRefreshing:false,//是否处于下拉加载中状态
    })
    //错误
    const error = reactive({
        tagId:'',//标签Id
        title:'',//标题
        content:'',//内容
        totalAmount:'',//红包总金额
        singleAmount:'',//单个红包金额
		giveQuantity: '',//红包数量
		redEnvelopeLimit: '',//合计总金额
        captchaValue:'',//验证码
    })

    //下拉刷新时触发
    const onRefresh = () => {
        form.isRefreshing = false;

        //重置
        form.tagList.length = 0;//标签
        form.deposit = '';//用户共有预存款
        form.allowTopic = true;//是否允许提交话题
        form.giveRedEnvelopeAmountMin = '';//发红包金额下限
        form.giveRedEnvelopeAmountMax = '';//发红包金额上限  空为无限制 0则不允许发红包 
        form.userGradeList.length= 0;//用户等级
        form.availableTag.length= 0;//话题编辑器允许使用标签
        form.fileSystem = 0;//文件存储系统

        form.showRedEnvelopeText = false;//显示发红包按钮
        form.showRedEnvelopeForm = false;//显示发红包表单
        form.giveRedEnvelope_type = 20; //发红包类型
		form.giveRedEnvelope_totalAmount = '';//红包总金额
		form.giveRedEnvelope_singleAmount = '';//红包单个金额
		form.giveRedEnvelope_giveQuantity = '';//红包数量
		form.giveRedEnvelope_totalAmountView = '0.00';//红包合计总金额

        form.isAllowLoadTagGroup = true;//是否允许加载标签组
        form.loading = false;//是否正在从远程获取数据
        form.options.length = 0;//Select 选择器标签数据

        form.tagId = '';//标签Id
        form.tagName = '';//标签名称
        form.title = '';//标题
        form.content = '';//内容
        form.showTagPicker = false;//是否显示标签选项

        form.showCaptcha = false;//是否显示验证码
        form.captchaKey =  '';//验证码key
        form.captchaValue =  '';//验证码值
        form.imgUrl =  '';//验证码图片
        form.allowSubmit = false;//提交按钮disabled状态

        

        if (Object.keys(form.addTopicEditor).length != 0) {//不等于空
            destroyEditor(form.addTopicEditor);
            form.addTopicEditor = {};
        }
		form.addTopicEditorCreateParameObject = {} as any;//添加话题编辑器的创建参数
        
        init();
    };



    //显示标签选项
    const onShowTagPicker = () => {
        form.showTagPicker = true;
        //默认选中第一项
        if(form.tagId == null || form.tagId == ''){
            if(form.options != null && form.options.length >0){
                form.tagId = form.options[0].value; //标签Id
                form.tagName= form.options[0].label; //标签名称
            }
        }
    }
    //选择标签
    const onTagChange = (item:OptionsItem) => {
        form.tagId = item.value; //标签Id
        form.tagName= item.label; //标签名称
    };

   

    //查询标签
    const queryTagList = () => {
        if(!form.isAllowLoadTagGroup){
	        return;
	    }
        form.loading = true;

        proxy?.$axios({
            url: '/allTag',
            method: 'get',
            params:  {},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: Array<Tag>) => {
            if(data != null && data.length >0){
                for(let i=0; i<data.length; i++){
                    let tag = data[i];
                    let obj = {} as OptionsItem;
                    obj.value = tag.id;
                    obj.label = tag.name;
                    form.options.push(obj);
                }
                form.tagList = data;
            }
            form.isAllowLoadTagGroup = false;
            form.loading = false;
        })
        .catch((error: any) =>{
            console.log(error);
        });

    }

    //查询发表话题页
    const queryAddTopic = () => {
        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })
       

        proxy?.$axios({
            url: '/user/queryAddTopic',
            method: 'get',
            params:  {},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                
                form.allowTopic = data.allowTopic;//是否允许提交话题

                if(data.allowTopic){
                    form.deposit = data.deposit;//用户共有预存款
                    form.giveRedEnvelopeAmountMin = data.giveRedEnvelopeAmountMin;//发红包金额下限
                    form.giveRedEnvelopeAmountMax = data.giveRedEnvelopeAmountMax;//发红包金额上限  空为无限制 0则不允许发红包 
                    if(data.userGradeList != null && data.userGradeList != ''){
                        form.userGradeList = JSON.parse(data.userGradeList);//JSON转为对象
                    }
                    if(data.availableTag != null && data.availableTag != ''){
                        let availableTagObject = JSON.parse(data.availableTag);//JSON转为对象

                        let flag = false;
                        if(availableTagObject != null && availableTagObject.length >0){
                            for(let i=0; i< availableTagObject.length; i++){
                                let availableTag = availableTagObject[i];
                                if(availableTag == "hidePassword" || availableTag == "hideComment" ||
                                availableTag == "hideGrade" || availableTag == "hidePoint" || availableTag == "hideAmount"){
                                    availableTagObject.splice(i, 0, 'hide');//在指定索引处插入元素
                                    break;
                                }
                            }
                        }

                        form.availableTag = availableTagObject;//话题编辑器允许使用标签
                    }
                    
                    form.fileSystem = data.fileSystem;//文件存储系统

                    if(data.giveRedEnvelopeAmountMax == null || (data.giveRedEnvelopeAmountMax != null && parseInt(data.giveRedEnvelopeAmountMax) >0)){
                        //显示发红包
                        form.showRedEnvelopeText = true;
                    }

                    if (data.captchaKey != undefined && data.captchaKey != '') {
                        form.showCaptcha = true;
                        form.captchaKey = data.captchaKey;
                        replaceCaptcha();//刷新验证码
                    }

                    if (Object.keys(form.addTopicEditorCreateParameObject).length === 0) {//等于空
                        let uploadPath = "user/control/topic/upload?method=upload";

                        //编辑器图标
                        let editorIconList = new Array();
                        

                        for(let i=0; i<form.availableTag.length; i++){
							let _availableTag = form.availableTag[i];
							if(_availableTag == "code"){//代码
								editorIconList.push("code");
							}else if(_availableTag == "forecolor"){//文字颜色
							//	editorIconList.push("foreColor");
							}else if(_availableTag == "hilitecolor"){//文字背景
							//	editorIconList.push("backColor");
							}else if(_availableTag == "bold"){//粗体
								editorIconList.push("bold");
							}else if(_availableTag == "italic"){//斜体
								editorIconList.push("italic");
							}else if(_availableTag == "underline"){//下划线
								editorIconList.push("underline");
							}else if(_availableTag == "link"){//插入链接
								editorIconList.push("link");
							}else if(_availableTag == "emoticons"){//插入表情
								editorIconList.push("emoticon");
							}else if(_availableTag == "image"){//图片
								editorIconList.push("image");
							}else if(_availableTag == "media"){//视频
								editorIconList.push("video");
							}else if(_availableTag == "embedVideo"){//嵌入视频
								editorIconList.push("embedVideo");
							}else if(_availableTag == "uploadVideo"){//上传视频
								editorIconList.push("uploadVideo");
							}else if(_availableTag == "insertfile"){//文件
								editorIconList.push("file");
							}else if(_availableTag == "hidePassword"){//输入密码可见
								editorIconList.push("hidePassword");
							}else if(_availableTag == "hideComment"){//评论话题可见
								editorIconList.push("hideComment");
							}else if(_availableTag == "hideGrade"){//达到等级可见
								editorIconList.push("hideGrade");
							}else if(_availableTag == "hidePoint"){//积分购买可见
								editorIconList.push("hidePoint");
							}else if(_availableTag == "hideAmount"){//余额购买可见
								editorIconList.push("hideAmount");
							}
						}


                        for(let i=0; i< editorIconList.length; i++){
                            let editorIcon = editorIconList[i];
                            if(editorIcon == "hidePassword" || editorIcon == "hideComment" ||
                                    editorIcon == "hideGrade" || editorIcon == "hidePoint" || editorIcon == "hideAmount"){
                                editorIconList.splice(i, 0, 'hide');//在指定索引处插入元素
                                break;
                            }
                        }

                        
                        
                     //   topicContentEditorToolbarRef.value.innerHTML = "";
                     //   topicContentEditorTextRef.value.innerHTML = "";

                        
                        //创建富文本编辑器
                        form.addTopicEditor = createEditor(topicContentEditorToolbarRef.value,topicContentEditorTextRef.value,editorIconList, getPageBasePath()+'common/default/', uploadPath, form.userGradeList,form.fileSystem);
                        if (Object.keys(form.addTopicEditor).length > 0) {
                            form.addTopicEditorCreateParameObject = {
                                toolbarRef:topicContentEditorToolbarRef.value,
                                textRef:topicContentEditorTextRef.value,
                                editorIconList:editorIconList,
                                uploadPath:uploadPath,
                                userGradeList:form.userGradeList
                            }
                        }

                        nextTick(()=>{
                            form.editorIconCount = form.addTopicEditor.toolbarSelector.childElementCount
                        })
                        
                       
                    }
                    
                }
                
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });

    }


    //显示/隐藏红包表单层
    const redEnvelopeForm = () => {
        if(form.showRedEnvelopeForm == false){
            form.showRedEnvelopeForm = true;
            
        }else{
            form.showRedEnvelopeForm = false;
        }
        selectRedEnvelopeType();
    }

    //选择红包类型
    const selectRedEnvelopeType = () => {
        if(form.giveRedEnvelope_type == 20){//随机
            totalAmountCalculate();
            
        }else if(form.giveRedEnvelope_type == 30){//固定
            singleAmountCalculate();
        }
       
        
    }

    

    //金额格式化
    const amountFormat = (value:string):string => {
       return value = clearNoNum(value);
    }


    //总金额计算
    const totalAmountCalculate = () => {
        //红包总金额输入限制
        form.giveRedEnvelope_totalAmount = clearNoNum(form.giveRedEnvelope_totalAmount);

        
        if(form.giveRedEnvelope_type == 20){//随机
            let exp = /(^[1-9]([0-9]+)?(\.[0-9]{1,10})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
            if(exp.test(form.giveRedEnvelope_totalAmount.trim())) {
                let amount = calc_add(form.giveRedEnvelope_totalAmount.trim(), '0', 2);
                form.giveRedEnvelope_totalAmountView = String(amount);
            }else{
                form.giveRedEnvelope_totalAmountView = '0.00';
            }
            
        }
    }
		
    //单个红包金额计算
    const singleAmountCalculate = () => {
        //单个红包金额输入限制
        form.giveRedEnvelope_singleAmount = clearNoNum(form.giveRedEnvelope_singleAmount);

       
        if(form.giveRedEnvelope_type == 30){//固定
            //金额 只允许正数  正则判断最多10位小数
            var exp_singleAmount = /(^[1-9]([0-9]+)?(\.[0-9]{1,10})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
            //数量 正整数
            var exp_giveQuantity = /^\+?[1-9][0-9]*$/;
            if(exp_singleAmount.test(form.giveRedEnvelope_singleAmount.trim()) && exp_giveQuantity.test(form.giveRedEnvelope_giveQuantity.trim())) {
                var amount = calc_multiply(form.giveRedEnvelope_singleAmount.trim(), form.giveRedEnvelope_giveQuantity.trim(), 2);
                form.giveRedEnvelope_totalAmountView = String(amount);
            }else{
                form.giveRedEnvelope_totalAmountView = '0.00';
            }
        }
        
    }
    //控制只能输入小数点后2位
    const clearNoNum = (val:string) => {
        val = val.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符   
        val = val.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的   
        val = val.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        val = val.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数   
        if (val.indexOf(".") < 0 && val != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额  
            val = parseFloat(val).toString();
        }
        return val;
    }

    //校验标题
    const validatorTitle = (val:any):boolean => {
        if(val == ''){
            error.title = "标题不能为空"
            return false;
        }
        error.title = "";
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
            // 全局表单验证
            formRef.value.validate().then(() => {
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
                if(form.tagId != null && form.tagId != ''){
                    formData.append('tagId', form.tagId);
                }
                

                if(form.title != null && form.title != ''){
                    formData.append('title', form.title);
                }

                let content =  form.addTopicEditor.txt.html()
                if(content != null && content !=''){
                    formData.append('content', content);
                }

                //如果显示红包表单
                if(form.showRedEnvelopeForm){
                    formData.append('type', String(form.giveRedEnvelope_type));//发红包类型
                    formData.append('totalAmount', form.giveRedEnvelope_totalAmount);//红包总金额
                    formData.append('singleAmount', form.giveRedEnvelope_singleAmount);//单个红包金额
                    formData.append('giveQuantity', form.giveRedEnvelope_giveQuantity);//红包数量
                }

                
                //验证码Key
                formData.append('captchaKey', form.captchaKey);
                //验证码值
                if(form.captchaValue != ''){
                    formData.append('captchaValue', form.captchaValue.trim());
                }

                proxy?.$axios({
                    url: '/user/control/topic/add',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;
                    
                        if(JSON.parse(result.success)){
                            // 成功通知
                            Notify({ 
                                type: 'success', 
                                message: '提交成功，3秒后自动跳转到话题列表页',
                                onClose: ()=>{
                                    router.push({
                                        path : '/index'
                                    }); 
                                } 
                            });
                            
                        }else{
                            //处理错误信息
                            processErrorInfo(result.error as Map<string,string> , error,()=>{});
                            

                            

                            if(result.captchaKey != null){
                                form.showCaptcha = true;
                                form.captchaKey = result.captchaKey;
                                replaceCaptcha();
                            }else{
                                form.showCaptcha = false;
                            }

                            form.allowSubmit = false;//提交按钮disabled状态
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
        if(to.name == 'addTopic'){
            init();
        }
        
        next();
    });

    onMounted(() => {
        init();
    }) 


    //卸载组件实例后调用
    onUnmounted (()=>{
        if (Object.keys(form.addTopicEditor).length != 0) {//不等于空
            destroyEditor(form.addTopicEditor);
            form.addTopicEditor = {};
        }
    })
    //初始化
    const init = () => {
        queryAddTopic();
        queryTagList();
    }

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = '发表话题 - ' + titleValue;
        }
    })
</script>
<style scoped lang="scss">
.addTopicModule{
    .redEnvelope-arrow-down{
        :deep(.van-icon-arrow){
            &:before {
                transform: rotate(90deg) translateZ(0);
                transition: transform var(--van-animation-duration-base);
            }
        }
    }
    .redEnvelope-arrow-right{
        :deep(.van-icon-arrow){
            &:before {
                transform: rotate(0deg) translateZ(0);
                transition: transform var(--van-animation-duration-base);
            }
        }
    }
    .form-container{
        :deep(.van-radio--horizontal){
            margin-top: 2px;
            margin-bottom: 8px;
        }
        .help-text{
            font-size: 13px;
            line-height: 22px;
            color: var(--van-gray-5);
        }
    }
    
    .skeleton{
        margin: 8px;
        padding-top: 16px;
        padding-bottom: 16px;
        background: #fff;
        border-radius: var(--van-border-radius-lg);
    }

}
</style>

