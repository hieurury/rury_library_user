<script setup>
import {
    NConfigProvider,
    NSpace,
    NImage,
    NForm,
    NFormItem,
    NInput,
    NButton,
    NGrid,
    NGi,
    NDivider,
    NCarousel,
    NIcon,
    useMessage
}                               from    'naive-ui';
import {
    ref
}                               from    'vue';
import {
    isDark
}                               from    '../hooks/useDark';
import {
    loginccount
}                               from    '../services/apiUser';
import {
    setAccountData,
    setToken
}                               from    '../hooks/useAccount'
import {
    useRouter
}                               from    'vue-router';

const message                   =       useMessage();
const router                    =       useRouter();

//==========> Liên quan đến đăng nhập
const formRef                   =       ref(null);
const formData                  =       ref({
    phone: '',
    password: ''
});

const formRules                 =       {
    phone: [
        { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' },
        { pattern: /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-4|6-9])[0-9]{7}$/, message: 'Số điện thoại không hợp lệ', trigger: 'blur' }
    ],
    password: [
        { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự', trigger: 'blur' }
    ]
};



const submitForm                =       () => {
    formRef.value.validate( async (error) => {
        if (!error) {
            const data          =       {
                DIENTHOAI: formData.value.phone,
                PASSWORD: formData.value.password
            };
            const response      =       await loginccount(data);
            message[response.status](response.message);
            if(response.status === 'success') {
                setAccountData(response.data);
                setToken(response.token);
                router.push('/user/profile');
            }
        } else {
            message.error('Vui lòng kiểm tra lại thông tin đăng nhập');
        }
    });
};
//<========== Liên quan đến đăng nhập


const themeLight                =       {
    Input: {
        textColor: '#ffffff',
        placeholderTextColor: 'rgba(255,255,255,0.5)',
        color: 'rgba(255,255,255,0.08)',          // nền bình thường
        colorFocus: 'rgba(255,255,255,0.12)',     // nền khi focus
        colorError: 'rgba(255,255,255,0.08)',     // nền khi có lỗi
        colorFocusError: 'rgba(255,255,255,0.12)',// nền khi có lỗi và focus
        borderColor: 'rgba(255,255,255,0.4)',
        borderColorHover: 'rgba(255,255,255,0.7)',
        borderColorFocus: '#ffffff',
        borderColorError: '#ff4d4f',               // đỏ lỗi
        borderColorFocusError: '#ff4d4f',          // đỏ lỗi khi focus
        boxShadowFocus: '0 0 0 2px rgba(255,255,255,0.2)',
        boxShadowFocusError: '0 0 0 2px rgba(255,0,0,0.3)' // bóng đỏ khi lỗi
    },
    Form: {
        color: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.24)',
        placeholderColor: 'rgba(255, 255, 255, 0.38)',
        hoverBorderColor: '#6b7280',
        focusBorderColor: '#2563eb',
        disabledColor: 'rgba(255, 255, 255, 0.06)',
        disabledBorderColor: 'rgba(255, 255, 255, 0.24)',
        disabledBgColor: 'rgba(255, 255, 255, 0.06)',
        labelTextColor: '#fff',
        colorStateful: '#fff'
    },

}

const themeDark                 =       {
    Input: {
        color: 'rgba(255, 255, 255, 0.1)',          // nền mặc định
        colorHover: 'rgba(255, 255, 255, 0.15)',    // khi hover
        colorFocus: 'rgba(255, 255, 255, 0.2)',     // khi focus
        colorDisabled: 'rgba(255, 255, 255, 0.06)', // khi disabled
        textColor: '#fff',
        placeholderColor: 'rgba(255, 255, 255, 0.38)',
        borderColor: 'rgba(255, 255, 255, 0.24)',
        borderHover: '#6b7280',
        borderFocus: '#2563eb'
    },
    FormItem: {
        color: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.24)',
        placeholderColor: 'rgba(255, 255, 255, 0.38)',
        hoverBorderColor: '#6b7280',
        focusBorderColor: '#2563eb',
        disabledColor: 'rgba(255, 255, 255, 0.06)',
        disabledBorderColor: 'rgba(255, 255, 255, 0.24)',
        disabledBgColor: 'rgba(255, 255, 255, 0.06)'
    },
}
</script>


<template>
    <NConfigProvider :theme-overrides="isDark ? themeDark : themeLight">
        <NSpace vertical justify="center" align="center" class="min-h-screen">
            <NSpace align="center" class="mb-4 absolute left-4 top-4">
                <NImage class="rounded-full overflow-hidden shadow-md" width="80" src="/logo-nobg.png" />
                <router-link to="/" class="text-4xl font-bold text-gray-300">RuryLib</router-link>
            </NSpace>

            <NSpace vertical class="bg-[url('/banner/book-bg2.png')] bg-cover p-8 rounded-md shadow-lg ring-2 ring-slate-100/50">
                <NSpace vertical>
                    <h1 class="text-2xl uppercase font-semibold text-slate-300">Đăng nhập vào tài khoản thành viên</h1>
                    <NGrid cols="2">
                        <NGi span="1">
                            <NSpace vertical align="center" justify="center">
                                <NForm class="rounded-md p-4 shadow-lg" ref="formRef" :model="formData" :rules="formRules">
                                    <NFormItem label="Điện thoại" path="phone">
                                        <NInput class="min-w-xs" type="text" v-model:value="formData.phone" placeholder="Nhập số điện thoại"/>
                                    </NFormItem>
                                    <NFormItem label="Mật khẩu" path="password">
                                        <NInput class="min-w-xs" type="password" v-model:value="formData.password" placeholder="Nhập mật khẩu" show-password-on="mousedown"/>
                                    </NFormItem>
                                    <NSpace vertical class="w-full">
                                        <NButton @click="submitForm" class="w-full" color="rgb(136, 8, 136)">Đăng nhập</NButton>
                                        <NSpace justify="end" align="center">
                                            <router-link to="/auth/forgot-password" class="text-sm text-slate-300 hover:text-white transition-colors">
                                                <i class="fa-solid fa-key mr-1"></i>Quên mật khẩu?
                                            </router-link>
                                        </NSpace>
                                    </NSpace>
                                </NForm>
                                <NIcon>
                                    <i class="fa-solid fa-forward-arrow"></i>
                                </NIcon>
                            </NSpace>
                        </NGi>
                        <NGi span="1">
                            <NSpace vertical align="center" justify="center" class="max-w-md shadow-lg">
                                <NCarousel autoplay>
                                    <NImage class="rounded-md" src="/banner/login-banner1.png" object-fit="cover"></NImage>
                                    <NImage class="rounded-md" src="/banner/login-banner2.png" object-fit="cover"></NImage>
                                    <NImage class="rounded-md" src="/banner/login-banner4.png" object-fit="cover"></NImage>
                                </NCarousel>
                            </NSpace>
                        </NGi>
                    </NGrid>
                </NSpace>
                <NDivider />
                <NSpace justify="end">
                    <NButton size="small" color="rgb(136, 8, 136)">
                        <template #icon>
                            <i class="fa-solid fa-house"></i>
                        </template>
                        <router-link to="/">Về trang chủ</router-link>
                    </NButton>
                    <NButton size="small" type="info">
                        <template #icon>
                            <i class="fa-solid fa-right-to-bracket"></i>
                        </template>
                        <router-link to="/auth/register">Đăng Ký</router-link>
                    </NButton>
                </NSpace>
            </NSpace>
        </NSpace>
    </NConfigProvider>
</template>


<style scoped>

</style>