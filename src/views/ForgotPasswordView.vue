<script setup>
import {
    NConfigProvider,
    NSpace,
    NImage,
    NForm,
    NFormItem,
    NInput,
    NButton,
    NDivider,
    NSteps,
    NStep,
    NIcon,
    useMessage,
    NSpin
}                               from    'naive-ui';
import {
    ref,
    computed
}                               from    'vue';
import {
    isDark
}                               from    '../hooks/useDark';
import {
    forgotPassword,
    verifyOTP,
    resetPassword
}                               from    '../services/apiUser';
import {
    useRouter
}                               from    'vue-router';

const message                   =       useMessage();
const router                    =       useRouter();

//==========> State
const currentStep               =       ref(1);
const loading                   =       ref(false);
const email                     =       ref('');
const otp                       =       ref('');
const resetToken                =       ref('');
const countdown                 =       ref(0);
let countdownInterval           =       null;

//==========> Form refs
const emailFormRef              =       ref(null);
const otpFormRef                =       ref(null);
const passwordFormRef           =       ref(null);

const passwordForm              =       ref({
    password: '',
    confirmPassword: ''
});

//==========> Validation rules
const emailRules                =       {
    email: [
        { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
        { type: 'email', message: 'Email không hợp lệ', trigger: 'blur' }
    ]
};

const otpRules                  =       {
    otp: [
        { required: true, message: 'Vui lòng nhập mã OTP', trigger: 'blur' },
        { len: 6, message: 'Mã OTP phải có 6 chữ số', trigger: 'blur' }
    ]
};

const passwordRules             =       {
    password: [
        { required: true, message: 'Vui lòng nhập mật khẩu mới', trigger: 'blur' },
        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: 'Vui lòng xác nhận mật khẩu', trigger: 'blur' },
        {
            validator: (rule, value) => {
                return value === passwordForm.value.password;
            },
            message: 'Mật khẩu xác nhận không khớp',
            trigger: 'blur'
        }
    ]
};

//==========> Computed
const canResendOTP              =       computed(() => countdown.value === 0);

//==========> Methods
const startCountdown = () => {
    countdown.value = 60;
    countdownInterval = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
};

const handleSendOTP = async () => {
    try {
        await emailFormRef.value?.validate();
        loading.value = true;
        const response = await forgotPassword(email.value);
        message.success(response.message);
        currentStep.value = 2;
        startCountdown();
    } catch (error) {
        if (error?.response?.data?.message) {
            message.error(error.response.data.message);
        } else if (error instanceof Error && !error.message?.includes('validation')) {
            message.error('Có lỗi xảy ra');
        }
    } finally {
        loading.value = false;
    }
};

const handleResendOTP = async () => {
    if (!canResendOTP.value) return;
    
    loading.value = true;
    try {
        const response = await forgotPassword(email.value);
        message.success(response.message);
        startCountdown();
    } catch (error) {
        message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
        loading.value = false;
    }
};

const handleVerifyOTP = async () => {
    try {
        await otpFormRef.value?.validate();
        loading.value = true;
        const response = await verifyOTP(email.value, otp.value);
        if (response.status === 'success' && response.resetToken) {
            message.success(response.message);
            resetToken.value = response.resetToken;
            currentStep.value = 3;
        } else {
            message.error('Xác thực OTP thất bại');
        }
    } catch (error) {
        if (error?.response?.data?.message) {
            message.error(error.response.data.message);
        } else if (error instanceof Error && !error.message?.includes('validation')) {
            message.error('Có lỗi xảy ra');
        }
    } finally {
        loading.value = false;
    }
};

const handleResetPassword = async () => {
    try {
        await passwordFormRef.value?.validate();
        loading.value = true;
        const response = await resetPassword(resetToken.value, passwordForm.value.password);
        message.success(response.message);
        // Chuyển về trang đăng nhập sau 2 giây
        setTimeout(() => {
            router.push('/auth/login');
        }, 2000);
    } catch (error) {
        if (error?.response?.data?.message) {
            message.error(error.response.data.message);
        } else if (error instanceof Error && !error.message?.includes('validation')) {
            message.error('Có lỗi xảy ra');
        }
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    if (currentStep.value > 1) {
        currentStep.value--;
    } else {
        router.push('/auth/login');
    }
};

//==========> Theme
const themeLight                =       {
    Input: {
        textColor: '#ffffff',
        placeholderTextColor: 'rgba(255,255,255,0.5)',
        color: 'rgba(255,255,255,0.08)',
        colorFocus: 'rgba(255,255,255,0.12)',
        colorError: 'rgba(255,255,255,0.08)',
        colorFocusError: 'rgba(255,255,255,0.12)',
        borderColor: 'rgba(255,255,255,0.4)',
        borderColorHover: 'rgba(255,255,255,0.7)',
        borderColorFocus: '#ffffff',
        borderColorError: '#ff4d4f',
        borderColorFocusError: '#ff4d4f',
        boxShadowFocus: '0 0 0 2px rgba(255,255,255,0.2)',
        boxShadowFocusError: '0 0 0 2px rgba(255,0,0,0.3)'
    },
    Form: {
        labelTextColor: '#fff'
    },
    Steps: {
        indicatorColorProcess: '#880888',
        indicatorBorderColorProcess: '#880888',
        headerTextColorProcess: '#fff',
        headerTextColorWait: 'rgba(255,255,255,0.5)',
        headerTextColorFinish: '#22c55e',
        indicatorColorFinish: '#22c55e',
        indicatorBorderColorFinish: '#22c55e',
        splitorColorProcess: 'rgba(255,255,255,0.3)',
        splitorColorFinish: '#22c55e'
    }
};

const themeDark                 =       {
    Input: {
        color: 'rgba(255, 255, 255, 0.1)',
        colorHover: 'rgba(255, 255, 255, 0.15)',
        colorFocus: 'rgba(255, 255, 255, 0.2)',
        textColor: '#fff',
        placeholderColor: 'rgba(255, 255, 255, 0.38)',
        borderColor: 'rgba(255, 255, 255, 0.24)',
        borderHover: '#6b7280',
        borderFocus: '#2563eb'
    },
    Steps: {
        indicatorColorProcess: '#880888',
        indicatorBorderColorProcess: '#880888'
    }
};
</script>


<template>
    <NConfigProvider :theme-overrides="isDark ? themeDark : themeLight">
        <NSpace vertical justify="center" align="center" class="min-h-screen">
            <NSpace align="center" class="mb-4 absolute left-4 top-4">
                <NImage class="rounded-full overflow-hidden shadow-md" width="80" src="/logo-nobg.png" />
                <h1 class="text-4xl font-bold text-gray-300">RuryLib</h1>
            </NSpace>

            <NSpace vertical class="bg-[url('/banner/book-bg2.png')] bg-cover p-8 rounded-md shadow-lg ring-2 ring-slate-100/50 min-w-[500px]">
                <NSpace vertical>
                    <h1 class="text-2xl uppercase font-semibold text-slate-300 text-center">Quên mật khẩu</h1>
                    
                    <!-- Steps indicator -->
                    <NSteps :current="currentStep" class="my-6">
                        <NStep title="Nhập Email" />
                        <NStep title="Xác thực OTP" />
                        <NStep title="Đặt lại mật khẩu" />
                    </NSteps>

                    <NSpin :show="loading">
                        <!-- Step 1: Enter Email -->
                        <div v-show="currentStep === 1">
                            <NSpace vertical align="center" class="p-4">
                                <p class="text-slate-300 text-center mb-4">
                                    Nhập email đã đăng ký để nhận mã OTP
                                </p>
                                <NForm ref="emailFormRef" :model="{ email }" :rules="emailRules" class="w-full">
                                    <NFormItem label="Email" path="email">
                                        <NInput 
                                            v-model:value="email" 
                                            placeholder="Nhập email của bạn"
                                            class="min-w-xs"
                                        >
                                            <template #prefix>
                                                <i class="fa-solid fa-envelope text-white/50"></i>
                                            </template>
                                        </NInput>
                                    </NFormItem>
                                    <NButton 
                                        @click="handleSendOTP" 
                                        class="w-full" 
                                        color="rgb(136, 8, 136)"
                                        :disabled="loading"
                                    >
                                        <i class="fa-solid fa-paper-plane mr-2"></i>
                                        Gửi mã OTP
                                    </NButton>
                                </NForm>
                            </NSpace>
                        </div>

                        <!-- Step 2: Enter OTP -->
                        <div v-show="currentStep === 2">
                            <NSpace vertical align="center" class="p-4">
                                <p class="text-slate-300 text-center mb-4">
                                    Mã OTP đã được gửi đến <strong>{{ email }}</strong>
                                </p>
                                <NForm ref="otpFormRef" :model="{ otp }" :rules="otpRules" class="w-full">
                                    <NFormItem label="Mã OTP" path="otp">
                                        <NInput 
                                            v-model:value="otp" 
                                            placeholder="Nhập mã OTP 6 chữ số"
                                            class="min-w-xs text-center tracking-widest text-2xl"
                                            maxlength="6"
                                        >
                                            <template #prefix>
                                                <i class="fa-solid fa-key text-white/50"></i>
                                            </template>
                                        </NInput>
                                    </NFormItem>
                                    <NSpace vertical class="w-full">
                                        <NButton 
                                            @click="handleVerifyOTP" 
                                            class="w-full" 
                                            color="rgb(136, 8, 136)"
                                            :disabled="loading"
                                        >
                                            <i class="fa-solid fa-check mr-2"></i>
                                            Xác nhận OTP
                                        </NButton>
                                        <NButton 
                                            @click="handleResendOTP"
                                            class="w-full"
                                            quaternary
                                            :disabled="!canResendOTP || loading"
                                        >
                                            <template v-if="canResendOTP">
                                                <i class="fa-solid fa-rotate-right mr-2"></i>
                                                Gửi lại mã OTP
                                            </template>
                                            <template v-else>
                                                Gửi lại sau {{ countdown }}s
                                            </template>
                                        </NButton>
                                    </NSpace>
                                </NForm>
                            </NSpace>
                        </div>

                        <!-- Step 3: Reset Password -->
                        <div v-show="currentStep === 3">
                            <NSpace vertical align="center" class="p-4">
                                <p class="text-slate-300 text-center mb-4">
                                    <i class="fa-solid fa-circle-check text-green-500 mr-2"></i>
                                    Xác thực thành công! Hãy đặt mật khẩu mới
                                </p>
                                <NForm ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" class="w-full">
                                    <NFormItem label="Mật khẩu mới" path="password">
                                        <NInput 
                                            v-model:value="passwordForm.password" 
                                            type="password"
                                            placeholder="Nhập mật khẩu mới"
                                            class="min-w-xs"
                                            show-password-on="mousedown"
                                        >
                                            <template #prefix>
                                                <i class="fa-solid fa-lock text-white/50"></i>
                                            </template>
                                        </NInput>
                                    </NFormItem>
                                    <NFormItem label="Xác nhận mật khẩu" path="confirmPassword">
                                        <NInput 
                                            v-model:value="passwordForm.confirmPassword" 
                                            type="password"
                                            placeholder="Nhập lại mật khẩu mới"
                                            class="min-w-xs"
                                            show-password-on="mousedown"
                                        >
                                            <template #prefix>
                                                <i class="fa-solid fa-lock text-white/50"></i>
                                            </template>
                                        </NInput>
                                    </NFormItem>
                                    <NButton 
                                        @click="handleResetPassword" 
                                        class="w-full" 
                                        color="rgb(136, 8, 136)"
                                        :disabled="loading"
                                    >
                                        <i class="fa-solid fa-save mr-2"></i>
                                        Đặt lại mật khẩu
                                    </NButton>
                                </NForm>
                            </NSpace>
                        </div>
                    </NSpin>
                </NSpace>

                <NDivider />
                <NSpace justify="space-between">
                    <NButton size="small" quaternary @click="goBack">
                        <template #icon>
                            <i class="fa-solid fa-arrow-left"></i>
                        </template>
                        Quay lại
                    </NButton>
                    <NButton size="small" color="rgb(136, 8, 136)">
                        <template #icon>
                            <i class="fa-solid fa-right-to-bracket"></i>
                        </template>
                        <router-link to="/auth/login">Đăng nhập</router-link>
                    </NButton>
                </NSpace>
            </NSpace>
        </NSpace>
    </NConfigProvider>
</template>


<style scoped>

</style>
