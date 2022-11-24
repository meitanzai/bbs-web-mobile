<!--问题内容-->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <van-nav-bar title="问答" left-text="返回" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <van-pull-refresh v-model="state.isRefreshing" success-text="刷新成功" @refresh="onRefresh"> 
                <div class="questionContentModule">
                     
                    <div class="head" v-if="state.question != null && Object.keys(state.question).length>0">
                        <div class="container">
                            <div class="left-layout" v-if="!state.isQuestionSkeleton">
                                <router-link v-if="state.question.account != null && state.question.account != ''" tag="a" :to="{path:'/user/control/home',query: {userName: state.question.userName}}">
                                    <span class="avatarImg">
                                        <img v-if="state.question.avatarName != null" :src="state.question.avatarPath+'100x100/'+state.question.avatarName" class="img">
                                    
                                        <img v-if="state.question.avatarName == null" :src="state.question.avatar" class="img"/>
                                    </span>
                                </router-link>
                                <template v-if="state.question.account == null || state.question.account == ''">
                                    <span class="avatarImg">
                                        <img v-if="state.question.avatarName == null" :src="state.question.avatar" class="img"/>
                                    </span>
                                </template>
                            </div>
                            <div class="middle-layout" v-if="!state.isQuestionSkeleton">
                                <div class="userInfo">
                                    <span v-if="state.question.nickname == null || state.question.nickname == ''" class="account">{{state.question.account}}</span>
                                    <span v-if="state.question.nickname != null && state.question.nickname != ''" class="account">{{state.question.nickname}}</span>
                                    <span class="userRoleName" v-for="roleName in state.question.userRoleNameList">{{roleName}}</span>
                                    <span class="staff" v-if="state.question.isStaff">官方人员</span>
                                    <div v-if="state.question.account == null || state.question.account == ''" class="cancelAccount">此用户账号已注销</div>
                                    <span class="time">{{state.question.postTime}}</span>
                                    
                                </div>
                                
                            </div>
                            <div class="right-layout">
                                <van-button plain type="primary" v-if="!state.question.isStaff" @click="addFollow(state.question.userName)" round>{{state.followText}}</van-button>
                            </div>
                        </div>
                    </div>

                    <div class="questionDetail">
                        <div class="head" v-if="!state.isQuestionSkeleton">
                            <div class="titleBox">
                                <span class="title">{{state.question.title}}</span>
                            </div>
                            <div class="info van-hairline--bottom">
                                <div class="left-layout">
                                    <div class="tagName-box" v-for="questionTag in state.question.questionTagAssociationList"><span class="tagName">{{questionTag.questionTagName}}</span></div>
                                </div>
                                <div class="right-layout">
                                    <div class="statistics">
                                        <Icon name="info-alt" :size="convertViewportWidth('14px')" class="icon"/><span class="answerTotal">{{state.question.answerTotal}}</span>
				            	        <Icon name="view" :size="convertViewportWidth('14px')" class="icon"/><span class="viewTotal">{{state.question.viewTotal}}</span>
                                        
                                        <span class="more" v-if="onQuestionPopoverActions(state.question).length >0">
                                            <van-popover v-model:show="state.showQuestionPopover" placement="left-start" :overlay="true" overlay-class="custom-popoverModule-overlay" :actions="onQuestionPopoverActions(state.question)" @select="onQuestionPopoverSelect">
                                                <template #reference>
                                                    <van-icon name="ellipsis" :size="convertViewportWidth('16px')"/>
                                                </template>
                                            </van-popover>
                                        </span>
                                    </div>
                                </div>
                            </div> 
                        
                        </div>
                        <div class="questionContent" v-if="!state.isQuestionSkeleton">
                            <div class="reward" v-if="parseFloat(state.question.amount) > 0 || Long.fromString(String(state.question.point)).gt(0)">
                                <div class="info" >
                                    <Icon name="deposit" size="26px" class="icon"/>
                                    悬赏<template v-if="parseFloat(state.question.amount) > 0">金额<span class="symbol">¥</span><span class="amount">{{state.question.amount}}</span>元 </template>
                                    <template v-if="Long.fromString(state.question.point).gt(0)">
                                        <span class="point">{{state.question.point}}</span>积分
                                    </template>
                                </div>
                            </div>


                            <div class="cancelAccount" v-if="state.question.account == null || state.question.account == ''">此用户账号已注销</div>
                            
                            <div :ref="'question_'+state.question.id">
                                <RenderTemplate @click-onZoomPicture="onZoomPicture" :html="state.question.content"></RenderTemplate>
                                        
                            </div>

                            
                        </div>

                        <template v-for="(appendQuestionItem,index) in state.question.appendQuestionItemList">
                            <div :class="(index%2)==0 ? 'appendBox odd' : 'appendBox even'">
                                <div class="appendHead">
                                    <span class="prompt">第{{index + 1}}条附言</span>
                                    <span class="appendTime">{{appendQuestionItem.postTime}}</span>
                                </div>
                                <div class="appendContent" :ref="'appendQuestion_'+appendQuestionItem.id">
                                    <RenderTemplate @click-onZoomPicture="onZoomPicture" :html="appendQuestionItem.content"></RenderTemplate>
                                </div> 
                            </div>		
                        </template>

                        <div class="questionContent" v-if="state.isQuestionSkeleton">
                            <van-skeleton :row="3" :loading="state.isQuestionSkeleton" class="skeleton" style="padding-top: 30px;"/>
                        </div>
                        <div class="operating" v-if="state.question != null && Object.keys(state.question).length>0">
                            <div class="bottomInfo">
                                <van-button type="primary" plain class="favorites" :disabled="state.alreadyCollected" @click="addFavorite(state.question.id)">
                                    <template #default>
                                        <span>{{state.favoriteCount}}</span>
                                        {{state.alreadyCollected == true ? '已收藏':'收藏'}}
                                    </template>
                                    <template #icon>
                                        <Icon name="favorites" :size="convertViewportWidth('16px')" class="icon"/>
                                    </template>
                                </van-button>
                            </div>
                        </div> 
                    </div>
                    <!-- 话题允许回答 -->
                    <div class="allow-answer-wrap" v-if="state.question.allow">
                        <!-- 已登录 -->
                        <div v-if="store_systemUser != null && Object.keys(store_systemUser).length>0">
                            <!-- 显示回答按钮 -->
                            <div class="answer-button" v-if="state.allowAnswer">
                                <van-button round block plain type="primary" native-type="submit" @click="addAnswerUI" >回答问题</van-button>
                            </div>
                             <!-- 不显示回答按钮 -->      
                            <div class="no-answer-button" v-if="!state.allowAnswer">
                                回答已关闭
                            </div>
                        </div>
                        <!-- 未登录 -->
                        <div v-else class="answer-button" >
                            <div class="login-button"><span @click="router.push({path: '/login',query:{jumpUrl :createJumpAttribute()}})">登录</span>后回答问题</div>
                        </div>
                    </div>

                    <!-- 话题不允许回答 -->
					<div class="no-answer-wrap" v-if="state.question != null && Object.keys(state.question).length>0 && !state.question.allow">
                        <div class="no-answer">
                            本问题回答已关闭
                        </div>
					</div>

                    <!-- 追加提问 -->
                    <van-popup v-model:show="state.appendQuestionFormView" safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" :style="{ height: '100%' }">
                        <div class="appendQuestionModule">
                            <van-form :ref="'formAppendQuestionRef'" :scroll-to-error="true" class="form-container">
                                <van-cell-group>
                                    <van-field center :error-message="error.appendQuestionContent">
                                        <template #input>
                                            <div style="width: 100%;">
                                                <van-sticky :z-index="1" >
                                                    <div ref="appendQuestionContentEditorToolbarRef" class="editor-toolbar" style="padding-top: 13px;"></div>
                                                </van-sticky>
                                                <div ref="appendQuestionContentEditorTextRef"  class="editor-text" style="min-height: 320px;"></div>
                                            </div>
                                        </template>
                                    </van-field>
                                    <van-field v-model="state.captchaValue['appendQuestion-'+state.questionId]"  @change.native="checkCaptchaValueRules('appendQuestion-'+state.questionId)" class="captcha-item captcha-input-left" label="验证码" placeholder="请输入验证码" maxlength="4" center clearable v-if="state.showCaptcha.get('appendQuestion-'+state.questionId)" :error-message="error.captchaValue.get('appendQuestion-'+state.questionId)">
                                        <template #button>
                                            <van-image :src="state.imgUrl.get('appendQuestion-'+state.questionId)" @click="replaceCaptcha('appendQuestion-'+state.questionId)" class="captcha-image"/>
                                        </template>
                                        <template #extra >
                                            <span class="captcha-replace" @click="replaceCaptcha('appendQuestion-'+state.questionId)">换一幅</span>
                                        </template>
                                    </van-field>
                                
                                </van-cell-group>

                                <van-field center :error-message="error.question">
                                    <template #input>
                                        <div class="submitButton">
                                            <van-button round block type="primary" native-type="submit" @mousedown="onAppendQuestionFormSubmit" :disabled="state.allowSubmit.get('appendQuestion-'+state.questionId)">追加提交</van-button>
                                        </div>
                                    </template>
                                </van-field>
                            </van-form>
                        </div>
                    </van-popup>

                    <!-- 添加答案 -->
                    <van-popup v-model:show="state.popup_addAnswer" safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" :style="{ height: '100%' }">
                        <div class="addAnswerModule">
                            <van-form :ref="'formAddAnswerRef'" :scroll-to-error="true" class="form-container">
                                <van-cell-group>
                                    <van-field center :error-message="error.content.get('addAnswer-'+state.questionId)">
                                        <template #input>
                                            <div style="width: 100%;">
                                                <van-sticky :z-index="1" >
                                                    <div ref="addAnswerContentEditorToolbarRef" class="editor-toolbar" style="padding-top: 13px;"></div>
                                                </van-sticky>
                                                <div ref="addAnswerContentEditorTextRef"  class="editor-text" style="min-height: 320px;"></div>
                                            </div>
                                        </template>
                                    </van-field>
                                    <van-field v-model="state.captchaValue['addAnswer-'+state.questionId]"  @change.native="checkCaptchaValueRules('addAnswer-'+state.questionId)" class="captcha-item captcha-input-left" label="验证码" placeholder="请输入验证码" maxlength="4" center clearable v-if="state.showCaptcha.get('addAnswer-'+state.questionId)" :error-message="error.captchaValue.get('addAnswer-'+state.questionId)">
                                        <template #button>
                                            <van-image :src="state.imgUrl.get('addAnswer-'+state.questionId)" @click="replaceCaptcha('addAnswer-'+state.questionId)" class="captcha-image"/>
                                        </template>
                                        <template #extra >
                                            <span class="captcha-replace" @click="replaceCaptcha('addAnswer-'+state.questionId)">换一幅</span>
                                        </template>
                                    </van-field>
                                
                                </van-cell-group>

                                <van-field center :error-message="error.answer.get('addAnswer-'+state.questionId)">
                                    <template #input>
                                        <div class="submitButton">
                                            <van-button round block type="primary" native-type="submit" @mousedown="onAddAnswerFormSubmit" :disabled="state.allowSubmit.get('addAnswer-'+state.questionId)">提交</van-button>
                                        </div>
                                    </template>
                                </van-field>
                            </van-form>
                        </div>
                    </van-popup>

                    <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :error-text="(state.question != null && Object.keys(state.question).length>0) ? '请求失败，点击重新加载' : ''" finished-text="" @load="onLoad" >
                
                        <div class="answerList" v-if="state.answerList != null && state.answerList.length >0">
                        
                            <div class="item van-hairline--bottom" :class="answer.adoption == true ? 'active' : ''" v-for="(answer,index) in state.answerList" :key="answer.id"  :ref="'answer_'+answer.id" >
                                <div class="adoption" v-if="answer.adoption">
                                    <div class="ribbon-wrapper">
                                        <div class="ribbon">最佳答案</div>
                                    </div>
                                </div>
                                <div class="top-container">
                                    <div class="left-layout">
                                        <router-link v-if="answer.account != null && answer.account != ''" tag="a" :to="{path:'/user/control/home',query: {userName: answer.userName}}">
                                            <span class="avatarImg">
                                                <img v-if="answer.avatarName != null" :src="answer.avatarPath+'100x100/'+answer.avatarName" class="img">
                                            
                                                <img v-if="answer.avatarName == null" :src="answer.avatar" class="img"/>
                                            </span>
                                        </router-link>
                                        <template v-if="answer.account == null || answer.account == ''">
                                            <span class="avatarImg">
                                                <img v-if="answer.avatarName == null" :src="answer.avatar" class="img"/>
                                            </span>
                                        </template>
                                    </div>
                                    <div class="middle-layout">
                                        <div class="userInfo">
                                            <span v-if="(answer.nickname == null || answer.nickname == '') && answer.account != null && answer.account != ''" class="account">{{answer.account}}</span>
                                            <span v-if="answer.nickname != null && answer.nickname != ''" class="account">{{answer.nickname}}</span>
                                            <span class="userRoleName" v-for="roleName in answer.userRoleNameList">{{roleName}}</span>
                                            <span class="staff" v-if="answer.isStaff">官方人员</span>
                                            <div v-if="answer.account == null || answer.account == ''" class="cancelNickname">已注销</div>
                                            <span class="time">{{answer.postTime}}</span>
                                            
                                        </div>
                                        
                                    </div>
                                    <div class="right-layout">
                                        <div class="floor" v-if="answer.adoption == false">{{index+1}}楼</div>
                                        <div class="more" v-if="onAnswerPopoverActions(answer).length >0">
                                            <van-popover v-model:show="state.showAnswerPopover[answer.id]" placement="left-start" :overlay="true" overlay-class="custom-popoverModule-overlay" :actions="onAnswerPopoverActions(answer)" @select="onAnswerPopoverSelect">
                                                <template #reference>
                                                    <van-icon name="ellipsis" :size="convertViewportWidth('16px')"/>
                                                </template>
                                            </van-popover>
                                        </div>
                                    </div>
                                </div>
                               
                                <div class="bottom-container">
                                    <div class="answerContent">
                                        <div class="cancelAccount" v-if="answer.account == null || answer.account == ''">此用户账号已注销</div>
                                    

                                        <div :ref="'answerContent_'+answer.id">
                                            <RenderTemplate @click-onZoomPicture="onZoomPicture" :html="answer.content"></RenderTemplate>
                                        
                                        </div>
                                    </div>

                                    <div class="replyList" v-if="answer.answerReplyList != null && answer.answerReplyList.length >0">
                                        <div class="reply-container van-hairline--top" v-for="(reply,index2) in answer.answerReplyList" :key="reply.id" v-show="state.replyExpandOrShrink.get(answer.id) || (state.replyExpandOrShrink.get(answer.id) == false && index2 <2)">

                                            <div class="top-container" >
                                                <div class="left-layout">
                                                    <router-link v-if="reply.account != null && reply.account != ''" tag="a" :to="{path:'/user/control/home',query: {userName: reply.userName}}">
                                                        <span class="avatarImg">
                                                            <img v-if="reply.avatarName != null" :src="reply.avatarPath+'100x100/'+reply.avatarName" class="img">
                                                        
                                                            <img v-if="reply.avatarName == null" :src="reply.avatar" class="img"/>
                                                        </span>
                                                    </router-link>
                                                    <template v-if="reply.account == null || reply.account == ''">
                                                        <span class="avatarImg">
                                                            <img v-if="reply.avatarName == null" :src="reply.avatar" class="img"/>
                                                        </span>
                                                    </template>
                                                </div>
                                                <div class="middle-layout">
                                                    <div class="userInfo">
                                                        <span v-if="(reply.nickname == null || reply.nickname == '') && reply.account != null && reply.account != ''" class="account">{{reply.account}}</span>
                                                        <span v-if="reply.nickname != null && reply.nickname != ''" class="account">{{reply.nickname}}</span>
                                                        <span class="userRoleName" v-for="roleName in reply.userRoleNameList">{{roleName}}</span>
                                                        <span class="staff" v-if="reply.isStaff">官方人员</span>
                                                        <div v-if="reply.account == null || reply.account == ''" class="cancelNickname">已注销</div>
                                                        <span class="time">{{reply.postTime}}</span>
                                                        
                                                    </div>
                                                    
                                                </div>
                                                <div class="right-layout">
                                                    <div class="more" v-if="onReplyPopoverActions(reply).length >0">
                                                        <van-popover v-model:show="state.showReplyPopover[reply.id]" placement="left-start" :overlay="true" overlay-class="custom-popoverModule-overlay" :actions="onReplyPopoverActions(reply)" @select="onReplyPopoverSelect">
                                                            <template #reference>
                                                                <van-icon name="ellipsis" :size="convertViewportWidth('16px')"/>
                                                            </template>
                                                        </van-popover>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="bottom-container">
                                                <div class="replyContent">
                                                    <div v-if="reply.account == null || reply.account == ''" class="cancelAccount">此用户账号已注销</div>
                                                    {{reply.content}}
                                                </div>

                                            </div>
                                            <!-- 修改回复 -->
                                            <van-popup v-model:show="state.editReplyFormView[reply.id]" safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" class="custom-bottom-popupModule" :style="{ height: '80%' }" round>
                                                <div class="editReplyModule">
                                                    <van-form :scroll-to-error="true" class="form-container">
                                                    
                                                        <van-field v-model="state.editReplyContentField[reply.id]" rows="6" autosize type="textarea" placeholder="请输入内容" :error-message="error.replyContent.get('editReply-'+reply.id)" class="replyContent-item"/>
                                                        <van-field v-model="state.captchaValue['editReply-'+reply.id]"  @change.native="checkCaptchaValueRules('editReply-'+reply.id)" class="captcha-item captcha-input-left" label="验证码" placeholder="请输入验证码" maxlength="4" center clearable v-if="state.showCaptcha.get('editReply-'+reply.id)" :error-message="error.captchaValue.get('editReply-'+reply.id)">
                                                            <template #button>
                                                                <van-image :src="state.imgUrl.get('editReply-'+reply.id)" @click="replaceCaptcha('editReply-'+reply.id)" class="captcha-image"/>
                                                            </template>
                                                            <template #extra >
                                                                <span class="captcha-replace" @click="replaceCaptcha('editReply-'+reply.id)">换一幅</span>
                                                            </template>
                                                        </van-field>

                                                        <van-field :error-message="error.reply.get('editReply-'+reply.id)">
                                                            <template #input>
                                                                <div class="submitButton">
                                                                    <van-button round block type="primary" native-type="submit" @mousedown="onEditReply(reply.id)" :disabled="state.allowSubmit.get('editReply-'+reply.id)">提交</van-button>
                                                                </div>
                                                            </template>
                                                        </van-field>
                                                    </van-form>
                                                </div>
                                            </van-popup>
                                        </div>
                                        <div class="link" v-if="answer.answerReplyList.length >2">
                                            <span @click="telescopicReply(answer.id);" v-if="state.replyExpandOrShrink.get(answer.id)">点击收缩</span>
                                            <span @click="telescopicReply(answer.id);" v-else>剩余{{answer.answerReplyList.length-2}}条</span>
                                        </div>
                                    </div>

                                    <!-- 添加回复 -->
                                    <van-popup v-model:show="state.addReplyFormView[answer.id]" safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" class="custom-bottom-popupModule" :style="{ height: '80%' }" round>
                                        <div class="addReplyModule">
                                            <van-form :scroll-to-error="true" class="form-container">
                                              
                                                <van-field v-model="state.addReplyContentField[index]" rows="6" autosize type="textarea" placeholder="请输入内容" :error-message="error.replyContent.get('addReply-'+answer.id)" class="replyContent-item"/>
                                                <van-field v-model="state.captchaValue['addReply-'+answer.id]"  @change.native="checkCaptchaValueRules('addReply-'+answer.id)" class="captcha-item captcha-input-left" label="验证码" placeholder="请输入验证码" maxlength="4" center clearable v-if="state.showCaptcha.get('addReply-'+answer.id)" :error-message="error.captchaValue.get('addReply-'+answer.id)">
                                                    <template #button>
                                                        <van-image :src="state.imgUrl.get('addReply-'+answer.id)" @click="replaceCaptcha('addReply-'+answer.id)" class="captcha-image"/>
                                                    </template>
                                                    <template #extra >
                                                        <span class="captcha-replace" @click="replaceCaptcha('addReply-'+answer.id)">换一幅</span>
                                                    </template>
                                                </van-field>

                                                <van-field :error-message="error.reply.get('addReply-'+answer.id)">
                                                    <template #input>
                                                        <div class="submitButton">
                                                            <van-button round block type="primary" native-type="submit" @mousedown="onAddReply(answer.id)" :disabled="state.allowSubmit.get('addReply-'+answer.id)">提交</van-button>
                                                        </div>
                                                    </template>
                                                </van-field>
                                            </van-form>
                                        </div>
                                    </van-popup>
                                    <!-- 修改答案 -->
                                    <van-popup v-model:show="state.editAnswerFormView[answer.id]" safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" :style="{ height: '100%' }">
                                        <div class="editAnswerModule">
                                            <van-form :scroll-to-error="true" class="form-container">
                                                <van-field center :error-message="error.content.get('editAnswer-'+answer.id)">
                                                    <template #input>
                                                        <div style="width: 100%;">
                                                            <van-sticky :z-index="1" >
                                                                <div :ref="'editAnswerContentEditorToolbarRef_'+answer.id" class="editor-toolbar" style="padding-top: 13px;"></div>
                                                            </van-sticky>
                                                            <div :ref="'editAnswerContentEditorTextRef_'+answer.id"  class="editor-text" style="min-height: 320px;"></div>
                                                        </div>
                                                    </template>
                                                </van-field>
                                                <van-field v-model="state.captchaValue['editAnswer-'+answer.id]"  @change.native="checkCaptchaValueRules('editAnswer-'+answer.id)" class="captcha-item captcha-input-left" label="验证码" placeholder="请输入验证码" maxlength="4" center clearable v-if="state.showCaptcha.get('editAnswer-'+answer.id)" :error-message="error.captchaValue.get('editAnswer-'+answer.id)">
                                                    <template #button>
                                                        <van-image :src="state.imgUrl.get('editAnswer-'+answer.id)" @click="replaceCaptcha('editAnswer-'+answer.id)" class="captcha-image"/>
                                                    </template>
                                                    <template #extra >
                                                        <span class="captcha-replace" @click="replaceCaptcha('editAnswer-'+answer.id)">换一幅</span>
                                                    </template>
                                                </van-field>

                                                <van-field :error-message="error.answer.get('editAnswer-'+answer.id)">
                                                    <template #input>
                                                        <div class="submitButton">
                                                            <van-button round block type="primary" native-type="submit" @mousedown="onEditAnswerFormSubmit(answer.id)" :disabled="state.allowSubmit.get('editAnswer-'+answer.id)">提交</van-button>
                                                        </div>
                                                    </template>
                                                </van-field>
                                            </van-form>
                                        </div>
                                    </van-popup>
                                </div>
                            </div>
                        </div>
                    </van-list>

                </div>
                <!--  相似问题 集合 -->
                <div class="likeQuestionModule" v-if="state.likeQuestionList != null && state.likeQuestionList.length >0">
                    <div class="likeQuestion">
                        <div class="title van-hairline--bottom">相关问题</div>
                        <ul class="questionList">
                            <li class="question-title " v-for="likeQuestion in state.likeQuestionList">
                                <router-link tag="a" :to="{path: '/question', query:{ questionId : likeQuestion.id}}">
                                    {{likeQuestion.title}}
                                </router-link>
                            </li>
                        </ul>
                    </div>
                </div>
            </van-pull-refresh>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, nextTick,ref, watchEffect, onActivated} from 'vue'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { onBeforeRouteUpdate, useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { Answer, AnswerReply, PageView, Question } from "@/types/index";
    import { letterAvatar } from '@/utils/letterAvatar';
    import { escapeVueHtml } from '@/utils/escape';
    import { getLanguageClassName, getPageBasePath, processErrorInfo } from '@/utils/tool';
    import Prism from "prismjs";
    import { Dialog, Image as VanImage, ImagePreview, Notify } from 'vant';
    import Icon from "@/components/icon/Icon.vue";
    import { createEditor, destroyEditor } from '@/utils/editor';
    import { createJumpAttribute } from '@/utils/jumpProcess';
    import Long from "long";


    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)
 
    

    const appendQuestionContentEditorToolbarRef = ref();
    const appendQuestionContentEditorTextRef = ref();

    const addAnswerContentEditorToolbarRef = ref();
    const addAnswerContentEditorTextRef = ref();


    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
      
        if(titleValue != null && titleValue != '' && state.question != null && Object.keys(state.question).length > 0){
            document.title = (state.question.title != null ? state.question.title : '')+ ' - ' + titleValue;
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })



    const state = reactive({
        questionId:'',
        question: {} as Question,
        
        showQuestionPopover :false,//问题气泡弹出框

        alreadyCollected :false,//用户是否已经收藏问题
        favoriteCount : 0,//问题用户收藏总数

        followText:'关注',//关注文本

        appendQuestionFormView:false,//追加问题表单
        appendQuestionEditor :{} as any,//追加问题编辑器
        appendQuestionEditorCreateParameObject :{},//追加问题编辑器的创建参数

        showAnswerPopover:{} as any,//答案气泡弹出框   key:答案Id value:是否显示  {答案Id-1 : 是否显示,答案Id-2 : 是否显示}
        showReplyPopover:{} as any,//回复气泡弹出框  key:回复Id value:是否显示  {回复Id-1 : 是否显示,回复Id-2 : 是否显示}
        answerList:[] as Array<Answer>,
        totalrecord : 0, //总记录数
        currentpage : 0, //当前页码
        totalpage : 1, //总页数
        maxresult: 12, //每页显示记录数    
        
        replyExpandOrShrink :new Map(), //回复展开/收缩 map格式 key:答案Id value:是否展开
        allowAnswer:false,//是否显示答案表单
        availableTag:[],//答案编辑器允许使用标签
        fileSystem:0,//文件存储系统

        popup_addAnswer:false,//添加答案弹出窗口
        addAnswerEditor :{} as any,//添加答案编辑器
        addAnswerEditorCreateParameObject :{} as any,//添加答案编辑器的创建参数

       
        
        editAnswerFormView : {} as any,//修改答案表单  key:答案Id value:是否显示  key:答案Id value:是否显示  {答案Id-1 : 是否显示,答案Id-2 : 是否显示}
        editAnswerEditorMap:new Map(),//修改答案富文本编辑器集合 key:答案Id value:富文本编辑器
        editAnswerEditorCreateParameMap:new Map(),//修改答案编辑器的创建参数 key:答案Id value:编辑器参数对象

        addReplyContentField : [] as any, //添加回复内容项绑定
		addReplyFormView : {} as any,//添加回复表单  key:答案Id value:是否显示  {答案Id-1 : 是否显示,答案Id-2 : 是否显示}
        

		editReplyContentField : {} as any, //修改回复内容项绑定  key:回复Id value:内容 {回复Id-1 : 内容,回复Id-2 : 内容}
		editReplyFormView : {} as any,//修改回复表单  key:回复Id value:是否显示 {回复Id-1 : 是否显示,回复Id-2 : 是否显示}

        showCaptcha:new Map<string,boolean>(),//是否显示验证码  本项及以下几项的key格式为 key:模块+id  例如：添加答案key=addAnswer-问题Id   修改评论key=editAnswer-答案Id  添加回复key=addReply-评论Id   修改回复key=editReply-回复Id
        captchaKey: new Map<string,string>(),//验证码key
        captchaValue: {} as any,//验证码值
        imgUrl: new Map<string,string>(),//验证码图片
        allowSubmit:new Map<string,boolean>(),//提交按钮disabled状态
        
        likeQuestionList:[] as Array<Question>, //相似问题集合


        isRefreshing:false,//是否处于下拉加载中状态
        isError:false,//是否列表数据加载失败
        isLoading:false,//是否处于加载中状态
        isFinished:false,//是否加载完毕
        isQuestionSkeleton:true,//是否显示问题骨架屏
        isAnswerSkeleton:true,//是否显示答案骨架屏
        isShowPage:false,//是否显示分页

    });

    

    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        state.question = {} as Question;
        
        state.showQuestionPopover = false;//问题气泡弹出框

        state.alreadyCollected = false;//用户是否已经收藏问题
        state.favoriteCount = 0;//问题用户收藏总数

        state.followText = '关注';//关注文本

        state.appendQuestionFormView = false;//追加问题表单
        state.appendQuestionEditor = {} as any;//追加问题编辑器
        state.appendQuestionEditorCreateParameObject = {};//追加问题编辑器的创建参数

        state.showAnswerPopover = {} as any;//答案气泡弹出框   key:答案Id value:是否显示  {答案Id-1 : 是否显示,答案Id-2 : 是否显示}
        state.showReplyPopover = {} as any;//回复气泡弹出框  key:回复Id value:是否显示  {回复Id-1 : 是否显示,回复Id-2 : 是否显示}
        state.answerList.length = 0;
        state.totalrecord = 0; //总记录数
        state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12;//每页显示记录数    
        
        state.replyExpandOrShrink.clear(); //回复展开/收缩 map格式 key:答案Id value:是否展开
        state.allowAnswer = false;//是否显示答案表单
        state.availableTag.length = 0;//答案编辑器允许使用标签
        state.fileSystem = 0;//文件存储系统

        state.popup_addAnswer = false;//添加答案弹出窗口
        state.addAnswerEditor = {} as any;//添加答案编辑器
        state.addAnswerEditorCreateParameObject = {} as any;//添加答案编辑器的创建参数

       
        
        state.editAnswerFormView = {} as any;//修改答案表单  key:答案Id value:是否显示  key:答案Id value:是否显示  {答案Id-1 : 是否显示,答案Id-2 : 是否显示}
        state.editAnswerEditorMap.clear();//修改答案富文本编辑器集合 key:答案Id value:富文本编辑器
        state.editAnswerEditorCreateParameMap.clear();//修改答案编辑器的创建参数 key:答案Id value:编辑器参数对象

        state.addReplyContentField.length = 0; //添加回复内容项绑定
		state.addReplyFormView = {} as any;//添加回复表单  key:答案Id value:是否显示  {答案Id-1 : 是否显示,答案Id-2 : 是否显示}
        

		state.editReplyContentField = {} as any; //修改回复内容项绑定  key:回复Id value:内容 {回复Id-1 : 内容,回复Id-2 : 内容}
		state.editReplyFormView = {} as any;//修改回复表单  key:回复Id value:是否显示 {回复Id-1 : 是否显示,回复Id-2 : 是否显示}

        state.showCaptcha.clear();//是否显示验证码  本项及以下几项的key格式为 key:模块+id  例如：添加答案key=addAnswer-问题Id   修改评论key=editAnswer-答案Id  添加回复key=addReply-评论Id   修改回复key=editReply-回复Id
        state.captchaKey.clear();//验证码key
        state.captchaValue = {} as any;//验证码值
        state.imgUrl.clear();//验证码图片
        state.allowSubmit.clear();//提交按钮disabled状态
        
        state.likeQuestionList.length = 0;//相似问题集合
         
        state.isError = false;//是否列表数据加载失败
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        init();
        queryAnswerList(state.questionId,'', '', state.currentpage+1);
    };

    //错误
    const error = reactive({
        appendQuestionContent: '',
		question: '',
        content : new Map<string,string>(),//答案内容错误
        replyContent: new Map<string,string>(),//回复内容错误
        captchaValue : new Map<string,string>(),
        answer: new Map<string,string>(),//答案错误
        reply: new Map<string,string>(),//回复错误
    })


    //加载列表
    const onLoad = () => {
         queryAnswerList(state.questionId,'', '', state.currentpage+1);
    }




    //查询问题
    const queryQuestion = (questionId: string,callback :any) => {
        proxy?.$axios({
            url: '/question',
            method: 'get',
            params:  { 
                questionId: questionId,
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: Question) => {
            if(data){
                
                state.isQuestionSkeleton = false;//关闭骨架屏
                             
                //处理自定义标签
                let contentNode = document.createElement("div");
                contentNode.innerHTML = data.content;
                bindNode(contentNode);
                
                data.content = escapeVueHtml(contentNode.innerHTML);

                if(data.appendQuestionItemList != null && data.appendQuestionItemList.length >0){
                    for(let i=0; i<data.appendQuestionItemList.length; i++){
                        let appendQuestionItem = data.appendQuestionItemList[i];
                        
                        //处理图片放大标签
                        let contentNode2 = document.createElement("div");
                        contentNode2.innerHTML = appendQuestionItem.content;
                        bindNode(contentNode2);
                        appendQuestionItem.content = escapeVueHtml(contentNode2.innerHTML);
                    }
                    
                }

                
                state.question = data;

                if(state.question.nickname != null && state.question.nickname !=''){
                    state.question.avatar = letterAvatar(state.question.nickname, 70);
                }else{
                    state.question.avatar = letterAvatar(state.question.account, 70);
                }


                nextTick(()=>{
                    //渲染代码
                    let questionRefValue = proxy?.$refs['question_'+state.questionId];
                    if(questionRefValue != undefined){
                        renderBindNode(questionRefValue); 
                    }
                    if(data.appendQuestionItemList != null && data.appendQuestionItemList.length >0){
                        for(let i=0; i<data.appendQuestionItemList.length; i++){
                            let appendQuestionItem = data.appendQuestionItemList[i];
                            
                            let appendQuestionRefValue = (proxy?.$refs['appendQuestion_'+appendQuestionItem.id] as any);
                            if(appendQuestionRefValue != undefined){
                                renderBindNode(appendQuestionRefValue[0]); 
                            }
                        }
                        
                    }
                });

                

                //回调
                callback();
            }
            
        })
        .catch((error: any) =>{
            state.isError = true;
            state.isLoading = false;//加载状态结束
            console.log(error);
        });
    }

    //查询答案列表
    const queryAnswerList = (questionId: string,answerId: string, replyId: string, page:number|undefined) => {
        let params = {} as any;
        params.questionId = questionId;
        if(answerId != null && answerId != ''){
            params.answerId = answerId;
        }
        if(page != undefined){
            params.page = page;
        }

        proxy?.$axios({
            url: '/queryAnswerList',
            method: 'get',
            params:  params,
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: PageView<Answer>) => {
            state.isAnswerSkeleton = false;//关闭骨架屏

            if(data.records != null && data.records.length >0){
                for(let i:number=0; i<data.records.length; i++){
                    let answer = data.records[i];
                    state.replyExpandOrShrink.set(answer.id, false); //是否展开
                    if(answer.nickname != null && answer.nickname !=''){
                        answer.avatar = letterAvatar(answer.nickname, 60);
                    }else{
                        answer.avatar = letterAvatar(answer.account, 60);
                    }

                    if(answer.answerReplyList != null && answer.answerReplyList.length >0){
                        for(let j:number=0; j<answer.answerReplyList.length; j++){
                            let reply = answer.answerReplyList[j];
                            if(reply.nickname != null && reply.nickname !=''){
                                reply.avatar = letterAvatar(reply.nickname, 38);
                            }else{
                                reply.avatar = letterAvatar(reply.account, 38);
                            }
                        }
                    }
                    


                    //回复
                    if(answer.answerReplyList != null && answer.answerReplyList.length >0){
                        for (let j = 0; j <answer.answerReplyList.length; j++) {
                            let reply = answer.answerReplyList[j];
                            Object.assign(state.editReplyFormView, {[reply.id] : false});
                            
                            Object.assign(state.editReplyContentField, {[reply.id] : reply.content});
                            
                        }
                    }
                    

                    //处理图片放大标签
                    let contentNode = document.createElement("div");
                    contentNode.innerHTML = answer.content;
                    bindNode(contentNode);
                    answer.content = escapeVueHtml(contentNode.innerHTML);

                }
                state.answerList.push.apply(state.answerList,data.records);
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


            nextTick(()=>{
                if(data.records != null && data.records.length > 0){
                    for (let i = 0; i <data.records.length; i++) {
                        let answer = data.records[i];
                        let answerRefValue =  (proxy?.$refs['answerContent_'+answer.id] as any);
                        if(answerRefValue != undefined){
                            renderBindNode(answerRefValue[0]); 
                        }
                        
                    }
                }
            })
        })
        .catch((error: any) =>{
            state.isError = true;
            state.isLoading = false;//加载状态结束
            console.log(error);
        });
    }

    //递归绑定节点参数
    const bindNode = (node:any) => {
        
        
        //先找到子节点
        let nodeList = node.childNodes;
        for(let i = 0;i < nodeList.length;i++){
            //childNode获取到到的节点包含了各种类型的节点
            //但是我们只需要元素节点  通过nodeType去判断当前的这个节点是不是元素节点
            let childNode = nodeList[i];
            let random = Math.random().toString().slice(2);
            //判断是否是元素节点。如果节点是元素(Element)节点，则 nodeType 属性将返回 1。如果节点是属性(Attr)节点，则 nodeType 属性将返回 2。
            if(childNode.nodeType == 1){

                //处理图片
                if(childNode.nodeName.toLowerCase() == "img" ){
                    let src = childNode.getAttribute("src");
                    
                    childNode.removeAttribute("src");//将原节点src属性删除，防止多请求一次
                
                    let html = '';
                    let style = '';
                    if(childNode.getAttribute("width") != null){//如果是表情，表情图不放大
                        style = 'style="width: '+childNode.getAttribute("width")+'; height: '+childNode.getAttribute("height")+'"';
                        html = '<van-image src="'+src+'" '+style+' lazy-load ></van-image>';
                    
                      //  html = '<img '+style+' v-lazy="{src:\''+src+'\',loading:\''+state.photo_loading+'\',error:\''+state.photo_error+'\'}" />';
                    
                    }else{
                        //@click方法由RenderTemplate.vue调度处理
                        html = '<van-image src="'+src+'" '+style+' lazy-load @click="onZoomPicture_renderTemplate(\''+src+'\')"></van-image>';
                      
                       // html = '<img '+style+'  v-lazy="{src:\''+src+'\',error:\''+state.photo_error+'\'}" @click="onZoomPicture_renderTemplate(\''+src+'\')"/>';
                    
                    }
                    //创建要替换的元素
                //	let html = '<el-image src="'+src+'" '+style+' lazy></el-image>';
                //	let html = '<el-image src="'+src+'" '+style+' :preview-src-list=["http://127.0.0.1:8080/cms/common/tttttt/templates.jpg"] lazy hide-on-click-modal ></el-image>';
                    
                
                
                //	let html = '<el-image src="backstage/images/null.gif" lazy></el-image>';
                    let placeholder = document.createElement('div');
                    placeholder.innerHTML = html;
                    let node = placeholder.childNodes[0];
                //	node.setAttribute("src",src);
                    childNode.parentNode.replaceChild(node,childNode);//替换节点	 
                }
                
                //处理表格 (解决Chrome内核浏览器DPI缩放比例高于100%时部分边框变粗问题，需要CSS配合)
                if(childNode.nodeName.toLowerCase() == "table" ){
                    childNode.removeAttribute("border");
                    childNode.removeAttribute("bordercolor");
                }


                
                //处理代码标签
                if(childNode.nodeName.toLowerCase() == "pre" ){
                    let pre_html = childNode.innerHTML;
                    let class_val = childNode.className;
                    let lan_class = "";
                    
                    let class_arr = new Array();
                    class_arr = class_val.split(' ');
                    
                    for(let k=0; k<class_arr.length; k++){
                        let className = class_arr[k].trim();
                        
                        if(className != null && className != ""){
                            if (className.lastIndexOf('lang-', 0) === 0) {
                                lan_class = className;
                                break;
                            }
                        }
                    }
                    
                    childNode.className = "line-numbers "+getLanguageClassName(lan_class);
                    childNode.setAttribute("data-prismjs-copy","复制");
                    childNode.setAttribute("data-prismjs-copy-error","按Ctrl+C复制");
                    childNode.setAttribute("data-prismjs-copy-success","复制成功");


                    let nodeHtml = "";

                    //删除code节点
                    let preChildNodeList = childNode.childNodes;
                    for(let p = 0;p < preChildNodeList.length;p++){
                        let preChildNode = preChildNodeList[p];
                        if(preChildNode.nodeName.toLowerCase() == "code" ){
                            nodeHtml += preChildNode.innerHTML;
                            preChildNode.parentNode.removeChild(preChildNode);
                        }
                        
                    }
                    
                    let dom = document.createElement('code');
                    dom.className = "line-numbers "+getLanguageClassName(lan_class);
                    dom.innerHTML=nodeHtml;
                    
                   
                    childNode.appendChild(dom);
                
                }
                
                bindNode(childNode);

                
            }
        }
    }

    //递归渲染绑定节点
    const renderBindNode = (node:any) => {	
        //先找到子节点
        let nodeList = node.childNodes;
        for(let i = 0;i < nodeList.length;i++){
            //childNode获取到到的节点包含了各种类型的节点
            //但是我们只需要元素节点  通过nodeType去判断当前的这个节点是不是元素节点
            let childNode = nodeList[i];
            let random = Math.random().toString().slice(2);
            //判断是否是元素节点。如果节点是元素(Element)节点，则 nodeType 属性将返回 1。如果节点是属性(Attr)节点，则 nodeType 属性将返回 2。
            if(childNode.nodeType == 1){
                //处理代码标签
                if(childNode.nodeName.toLowerCase() == "pre" ){
                    
                    Prism.highlightAllUnder(childNode);
                }
                renderBindNode(childNode);
            }
        }
    }

    //放大图片
    const onZoomPicture = (imagePath:string) => {
        ImagePreview({
            images:[
                imagePath
            ],
            showIndex:false,//是否显示页码
        });
    }
    //问题气泡弹出框菜单选项
    const onQuestionPopoverActions = (question:Question) => {
        let actions = new Array()
        if(state.question.userName == store_systemUser.value.userName){
            actions.push({ text: '追加', questionId:question.id});
        }

        return actions;
    }
    


    //问题气泡弹出框选择
    const onQuestionPopoverSelect = (action:any) => {
        if(action.text == '追加'){
            appendQuestionUI(action.questionId);
        }
    }
    //清除答案列表
    const clearAnswerList = () => {
        state.answerList.length =0;
        state.editReplyContentField = {} as any;
        state.isFinished = false; 

        for (const [key, value] of Object.entries(state.editAnswerEditorMap)){
            if(value != null){
                destroyEditor(value);
            }
        }
        state.editAnswerEditorMap.clear();
        state.editAnswerEditorCreateParameMap.clear();
    }

     //答案气泡弹出框菜单选项
     const onAnswerPopoverActions = (answer:Answer) => {
        let actions = new Array()
        if(store_systemUser.value != null && Object.keys(store_systemUser.value).length>0){

            if(state.question.userName ==  store_systemUser.value.userName && Long.fromString(state.question.adoptionAnswerId).eq(0)){
                actions.push({ text: '采纳', answerId:answer.id});
            }

            actions.push({ text: '回复', answerId:answer.id});
            
            if(answer.userName ==  store_systemUser.value.userName){
                actions.push({ text: '编辑',answer:answer});
                actions.push({ text: '删除', answerId:answer.id});
            }
        }
        return actions;
    }
    


    //答案气泡弹出框选择
    const onAnswerPopoverSelect = (action:any) => {
        if(action.text == '采纳'){
            adoptionAnswer(action.answerId);
        }else if(action.text == '回复'){
            //添加回复表单
            addReplyUI(action.answerId);
        }else if(action.text == '编辑'){
            editAnswerUI(action.answer)
        }else if(action.text == '删除'){
            onDeleteAnswer(action.answerId);
        }
    }

     //回复气泡弹出框菜单选项
     const onReplyPopoverActions = (reply:AnswerReply) => {
        let actions = new Array()
        if(store_systemUser.value != null && Object.keys(store_systemUser.value).length>0 && reply.userName ==  store_systemUser.value.userName){
            actions.push({ text: '编辑', reply:reply});
            actions.push({ text: '删除', replyId:reply.id});
        }
        return actions;
    }
    


    //回复气泡弹出框选择
    const onReplyPopoverSelect = (action:any) => {
        
        if(action.text == '编辑'){
            editReplyUI(action.reply)
        }else if(action.text == '删除'){
            onDeleteReply(action.replyId);
        }
    }

     //展示/隐藏回复
     const telescopicReply = (answerId:string) => {
        let status = state.replyExpandOrShrink.get(answerId);
        if(status){
            state.replyExpandOrShrink.set(answerId, false); //收缩
        }else{
            state.replyExpandOrShrink.set(answerId, true); //伸展
        }
    }

    //查询是否已经关注该用户
    const queryFollowing = (userName:string) => {
        //清空信息
        state.followText = '关注';

        proxy?.$axios({
            url: '/queryFollowing',
            method: 'get',
            params:  {
                userName:userName
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(JSON.parse(result)){
                    state.followText = '已关注';
                }
            }
        }).catch((error: any) =>{
            console.log(error);
        });
    }
    //添加关注
    const addFollow = (userName:string) => {
        if(state.followText =='关注'){
            let formData = new FormData();
            formData.append('userName', userName);
            
            proxy?.$axios({
                url: '/user/control/follow/add',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                
                    if(JSON.parse(result.success)){
                        state.followText ='已关注'
                    }else{
                        //处理错误信息
                        processErrorInfo(result.error as Map<string,string> , error,()=>{});

                        

                    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });
    
        }
        
    }
    //添加收藏
    const addFavorite = (questionId:string) => {
        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            Notify({ 
                type: 'warning', 
                message: '请先登录再加入收藏'
            });
            return;
        }
        if(state.alreadyCollected){
            return;
        }

        let formData = new FormData();
        formData.append('questionId', questionId);

        proxy?.$axios({
            url: '/user/control/favorite/add',
            method: 'post',
            data: formData
        })
        .then((response: AxiosResponse) => {
            if(response){

                const result: any = response.data;
            
                if(JSON.parse(result.success)){
                    Notify({ 
                        type: 'success', 
                        message: '加入收藏成功'
                    });
                    queryAlreadyCollected(questionId);
                    queryFavoriteCount(questionId);

                }else{
                    //处理错误信息
                    processErrorInfo(result.error as Map<string,string> , error,()=>{});
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    //用户是否已经收藏问题
    const queryAlreadyCollected = (questionId:string) => {
        proxy?.$axios({
            url: '/queryAlreadyFavoriteQuestion',
            method: 'get',
            params:  { 
                questionId: questionId,
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                if(JSON.parse(data)){
                    state.alreadyCollected = true;
                }
            }
            
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    //查询问题用户收藏总数
    const queryFavoriteCount = (questionId:string) => {
        proxy?.$axios({
            url: '/queryQuestionFavoriteCount',
            method: 'get',
            params:  { 
                questionId: questionId,
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                let count = JSON.parse(data);
                state.favoriteCount = count;
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }


    //追加问题表单
    const appendQuestionUI = (questionId: string) => {
        
        let _key =  "appendQuestion-"+questionId;

        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }

        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        proxy?.$axios({
            url: '/user/queryAppendQuestion',
            method: 'get',
            params:  {
                questionId: questionId
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                if(data.allowQuestion){
                    state.appendQuestionFormView = true;
                    nextTick(()=>{
                
                        //编辑器图标
                        let editorIconList = new Array();
                        if(data.availableTag != null && data.availableTag != ''){
                            let availableTagObject = JSON.parse(data.availableTag);//JSON转为对象

                            if(availableTagObject != null && availableTagObject.length >0){
                                for(let i=0; i<availableTagObject.length; i++){
                                    let _availableTag = availableTagObject[i];
                                    
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
                                    }else if(_availableTag == "insertfile"){//文件
                                        editorIconList.push("file");
                                    }
                                }
                            }
                        }
                        
                        state.fileSystem = data.fileSystem;//文件存储系统

                        if (Object.keys(state.appendQuestionEditorCreateParameObject).length === 0) {//等于空
                            let uploadPath = "user/control/question/upload";

                            //创建富文本编辑器
                            state.appendQuestionEditor = createEditor(
                                appendQuestionContentEditorToolbarRef.value,
                                appendQuestionContentEditorTextRef.value,
                                editorIconList, 
                                getPageBasePath()+'common/default/', 
                                uploadPath,
                                null,
                                state.fileSystem
                            );
                            state.appendQuestionEditorCreateParameObject = {
                                toolbarRef:appendQuestionContentEditorToolbarRef.value,
                                textRef:appendQuestionContentEditorTextRef.value,
                                editorIconList:editorIconList,
                                uploadPath:uploadPath,
                                userGradeList:null
                            }   
                            
                        }

                        if (data.captchaKey != undefined && data.captchaKey != '') {
                            
                            state.showCaptcha.set(_key,true)
                            state.captchaKey.set(_key,data.captchaKey)
                            Object.assign(state.captchaValue, {[_key] : ''});
                            replaceCaptcha(_key);//刷新验证码
                        }

            
                    })

                    state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                }else{
                    Notify({ 
                        type: 'warning', 
                        message: '不允许追加提问',
                        onClose: ()=>{
                            
                        } 
                    });
                }
            }
            
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }


    //追加问题 -- 提交数据
    const onAppendQuestionFormSubmit = () => {
        let _key =  "appendQuestion-"+state.questionId;
        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            error.captchaValue.set(_key,'');
            if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){

                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                    checkCaptchaValue(state.captchaValue[_key].trim(), (err:string)=>{
                        if(err != undefined){
                            error.captchaValue.set(_key,err);
                            state.allowSubmit.set(_key,false);//提交按钮disabled状态
                        }else{
                            resolve();
                        }
                    },_key) 
                }else{
                    error.captchaValue.set(_key,"验证码不能为空");
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                }
            }else{
                resolve();
            }
        });

        Promise.all([p1])
            .then(() => {
                //清空所有错误
                error.appendQuestionContent = '';
                error.captchaValue.delete(_key);
                error.question = '';

                let formData = new FormData();
                formData.append('questionId', state.questionId);

                let content =  state.appendQuestionEditor.txt.html()
                if(content != null && content !=''){
                    formData.append('content', content);
                }

                if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){
                    //验证码Key
                    formData.append('captchaKey', state.captchaKey.get(_key) as string);
                }
                
                //验证码值
                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                     formData.append('captchaValue', (state.captchaValue[_key] as string).trim());
                }

                proxy?.$axios({
                    url: '/user/control/question/appendQuestion',
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
                                message: '提交成功',
                                onClose: ()=>{
                                    
                                } 
                            });

                            state.appendQuestionFormView = false;

                            //清空字段
                            state.appendQuestionEditor.txt.clear();//清空

                            
                            //重置表单
                            //formAddCommentRef.value?.resetFields();
                            if(state.showCaptcha.get(_key) == true){
                                Object.assign(state.captchaValue, {[_key] : ''});
                            }
                           

                            queryQuestion(state.questionId,()=>{});

                        }else{
                            //处理错误信息
                            for (const [key, value] of Object.entries(result.error) as [string, string][]){
                                if(key == 'content'){
                                    error.appendQuestionContent = value;
                                }else if(key == 'question'){
                                    error.question = value;
                                }else if(key == 'captchaValue'){
                                    error.captchaValue.set(_key,value);
                                }
                            }

                            if(result.captchaKey != null){
                                state.showCaptcha.set(_key,true);
                                state.captchaKey.set(_key,result.captchaKey);
                                Object.assign(state.captchaValue, {[_key] : ''});
                                replaceCaptcha(_key);
                            }else{
                                state.showCaptcha.set(_key,false);
                            }

                            
                        }
                        state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                    }
                })
                .catch((error: any) =>{
                    console.log(error);
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                });
            }).catch(() => {
                console.log("提交数据错误");
            });

    }

     //采纳答案
     const adoptionAnswer = (answerId:string) => {
        Dialog.confirm({
            message:'确定采纳答案?',
        })
        .then(() => {
            let formData = new FormData();
            formData.append('answerId', answerId);

            proxy?.$axios({
                url: '/user/control/question/adoptionAnswer',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                
                    if(JSON.parse(result.success)){
                        Notify({ 
                            type: 'success', 
                            message: '采纳当前答案成功',
                            onClose: ()=>{
                                
                            } 
                        });

                        state.question.adoptionAnswerId = "1";

                        //清除答案列表
                        clearAnswerList();
                            
                        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                        queryAnswerList(state.questionId,'','',1);

                    }else{
                        //处理错误信息
                        processErrorInfo(result.error as Map<string,string> , reactive({}),()=>{});


                        
                    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });
        })
        .catch(() => {
            // on cancel
        });
    }

    //发表答案表单
    const addAnswerUI = () => {
        state.popup_addAnswer = true;
 
        nextTick(()=>{
            if(state.showCaptcha.get("addAnswer-"+state.questionId)){
                replaceCaptcha("addAnswer-"+state.questionId);//刷新验证码
            }
            
            if (Object.keys(state.addAnswerEditorCreateParameObject).length > 0 && Object.keys(state.addAnswerEditor).length == 0) {
            
                //创建富文本编辑器
                state.addAnswerEditor = createEditor(
                    addAnswerContentEditorToolbarRef.value,
                    addAnswerContentEditorTextRef.value,
                    state.addAnswerEditorCreateParameObject.editorIconList, 
                    getPageBasePath()+'common/default/', 
                    state.addAnswerEditorCreateParameObject.uploadPath, 
                    null,
                    state.fileSystem
                );

                state.addAnswerEditorCreateParameObject.toolbarRef = addAnswerContentEditorToolbarRef.value;
                state.addAnswerEditorCreateParameObject.textRef = addAnswerContentEditorTextRef.value;              
            }
        
        })
    }

    //查询添加答案页
    const queryAddAnswer = (questionId:string) => {
        let _key =  "addAnswer-"+state.questionId;
        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }

        proxy?.$axios({
            url: '/user/queryAddAnswer',
            method: 'get',
            params:  {},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                state.allowAnswer = data.allowAnswer;

                nextTick(()=>{
                    if(state.question?.allow && data.allowAnswer){
                        //编辑器图标
                        let editorIconList = new Array();
                        if(data.availableTag != null && data.availableTag != ''){
                            let availableTagObject = JSON.parse(data.availableTag);//JSON转为对象
                            if(availableTagObject != null && availableTagObject.length >0){
                                for(let i=0; i<availableTagObject.length; i++){
                                    let _availableTag = availableTagObject[i];
                                    
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
                                    }else if(_availableTag == "insertfile"){//文件
                                        editorIconList.push("file");
                                    }
                                }
                            }
                            state.availableTag = availableTagObject;//答案编辑器允许使用标签
                        }
                        
                        state.fileSystem = data.fileSystem;//文件存储系统


                        if (data.captchaKey != undefined && data.captchaKey != '') {
                            
                            state.showCaptcha.set(_key,true)
                            state.captchaKey.set(_key,data.captchaKey)
                            Object.assign(state.captchaValue, {[_key] : ''});
                            replaceCaptcha(_key);//刷新验证码
                        }


                        if (Object.keys(state.addAnswerEditorCreateParameObject).length === 0) {//等于空
                            let uploadPath = "user/control/answer/uploadImage?questionId="+state.questionId;

                            state.addAnswerEditorCreateParameObject = {
                                toolbarRef:addAnswerContentEditorToolbarRef.value,
                                textRef:addAnswerContentEditorTextRef.value,
                                editorIconList:editorIconList,
                                uploadPath:uploadPath,
                                userGradeList:null
                            }
                            
                        }
                        
                    }
            
                })
            }
            

        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

     //添加答案 -- 提交数据
     const onAddAnswerFormSubmit = () => {
        let _key =  "addAnswer-"+state.questionId;
        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            error.captchaValue.set(_key,'');
            if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){

                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                    checkCaptchaValue(state.captchaValue[_key].trim(), (err:string)=>{
                        if(err != undefined){
                            error.captchaValue.set(_key,err);
                            state.allowSubmit.set(_key,false);//提交按钮disabled状态
                        }else{
                            resolve();
                        }
                    },_key) 
                }else{
                    error.captchaValue.set(_key,"验证码不能为空");
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                }
            }else{
                resolve();
            }
        });

        Promise.all([p1])
            .then(() => {
                //清空所有错误
                error.content.delete(_key);
                error.captchaValue.delete(_key);
                error.answer.delete(_key);

                let formData = new FormData();
                formData.append('questionId', state.questionId);

                
                let content =  state.addAnswerEditor.txt.html()
                if(content != null && content !=''){
                    formData.append('content', content);
                }
                if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){
                    //验证码Key
                    formData.append('captchaKey', state.captchaKey.get(_key) as string);
                }
                
                //验证码值
                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                     formData.append('captchaValue', (state.captchaValue[_key] as string).trim());
                }

                proxy?.$axios({
                    url: '/user/control/answer/add',
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
                                message: '提交成功',
                                onClose: ()=>{
                                    
                                } 
                            });

                            state.popup_addAnswer = false;

                            //清空字段
                            state.addAnswerEditor.txt.clear();//清空


                            if(state.showCaptcha.get(_key) == true){
                                Object.assign(state.captchaValue, {[_key] : ''});
                            }

                            //清除答案列表
                            clearAnswerList();
                            
                            state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                            queryAnswerList(state.questionId,'','',1);


                        }else{
                            //处理错误信息
                            for (const [key, value] of Object.entries(result.error) as [string, string][]){
                                if(key == 'content'){
                                    error.content.set(_key,value);
                                }else if(key == 'answer'){
                                    error.answer.set(_key,value);
                                }else if(key == 'captchaValue'){
                                    error.captchaValue.set(_key,value);
                                }
                            }

                            if(result.captchaKey != null){
                                state.showCaptcha.set(_key,true);
                                state.captchaKey.set(_key,result.captchaKey);
                                Object.assign(state.captchaValue, {[_key] : ''});
                                replaceCaptcha(_key);
                            }else{
                                state.showCaptcha.set(_key,false);
                            }

                            
                        }
                        state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                    }
                })
                .catch((error: any) =>{
                    console.log(error);
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                });
            }).catch(() => {
                console.log("提交数据错误");
            });

    }
    //修改答案表单
    const editAnswerUI = (answer: Answer) => {
        let _key =  "editAnswer-"+answer.id;
        if(state.editAnswerFormView[answer.id] == true){//如果已打开
            return;
        }
        
        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }

        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        proxy?.$axios({
            url: '/user/queryEditAnswer',
            method: 'get',
            params:  {
                answerId: answer.id
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            let data =  response.data;

            let _answer = data.answer;

            if(data.allowAnswer && _answer != undefined){
                Object.assign(state.editAnswerFormView, {[answer.id] : true});

                nextTick(()=>{
               
                    //编辑器图标
                    let editorIconList = new Array();
                    if(data.availableTag != null && data.availableTag != ''){
                        let availableTagObject = JSON.parse(data.availableTag);//JSON转为对象
                        if(availableTagObject != null && availableTagObject.length >0){
                            for(let i=0; i<availableTagObject.length; i++){
                                let _availableTag = availableTagObject[i];
                                
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
                                }else if(_availableTag == "insertfile"){//文件
                                    editorIconList.push("file");
                                }
                            }
                        }
                        state.availableTag = availableTagObject;//答案编辑器允许使用标签
                    }

                    state.fileSystem = data.fileSystem;//文件存储系统


                    if (data.captchaKey != undefined && data.captchaKey != '') {
                        
                        state.showCaptcha.set(_key,true)
                        state.captchaKey.set(_key,data.captchaKey)
                        Object.assign(state.captchaValue, {[_key] : ''});
                        replaceCaptcha(_key);//刷新验证码
                    }

                    if (state.editAnswerEditorCreateParameMap.get(answer.id) == null || Object.keys(state.editAnswerEditorCreateParameMap.get(answer.id)).length === 0) {//等于空
                        let uploadPath = "user/control/answer/uploadImage?questionId="+state.questionId;
                
                                                                                    
                        let editAnswerContentEditorToolbarRefValue = (proxy?.$refs['editAnswerContentEditorToolbarRef_'+answer.id] as any)[0];
                        let editAnswerContentEditorTextRefValue = (proxy?.$refs['editAnswerContentEditorTextRef_'+answer.id] as any)[0];
                        
                        //创建富文本编辑器
                        let editor = createEditor(
                            editAnswerContentEditorToolbarRefValue,
                            editAnswerContentEditorTextRefValue,
                            editorIconList, 
                            getPageBasePath()+'common/default/', 
                            uploadPath, 
                            null,
                            state.fileSystem
                        );
                        editor.txt.html(_answer.content);//初始化内容
                        state.editAnswerEditorMap.set(answer.id,editor);

                        state.editAnswerEditorCreateParameMap.set(answer.id, {
                                toolbarRef:editAnswerContentEditorToolbarRefValue,
                                textRef:editAnswerContentEditorTextRefValue,
                                editorIconList:editorIconList,
                                uploadPath:uploadPath,
                                userGradeList:null
                        })

                    }
        
                })

                state.allowSubmit.set(_key,false);;//提交按钮disabled状态
            }else{
                if(!data.allowAnswer){
                    Notify({ 
                        type: 'warning', 
                        message: '不允许修改答案',
                        onClose: ()=>{
                            
                        } 
                    });
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    
    //修改答案 -- 提交数据
    const onEditAnswerFormSubmit = (answerId:string) => {
        let _key =  "editAnswer-"+answerId;
        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            error.captchaValue.set(_key,'');
            if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){

                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                    checkCaptchaValue(state.captchaValue[_key].trim(), (err:string)=>{
                        if(err != undefined){
                            error.captchaValue.set(_key,err);
                            state.allowSubmit.set(_key,false);//提交按钮disabled状态
                        }else{
                            resolve();
                        }
                    },_key) 
                }else{
                    error.captchaValue.set(_key,"验证码不能为空");
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                }
            }else{
                resolve();
            }
        });

        Promise.all([p1])
            .then(() => {
                //清空所有错误
                error.content.delete(_key);
                error.captchaValue.delete(_key);
                error.answer.delete(_key);

                let formData = new FormData();
                formData.append('answerId', answerId);

                let editAnswerEditor = state.editAnswerEditorMap.get(answerId);
                if(editAnswerEditor != null){
                    let content =  editAnswerEditor.txt.html()
                    if(content != null && content !=''){
                        formData.append('content', content);
                    }
                }
                
                if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){
                    //验证码Key
                    formData.append('captchaKey', state.captchaKey.get(_key) as string);
                }
                
                //验证码值
                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                     formData.append('captchaValue', (state.captchaValue[_key] as string).trim());
                }

                proxy?.$axios({
                    url: '/user/control/answer/edit',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;
                    
                        if(JSON.parse(result.success)){
                            Notify({ 
                                type: 'success', 
                                message: '提交成功',
                                onClose: ()=>{
                                    
                                } 
                            });

                            let editAnswerEditor = state.editAnswerEditorMap.get(answerId);
                            if(editAnswerEditor != null){
                                destroyEditor(editAnswerEditor);
                                state.editAnswerEditorMap.delete(answerId);
                                state.editAnswerEditorCreateParameMap.delete(answerId);
                            }
                            Object.assign(state.editAnswerFormView, {[answerId] : false});


                            if(state.showCaptcha.get(_key) == true){
                                Object.assign(state.captchaValue, {[_key] : ''});
                            }

                            //清除答案列表
                            clearAnswerList();

                            state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                            queryAnswerList(state.questionId,'','',1);

                        }else{
                            //处理错误信息
                            for (const [key, value] of Object.entries(result.error) as [string, string][]){
                                if(key == 'content'){
                                    error.content.set(_key,value);
                                }else if(key == 'answer'){
                                    error.answer.set(_key,value);
                                }else if(key == 'captchaValue'){
                                    error.captchaValue.set(_key,value);
                                }
                            }

                            if(result.captchaKey != null){
                                state.showCaptcha.set(_key,true);
                                state.captchaKey.set(_key,result.captchaKey);
                                Object.assign(state.captchaValue, {[_key] : ''});
                                replaceCaptcha(_key);
                            }else{
                                state.showCaptcha.set(_key,false);
                            }

                            
                        }
                        state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                    }
                })
                .catch((error: any) =>{
                    console.log(error);
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                });
            }).catch(() => {
                console.log("提交数据错误");
            });
    }

    //删除答案
    const onDeleteAnswer = (answerId:string) => {
        Dialog.confirm({
            message:'确定删除答案?',
        })
        .then(() => {
            let formData = new FormData();
            formData.append('answerId', answerId);

            proxy?.$axios({
                url: '/user/control/answer/delete',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                
                    if(JSON.parse(result.success)){
                        Notify({ 
                            type: 'success', 
                            message: '删除成功',
                            onClose: ()=>{
                                
                            } 
                        });
        

                        let editAnswerEditor = state.editAnswerEditorMap.get(answerId);
                        if(editAnswerEditor != null){
                            destroyEditor(editAnswerEditor);
                            state.editAnswerEditorMap.delete(answerId);
                            state.editAnswerEditorCreateParameMap.delete(answerId);
                        }
                        Object.assign(state.editAnswerFormView, {[answerId] : false});

                       
                        if(state.answerList != null && state.answerList.length > 0){
                            for(let i = state.answerList.length - 1; i >= 0; i--){ 
                                let answer = state.answerList[i];
                                if(answer.id == answerId){
                                    state.answerList.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    }else{
                        //处理错误信息
                        processErrorInfo(result.error as Map<string,string> , reactive({}),()=>{});


                        
                    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });
        })
        .catch(() => {
            // on cancel
        });
    }

    //添加回复表单
    const addReplyUI = (answerId:string) => {
        let _key =  "addReply-"+answerId;
        if(state.addReplyFormView[answerId] == true){//如果已打开
			return;
		}
        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }
        state.allowSubmit.set(_key,true);//提交按钮disabled状态


        proxy?.$axios({
            url: '/user/queryAddAnswerReply',
            method: 'get',
            params:  {
                answerId: answerId
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                if(data.allowReply){
                    Object.assign(state.addReplyFormView, {[answerId] : true});

                    if (data.captchaKey != undefined && data.captchaKey != '') {
                        
                        state.showCaptcha.set(_key,true)
                        state.captchaKey.set(_key,data.captchaKey)
                        Object.assign(state.captchaValue, {[_key] : ''});
                        replaceCaptcha(_key);//刷新验证码
                    }

                    state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                }else{
                    Notify({ 
                        type: 'warning', 
                        message: '不允许添加回复',
                        onClose: ()=>{
                            
                        } 
                    });
                }
            }
            
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //添加回复 -- 提交数据
    const onAddReply = (answerId:string) => {
        let _key =  "addReply-"+answerId;
        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            error.captchaValue.set(_key,'');
            if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){

                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                    checkCaptchaValue(state.captchaValue[_key].trim(), (err:string)=>{
                        if(err != undefined){
                            error.captchaValue.set(_key,err);
                            state.allowSubmit.set(_key,false);//提交按钮disabled状态
                        }else{
                            resolve();
                        }
                    },_key) 
                }else{
                    error.captchaValue.set(_key,"验证码不能为空");
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                }
            }else{
                resolve();
            }
        });

        Promise.all([p1])
            .then(() => {
                //清空所有错误
                error.replyContent.delete(_key);
                error.captchaValue.delete(_key);
                error.reply.delete(_key);

                let formData = new FormData();
                formData.append('answerId', answerId);

                if(state.answerList != null && state.answerList.length > 0){
                    for (let i = 0; i <state.answerList.length; i++) {
                        let answer = state.answerList[i];
                        if(answer.id == answerId){
                            formData.append('content',  state.addReplyContentField[i]);
                            break; 
                        }
                    }
                }
                
                if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){
                    //验证码Key
                    formData.append('captchaKey', state.captchaKey.get(_key) as string);
                }
                
                //验证码值
                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                     formData.append('captchaValue', (state.captchaValue[_key] as string).trim());
                }

                proxy?.$axios({
                    url: '/user/control/answer/addAnswerReply',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;
                    
                        if(JSON.parse(result.success)){
                            Notify({ 
                                type: 'success', 
                                message: '提交成功',
                                onClose: ()=>{
                                    
                                } 
                            });
                            
                            if(state.answerList != null && state.answerList.length > 0){
                                for (let i = 0; i <state.answerList.length; i++) {
                                    let answer = state.answerList[i];
                                    if(answer.id == answerId){
                                        state.addReplyContentField[i] = "";//清空
                                        break; 
                                    }
                                    
                                }
                            }
                            Object.assign(state.addReplyFormView, {[answerId] : false});

                            if(state.showCaptcha.get(_key) == true){
                                Object.assign(state.captchaValue, {[_key] : ''});
                            }


                            //清除答案列表
                            clearAnswerList();

                            state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                            queryAnswerList(state.questionId,'','',1);

                        }else{
                            //处理错误信息
                            for (const [key, value] of Object.entries(result.error) as [string, string][]){
                                if(key == 'content'){
                                    error.replyContent.set(_key,value);
                                }else if(key == 'reply'){
                                    error.reply.set(_key,value);
                                }else if(key == 'captchaValue'){
                                    error.captchaValue.set(_key,value);
                                }
                            }

                            if(result.captchaKey != null){
                                state.showCaptcha.set(_key,true);
                                state.captchaKey.set(_key,result.captchaKey);
                                Object.assign(state.captchaValue, {[_key] : ''});
                                replaceCaptcha(_key);
                            }else{
                                state.showCaptcha.set(_key,false);
                            }

                            
                        }
                        state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                    }
                })
                .catch((error: any) =>{
                    console.log(error);
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                });
            }).catch(() => {
                console.log("提交数据错误");
            });
    }

    //修改回复表单
    const editReplyUI = (reply:AnswerReply) => {
        let _key =  "editReply-"+reply.id;
        if(state.editReplyFormView[reply.id] == true){//如果已打开
			return;
		} 
        if(store_systemUser.value == null || Object.keys(store_systemUser.value).length==0){
            return;
        }
        state.allowSubmit.set(_key,true);//提交按钮disabled状态
    
        proxy?.$axios({
            url: '/user/queryEditAnswerReply',
            method: 'get',
            params:  {
                replyId: reply.id
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;
                let _reply = data.reply;
                if(data.allowReply && _reply != undefined){
                    Object.assign(state.editReplyFormView, {[reply.id] : true});

                    if (data.captchaKey != undefined && data.captchaKey != '') {
                        
                        state.showCaptcha.set(_key,true)
                        state.captchaKey.set(_key,data.captchaKey)
                        Object.assign(state.captchaValue, {[_key] : ''});
                        replaceCaptcha(_key);//刷新验证码
                    }

                    state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                }else{
                    if(!data.allowReply){
                        Notify({ 
                            type: 'warning', 
                            message: '不允许修改回复',
                            onClose: ()=>{
                                
                            } 
                        });
                    }
                }
            }
            
        })
        .catch((error: any) =>{
            console.log(error);
        });

    }

    //修改回复 -- 提交数据
    const onEditReply = (replyId:string) => {
        let _key =  "editReply-"+replyId;
        state.allowSubmit.set(_key,true);//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            error.captchaValue.set(_key,'');
            if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){

                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                    checkCaptchaValue(state.captchaValue[_key].trim(), (err:string)=>{
                        if(err != undefined){
                            error.captchaValue.set(_key,err);
                            state.allowSubmit.set(_key,false);//提交按钮disabled状态
                        }else{
                            resolve();
                        }
                    },_key) 
                }else{
                    error.captchaValue.set(_key,"验证码不能为空");
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                }
            }else{
                resolve();
            }
        });

        Promise.all([p1])
            .then(() => {
                //清空所有错误
                error.replyContent.delete(_key);
                error.captchaValue.delete(_key);
                error.reply.delete(_key);

                let formData = new FormData();
                formData.append('replyId', replyId);

                formData.append('content', state.editReplyContentField[replyId]); 
                
                if(state.captchaKey.get(_key) != undefined && state.captchaKey.get(_key) != null){
                    //验证码Key
                    formData.append('captchaKey', state.captchaKey.get(_key) as string);
                }
                
                //验证码值
                if(state.captchaValue[_key] != undefined && state.captchaValue[_key] != null && state.captchaValue[_key] != ''){
                     formData.append('captchaValue', (state.captchaValue[_key] as string).trim());
                }

                proxy?.$axios({
                    url: '/user/control/answer/editReply',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;
                    
                        if(JSON.parse(result.success)){
                            
                            Notify({ 
                                type: 'success', 
                                message: '提交成功',
                                onClose: ()=>{
                                    
                                } 
                            });
                           
                            Object.assign(state.editReplyFormView, {[replyId] : false});

                            //重置表单
                            //formAddCommentRef.value?.resetFields();
                            if(state.showCaptcha.get(_key) == true){
                                Object.assign(state.captchaValue, {[_key] : ''});
                            }

                            //清除答案列表
                            clearAnswerList();

                            state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
                            queryAnswerList(state.questionId,'','',1);

                        }else{
                            //处理错误信息
                            for (const [key, value] of Object.entries(result.error) as [string, string][]){
                                if(key == 'content'){
                                    error.replyContent.set(_key,value);
                                }else if(key == 'reply'){
                                    error.reply.set(_key,value);
                                }else if(key == 'captchaValue'){
                                    error.captchaValue.set(_key,value);
                                }
                            }

                            if(result.captchaKey != null){
                                state.showCaptcha.set(_key,true);
                                state.captchaKey.set(_key,result.captchaKey);
                                Object.assign(state.captchaValue, {[_key] : ''});
                                replaceCaptcha(_key);
                            }else{
                                state.showCaptcha.set(_key,false);
                            }

                            
                        }
                        state.allowSubmit.set(_key,false);;//提交按钮disabled状态
                    }
                })
                .catch((error: any) =>{
                    console.log(error);
                    state.allowSubmit.set(_key,false);//提交按钮disabled状态
                });
            }).catch(() => {
                console.log("提交数据错误");
            });
    }

    //删除回复
    const onDeleteReply = (replyId:string) => {
        Dialog.confirm({
            message:'确定删除回复?',
        })
        .then(() => {
            let _key =  "addReply-"+replyId;
            let _key2 =  "editReply-"+replyId;

            //清空所有错误
            error.replyContent.delete(_key);
            error.captchaValue.delete(_key);
            error.reply.delete(_key);

            error.replyContent.delete(_key2);
            error.captchaValue.delete(_key2);
            error.reply.delete(_key2);
            let formData = new FormData();
            formData.append('replyId', replyId);

        

            proxy?.$axios({
                url: '/user/control/answer/deleteReply',
                method: 'post',
                data: formData
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                
                    if(JSON.parse(result.success)){
                        Notify({ 
                            type: 'success', 
                            message: '删除成功',
                            onClose: ()=>{
                                
                            } 
                        });

                        delete state.addReplyFormView[replyId];
                        delete state.editReplyFormView[replyId];
                        delete state.editReplyContentField[replyId];


                        //重置表单
                        //formAddCommentRef.value?.resetFields();
                        if(state.showCaptcha.get(_key) == true){
                            Object.assign(state.captchaValue, {[_key] : ''});
                        }

                        if(state.answerList != null && state.answerList.length > 0){
                            for(let i = state.answerList.length - 1; i >= 0; i--){ 
                                let answer = state.answerList[i];
                                if(answer.answerReplyList != null && answer.answerReplyList.length >0){
                                    for(let j = answer.answerReplyList.length - 1; j >= 0; j--){ 
                                        let reply = answer.answerReplyList[j];
                                        if(reply.id == replyId){
                                            answer.answerReplyList.splice(j, 1);
                                        }
                                    }
                                }
                            }
                        }

                    }else{
                        //处理错误信息
                        processErrorInfo(result.error as Map<string,string> , reactive({}),()=>{});


                        
                    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });


        })
        .catch(() => {
            // on cancel
        });
    }


    //刷新验证码
    const replaceCaptcha = (key:string) => {
        state.imgUrl.set(key,store.baseURL+"captcha/" + state.captchaKey.get(key) + ".jpg?" + Math.random()) 
    }

    
    //校验验证码
    const checkCaptchaValue = (value: any, callback: any,key:string) => {
        if(state.captchaKey.get(key) != null && state.captchaKey.get(key) != ''){
            if (value === '') {
                return callback('验证码不能为空');
            }else{
                if (value.trim().length < 4) {
                    callback('验证码长度为4个字符')
                } else {   
                    
                    proxy?.$axios({
                        url: '/userVerification',
                        method: 'get',
                        params:  {
                            captchaKey:state.captchaKey.get(key),
                            captchaValue:state.captchaValue[key]
                        },
                        showLoading: false,//是否显示加载图标
                        loadingMask:false,// 是否显示遮罩层
                    })
                    .then((response: AxiosResponse) => {
                        if(response){
                            const result: any = response.data;
                            if(!JSON.parse(result)){
                                callback('验证码错误')
                            }else{
                                callback();
                            }
                        }
                    }).catch((error: any) =>{
                        console.log(error);
                    });
                }

            }
        }
    } 

    //校验验证码规则
    const checkCaptchaValueRules = (key:string) =>{
        error.captchaValue.set(key,'');
        checkCaptchaValue(state.captchaValue[key].trim(), (err:string)=>{
            if(err != undefined){
                error.captchaValue.set(key,err);
            }
        },key)
    }

    //查询相似问题
    const queryLikeQuestion = (questionId:string) => {
        proxy?.$axios({
            url: '/queryLikeQuestion',
            method: 'get',
            params:  {
                questionId:questionId
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data;
        })
        .then((data: Array<Question>) => {
            state.likeQuestionList.length =0;

            if(data){
                state.likeQuestionList = data;
            }
        }).catch((error: any) =>{
            console.log(error);
        });
    }
   
    //导航守卫
    onBeforeRouteUpdate((to, from, next) => {
        if(to.name == 'question'){
            if(to.query.questionId != undefined){
                state.questionId = to.query.questionId as string
            }
            //删除缓存
            store.setCacheNumber(to.name)
        }
        next();
    });



    onMounted(() => {
        state.questionId = router.currentRoute.value.query.questionId != undefined ?router.currentRoute.value.query.questionId as string :'';
        init();

        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))
    }) 

    

    //初始化
    const init = () => {
        queryQuestion(state.questionId,()=>{
            queryAddAnswer(state.questionId);
            queryFollowing(state.question.userName);//查询是否已关注该用户
        });
        
        queryAlreadyCollected(state.questionId);
        queryFavoriteCount(state.questionId);
        queryLikeQuestion(state.questionId);
    }
    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
      
        if(titleValue != null && titleValue != '' && state.question != null && Object.keys(state.question).length > 0){
            document.title = (state.question.title != null ? state.question.title : '')+ ' - ' + titleValue;
        }
    })
</script>
<style scoped lang="scss">
.questionContentModule{
    margin: var(--van-cell-group-inset-padding);
    .head{
        padding: 12px 12px 12px 12px;
        border-radius: var(--van-border-radius-lg);
        background: #fff;
        .container{
            display: flex;
            align-items:center;
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
                :deep(.van-button){
                    height: 36px;
                }
            }
        }
    }
    .questionDetail{
        margin-top: 8px;
        background: #fff;
        border-radius: var(--van-border-radius-lg);
        .head{
            
            .titleBox{
                font-size:0;/*父级元素设置font-size:0; 解决 display:inline-block两个元素之间的默认空格 */
                line-height:0;
                .title {
                    color: var(--van-gray-8);
                    font-weight: 400;
                    font-size: 20px;
                    line-height: 30px;
                }
            }
            .info{
                margin-top: 5px;
                padding-bottom: 10px;
                display: flex;
                align-items: flex-end;
                .left-layout{
                    flex: 1;
                    margin-right: 10px;
                    position: relative;
                    top: 5px;
                    .tagName-box{
                        display: inline-block;
                        position: relative;
                        .tagName{
                            border-radius: 3px;
                            background-color: var(--van-gray-1);
                            color: var(--van-gray-6);
                            height:26px;
                            line-height:26px;
                            padding-left:8px;
                            padding-right:8px;
                            margin-top: 6px;
                            margin-right: 6px;
                            font-size: 14px;

                            display: -webkit-box;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            -webkit-line-clamp: 1;
                            -webkit-box-orient: vertical;
                            word-wrap:break-word;
                            word-break:break-all;
                            
                        }
                    }
                    
                    
                }
                .right-layout{
                    color: var(--van-gray-6);
                    font-size: 14px;
                    .statistics{
                        position: relative;
                        top: -3px;
                        .icon{
                            position: relative;
                            top: 2px;
                        }
                        .answerTotal{
                            margin-left: 2px;
                            margin-right: 12px;
                        }
                        .viewTotal{
                            margin-left: 2px;
                        }
                        .more{
                            margin-left: 12px;
                            position: relative;
                            top: 1px;
                        }
                    }
                    
                }
            }
        }

        :deep(.questionContent){
            margin-left: 12px;
            margin-right: 12px;
            padding-bottom: 20px;
            color:var(--van-gray-8);
            font-size:16px; 
            line-height:1.75; 
            word-wrap:break-word;
            min-height: 100px;
            .reward{
                margin-top: 5px;
                margin-bottom: 20px;
                background: #fcf3e6;
                
                height: 36px;
                line-height: 36px;
                border-radius:3px;
                padding: 5px;
                .info{
                    padding: 0px 12px;color: #e2b46d;font-size: 16px;
                    position: relative;top: -1px;
                    .icon{
                        font-size: 26px;position: relative;top: 7px;left: -4px;
                    }
                    .symbol{
                        font-family:Arial;font-weight:normal; vertical-align: middle; display:inline-block;margin-left: 5px;color: #cca558;
                    }
                    .amount{
                        margin-left: 1px;color: #cca558; margin-right: 5px;font-weight: 700;font-size: 18px;position: relative;top: 1px;
                    }
                    .point{
                        color: #cca558; margin-right: 5px;font-weight: 700;font-size: 18px;position: relative;top: 1px;
                    }
                }
            }
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
            a{
                color: var(--van-blue);
            }
            p{
                font-size:16px;
                word-wrap:break-word
            }
            img{
                max-width:100%;height:auto;border:none;background:none;margin:0;padding:0; 
                cursor: -webkit-zoom-in;
                cursor: zoom-in;
                vertical-align: sub;
            }

            /** 解决Chrome内核浏览器DPI缩放比例高于100%时部分边框变粗问题   本方案需删除table样式 border="1" bordercolor="#000000" */
            table {
                border-collapse: separate; 
                border-spacing: 0; 
                border-top: 1px solid var(--van-gray-3);
                border-left: 1px solid var(--van-gray-3);
                th {
                    font-weight: 600
                }
                th, td {
                    border-right: 1px solid var(--van-gray-3);
                    border-bottom: 1px solid var(--van-gray-3);
                    padding: 6px 13px
                }
                tr {
                    background-color: #fff;
                    border-top: 1px solid var(--van-gray-3);
                    &:nth-child(2n) {
                        background-color: var(--van-gray-1);
                    }
                }
            }
            ol{
                li{ 
                    list-style-type:decimal;
                    list-style-position:inside;
                }
            }
            ul{
                li{ 
                    margin-left:20px;
                    list-style-type:disc;
                }
            }
            iframe{
                width:100%; height: 300px;padding:10px 0px; 
            }
            player{
                width: 100%;
                height: 576px;
                display: block;
                margin-top: 10px;
                margin-bottom: 10px;
                //关闭页面全屏按钮
                .dplayer-full-in-icon{
                    display: none !important;
                }
            }
            .dplayer-process {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 10;
                .box{
                    position: relative;
                    width: 100%;
                    height: 100%;
                    .prompt{
                        width: 250px;
                        height: 80px;
                        position: absolute;
                        left: 0;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        margin: 100px auto;
                        padding :0px 30px;
                        border-radius :3px;
                        color: #fff;
                        line-height: 80px;
                        font-size: 20px;
                        background-color:rgb(0,0,0);
                        opacity:0.7;
                        filter:alpha(opacity=70);
                        text-align: center;
                    }
                }
            }
            //自动换行
            pre{
                white-space:pre-wrap;
            }
        }

        :deep(.appendBox){
            margin-top:10px;
            margin-left: 12px;
            margin-right: 12px;
            position:relative;
            .appendHead {
                height: 24px;
                .prompt{
                    font-size: 15px;
                    line-height: 34px;
                }
                .appendTime{
                    margin-left:5px;
                    font-size: 15px;
                    line-height: 34px;
                }
            }
            .appendContent{
                padding:20px 0px;
                color:var(--van-gray-8);
                font-size:16px; 
                line-height:1.75; 
                word-wrap:break-word;
                min-height: 80px;
                a{
                    color: var(--van-blue);
                }
                p{
                    font-size:16px;word-wrap:break-word
                }
                img{
                    max-width:100%;height:auto;border:none;background:none;margin:0;padding:0;
                    cursor: -webkit-zoom-in;
                    cursor: zoom-in;
                    vertical-align: sub;
                }
                /** 解决Chrome内核浏览器DPI缩放比例高于100%时部分边框变粗问题   本方案需删除table样式 border="1" bordercolor="#000000" */
                table {
                    border-collapse: separate; 
                    border-spacing: 0; 
                    border-top: 1px solid var(--van-gray-3);
                    border-left: 1px solid var(--van-gray-3);
                    th {
                        font-weight: 600
                    }
                    th, td {
                        border-right: 1px solid var(--van-gray-3);
                        border-bottom: 1px solid var(--van-gray-3);
                        padding: 6px 13px
                    }
                    tr {
                        background-color: #fff;
                        border-top: 1px solid var(--van-gray-3);
                        &:nth-child(2n) {
                            background-color: var(--van-gray-1);
                        }
                    }
                }
                ol{
                    li{ 
                        list-style-type:decimal;
                        list-style-position:inside;
                    }
                }
                ul{
                    li{ 
                        margin-left:20px;
                        list-style-type:disc;
                    }
                }
                pre{
                    white-space:pre-wrap;
                }
            }
        }
        .odd{
            .appendHead{
                color: #f9ce00;
            }
            &:before{
                content: " ";
                position: absolute;
                top: 0px;
                left: -12px;
                bottom:0px;
                border-left: 5px solid #f9ce00;
            }
        }
        .even{
            .appendHead{
                color: #85eb4e;
            }
            &:before{
                content: " ";
                position: absolute;
                top: 0px;
                left: -12px;
                bottom:0px;
                border-left: 5px solid #85eb4e;
            }
        }
            
        .operating {
            display:inline-block;
            text-align: center;
            width: 100%;
            .bottomInfo{
                margin-top: 12px;
                margin-bottom: 12px;
                .favorites{
                    height: 38px;
                    border-radius: var(--van-button-round-border-radius); //var(--van-border-radius-lg);
                    border: var(--van-button-border-width) solid var(--van-gray-4);
                    color: var(--van-gray-6);
                    
                }
                .icon{
                    margin-right: 4px;
                    position: relative;
                    top: 2px;
                }
            }
        }
    }
    .allow-answer-wrap{
        margin-top: 8px;
        background: #fff;
        padding: 12px;
        border-radius: var(--van-border-radius-lg);
        .no-answer-button{
            text-align: center;
            background: var(--van-gray-1);
            color: var(--van-gray-6);
            line-height: 42px;
            border-radius: var(--van-border-radius-lg);
        }

        .answer-button{
            .login-button{
                text-align: center;
                background: var(--van-gray-1);
                color: var(--van-gray-6);
                line-height: 42px;
                border-radius: var(--van-border-radius-lg);
                span{
                    color: var(--van-blue);
                    margin-right: 3px;
                }
            }
        }
    }
    .no-answer-wrap{
        margin-top: 8px;
        background: #fff;
        padding: 12px;
        border-radius: var(--van-border-radius-lg);
        .no-answer{
            text-align: center;
            background: var(--van-gray-1);
            color: var(--van-gray-6);
            line-height: 42px;
            border-radius: var(--van-border-radius-lg);
        }
    }
    .answerList{
        margin-top: 8px;
        background: #fff;
        border-radius: var(--van-border-radius-lg);
        .active{
            position:relative;
            .adoption{
                display: inline;
                position: absolute;
                right: -13px;
                top: 0px;
                .ribbon-wrapper {
                    width: 70px;
                    height: 72px;
                    overflow: hidden;
                    position: absolute;
                    top: -6px;
                    right: -3px; 
                    .ribbon {
                        font-size: 14px;
                        font-weight: 600;
                        line-height: 14px;
                        text-align: center;
                        text-transform: uppercase;
                        transform: rotate(45deg);
                        position: relative;
                        padding: 4px 0;
                        left: -5px;
                        top: 16px;
                        width: 98px;
                        background-color: #fe9d2d;
                        color: #fff;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        letter-spacing: 0.5px;
                        &:before, &:after {
                            content: "";
                            border-top: 4px solid #ce8025;
                            border-left: 4px solid transparent;
                            border-right: 4px solid transparent;
                            position: absolute;
                            bottom: -4px;
                        }
                        &:before {
                            left: 0; 
                        }
                        &:after {
                            right: 0; 
                        }
                    }
                }
            }
            &:before{
                content: " ";
                position: absolute;
                top: 0px;
                left: -12px;
                bottom:0px;
                border-left: 5px solid #fe9d2d;
            }

            .top-container{
                .right-layout{
                    .more{
                        position: relative;
                        top: 1px;
                        width: 55px;
                    }
                }
            }
            
        }
        .item{
            margin-left: 12px;
            margin-right: 12px;
            padding-top: 12px;
            padding-bottom: 12px;

            .top-container{
                display: flex;

                .adoption{
                    display: none;
                    position: absolute;
                }

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
                        .cancelNickname{
                            font-weight:normal;
                            margin-right: 3px;
                            color: transparent;
                            text-shadow: 0 0 5px rgba(0,0,0,0.4);
                            zoom: 1;
                            user-select:none;
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
                    display: flex;
                    position: relative;
                    top: -2px;
                    .floor{
                        font-size: 12px;
                        color: var(--van-gray-6);
                    }
                    .more{
                        margin-left: 10px;
                        color: var(--van-gray-6);
                        position: relative;
                        top: 1px;
                    }
                }
            }
            .bottom-container{
                :deep(.quote){
                    padding:5px 8px;
                    border-bottom:none;
                    text-align: left;
                    margin-top: 20px;
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
                    }
                    .cancelNickname{
                        font-weight:normal;
                        color: transparent;
                        text-shadow: 0 0 5px rgba(0,0,0,0.4);
                        zoom: 1;
                        user-select:none;
                    }
                }
                :deep(.answerContent){
                    padding-bottom: 10px;
                    word-wrap:break-word;
                    color: var(--van-gray-8);
                    font-size:15px; 
                    line-height:1.75; 
                    margin-top: 20px;
                    
                    .cancelAccount{
                        display: inline-block;
                        vertical-align: middle;
                        padding: 6px 6px;
                        font-size: 14px;
                        line-height: 14px;
                        -webkit-border-radius: 2px;
                        -moz-border-radius: 2px;
                        border-radius: 2px;
                        color:  var(--van-gray-5);
                        background-color:  var(--van-gray-1);
                    }
                    img {
                        max-width:100%;
                        height:auto;
                        border:none;
                        background:none;
                        margin:0;
                        padding:0;
                        vertical-align: sub;
                    }
                    pre{
                        white-space:pre-wrap;
                        code{/*连续字母数字换行*/
                            word-break: break-all;
                        }
                    }
                    table {
                        width: 100%;
                        th {
                            font-weight: 600
                        }
                        td,th {
                            border: 1px solid  var(--van-gray-3);
                            padding: 6px 13px
                        }
                        tr {
                            background-color: #fff;
                            border-top: 1px solid  var(--van-gray-3);
                            &:nth-child(2n) {
                                background-color:  var(--van-gray-1);
                            }
                        }
                    }
                    ol{
                        li{ 
                            list-style-type:decimal;
                            list-style-position:inside;
                        }
                    }
                    ul{
                        li{ 
                            margin-left:20px;
                            list-style-type:disc;
                        }
                    }
                }
                .replyList{
                    margin-top: 15px;
                    margin-left: 50px;
                    position: relative;
                    &:before {
                        position: absolute;
                        width: 14px;
                        height: 14px;
                        box-sizing: border-box;
                        content: " ";
                        pointer-events: none;
                        border-top: 1px solid var(--van-gray-3);
                        border-left: 1px solid var(--van-gray-3);
                        transform: rotate(45deg) scale(.5) ;
                        background-color: #fff;
                        top: -7px;
                        left: 30px;
                        z-index: 1;
                    }
                    .reply-container{
                        padding-top: 12px;
                        padding-bottom: 12px;
                        .top-container{
                            display: flex;
                            .left-layout{
                                .avatarImg{
                                    img {
                                        width: 32px;
                                        height: 32px;
                                        border-radius:32px;
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
                                        top: -3px;
                                    }  
                                    .userRoleName{
                                        display: inline-block;
                                        white-space:nowrap;
                                        vertical-align: middle;
                                        padding: 2px 4px;
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
                                        top: -1px;
                                    }
                                    .staff{
                                        display: inline-block;
                                        white-space:nowrap;
                                        vertical-align: middle;
                                        padding: 2px 4px;
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
                                        top: -1px;
                                    }
                                    .time{
                                        width:100%;
                                        color: var(--van-gray-6);
                                        font-size: 12px;
                                        position: relative;
                                        top: -2px;
                                    }
                                }
                                
                            }
                            .right-layout{
                                display: flex;
                                .more{
                                    color: var(--van-gray-6);
                                    position: relative;
                                    top: 1px;
                                }
                            }
                        }
                        .bottom-container{
                           
                            .replyContent{
                                font-size: 15px;
                                line-height:26px;
                                color:var(--van-gray-8);
                                margin-top: 8px;
                                padding-top: 8px;
                                padding-bottom: 8px;
                                word-break:break-all;
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
                                    background-color:  var(--van-gray-1);
                                }
                            }
                        }
                    }
                    .link {
                        text-align: right;
                        margin-bottom: 5px;
                        span {
                            font-size: 14px;
                            color: var(--van-blue);
                        }
                    }
                }
            }
        }
    }
}

.appendQuestionModule{
    overflow-y:auto;
	-webkit-overflow-scrolling: touch;
	height: 100%; 
    .form-container{
        .van-cell {
            padding: 0px var(--van-cell-horizontal-padding) var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding);
        
            &:after {
                border-bottom: 1px solid transparent;
            }
        }
        [class*=van-hairline]:after{
            border-bottom: 1px solid transparent;
        }
        .submitButton{
            width: 100%;
            margin: 16px 0px;
        }
        
    }
}

.addAnswerModule{
    overflow-y:auto;
	-webkit-overflow-scrolling: touch;
	height: 100%; 
    .form-container{
        .van-cell {
            padding: 0px var(--van-cell-horizontal-padding) var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding);
        
            &:after {
                border-bottom: 1px solid transparent;
            }
        }
        [class*=van-hairline]:after{
            border-bottom: 1px solid transparent;
        }
        .submitButton{
            width: 100%;
            margin: 16px 0px;
        }
        
    }
}
.editAnswerModule{
    overflow-y:auto;
	-webkit-overflow-scrolling: touch;
	height: 100%; 
    .form-container{
        .van-cell {
            padding: 0px var(--van-cell-horizontal-padding) var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding);
        
            &:after {
                border-bottom: 1px solid transparent;
            }
        }
        [class*=van-hairline]:after{
            border-bottom: 1px solid transparent;
        }
        .submitButton{
            width: 100%;
            margin: 16px 0px;
        }
        
    }
}
.addReplyModule{
    overflow-y:auto;
	-webkit-overflow-scrolling: touch;
	height: 100%; 

    margin: 16px 0px 8px 0px;
    .replyContent-item{
        :deep(.van-field__control){
            padding: 10px;
            background-color: var(--van-gray-1);
            overflow:hidden;//让输入框触摸可以滑动
        }
        
        &:after{
            border-bottom: 1px solid transparent;
        }
    }
    .captcha-item{
        :deep(.van-field__control){
            background-color: var(--van-gray-1);
        }
        :deep(.van-field__control){
            padding: 10px;
            border-radius: 3px;
        }
        &:after{
            border-bottom: 1px solid transparent;
        }
    }
    .submitButton{
        width: 100%;
        margin: 16px 0px;
    }
}

.editReplyModule{
    overflow-y:auto;
	-webkit-overflow-scrolling: touch;
	height: 100%; 

    margin: 16px 0px 8px 0px;
    .replyContent-item{
        :deep(.van-field__control){
            padding: 10px;
            background-color: var(--van-gray-1);
            overflow:hidden;//让输入框触摸可以滑动
        }
        
        &:after{
            border-bottom: 1px solid transparent;
        }
    }
    .captcha-item{
        :deep(.van-field__control){
            background-color: var(--van-gray-1);
        }
        :deep(.van-field__control){
            padding: 10px;
            border-radius: 3px;
        }
        &:after{
            border-bottom: 1px solid transparent;
        }
    }
    .submitButton{
        width: 100%;
        margin: 16px 0px;
    }
}

/** 相似问题 **/
.likeQuestionModule{
    margin: var(--van-cell-group-inset-padding);
	background: #fff;
    border-radius: var(--van-border-radius-lg);
    .likeQuestion{
        margin-bottom:10px;
        padding:0 12px 0;
        .title{
            font-size:16px;
            padding:20px 0 15px;
            color:var(--van-gray-8);
        }
        .questionList {
            font-size: 15px;
            margin-top: 12px;
            padding-bottom: 12px;
            > .question-title {
                counter-increment: index;
                display: flex;
                flex-direction: row;
                padding-top: 5px;
                padding-bottom: 5px;
                &::before {
                    content: counter(index);
                    display: flex;
                    width: 22px;
                    height: 22px;
                    background-color: #E8F3FF;
                    text-align: center;
                    border-radius: 4px;
                    flex: none;
                    align-items: center;
                    justify-content: center;
                    color: var(--van-blue);
                    position: relative;
                    top: 1px;
                }
                .top{
                    &::before {
                        background-color: var(--van-blue);
                        color: #fff;
                    }
                }
                > a {
                    display: block;
                    word-break: break-word; 
                    font-size: 15px;
                    flex: auto;
                    margin-left: 8px;
                    line-height: 26px;
                    color: var(--van-gray-8);
                    &:hover {
                        color: var(--van-blue);
                    }
                }
            }
        }
    }
}

</style>