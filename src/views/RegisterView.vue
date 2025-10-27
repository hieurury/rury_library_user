<script setup>
import {
    NButton,
    NForm,
    NFormItem,
    NSpace,
    NInput,
    NConfigProvider,
    NGrid,
    NGi,
    NThing,
    NRadioGroup,
    NRadioButton,
    NDivider,
    NTag,
    NSteps,
    NStep,
    NIcon,
    useMessage,
    NImage,
    NDatePicker,
    NRadio,
    createTheme
}                       from    'naive-ui'
import { 
    isDark 
}                       from    '../hooks/useDark';
import BookMarkControll from '../components/BookMarkControll.vue';
import { 
    ref,
    computed,
    onMounted,
    watch
}                       from    'vue';
import {
    getAllPackages
}                       from    '../services/apiPackage.js';
import {
    registerAccount
}                       from    '../services/apiUser.js';

const message = useMessage();

onMounted(async () => {
    allPackages.value           =   await getAllPackages();
    currentListPackages.value   =   allPackages.value.data?.sort((a, b) => a.Gia - b.Gia);
    selectedPackage.value       =   currentListPackages.value[0]?.MaGoi || '';
});

//==========> Liên quan đến gói thành viên
const allPackages           =   ref([]);
const currentListPackages   =   ref([]);
const selectedPackage       =   ref('');
const dataPackage           =   computed(() => {
    return currentListPackages.value?.find(pack => pack.MaGoi === selectedPackage.value);
})

//<========== Liên quan đến gói thành viên




const themeLight = {
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
    Radio: {
        textColor: '#fff',            // nền mặc định
        buttonColorActive: 'purple',          // nền tím khi chọn
        buttonBorderColorActive: '#fff',     // viền trắng khi chọn
        buttonTextColor: '#fff',            // chữ trắng mặc định
        buttonTextColorActive: '#fff',     // chữ trắng khi chọn
        buttonTextColorHover: '#fff',     // chữ trắng khi hover
        buttonColorHover: '#fff',        // nền khi hover
        buttonBoxShadowFocus: 'none',   // bỏ viền xanh khi focus
        labelTextColor: '#fff',
    },
    // Radio: {
    //   textColor: '#ffffff',            // màu chữ Radio thường
    //   textColorDisabled: 'rgba(255,255,255,0.4)',
    //   labelTextColor: '#ffffff'        // (nếu bạn muốn chắc chắn text luôn trắng)
    // },
    RadioButton: {
      textColor: '#6b21a8',            // màu chữ tím cho RadioButton (bình thường)
      textColorHover: '#9333ea',       // tím nhạt khi hover
      textColorFocus: '#a855f7',       // tím sáng khi focus
      textColorPressed: '#7e22ce',     // tím đậm khi nhấn
      textColorDisabled: 'rgba(255,255,255,0.4)',
      borderColor: '#a855f7',
      borderColorHover: '#c084fc',
      colorActive: '#7e22ce',          // nền của RadioButton khi chọn
      colorActiveHover: '#9333ea',     
      textColorActive: '#ffffff',      // chữ trắng khi được chọn
    }

}

const themeDark = {
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
    Radio: {
        buttonColor: 'transparent',            // nền mặc định
        buttonColorActive: 'purple',          // nền tím khi chọn
        buttonBorderColorActive: '#fff',     // viền trắng khi chọn
        buttonTextColor: '#fff',            // chữ trắng mặc định
        buttonTextColorActive: '#fff',     // chữ trắng khi chọn
        buttonTextColorHover: '#fff',     // chữ trắng khi hover
        buttonColorHover: '#fff',        // nền khi hover
        buttonBoxShadowFocus: 'none',   // bỏ viền xanh khi focus
    },
}

//==========> Liên quan đến Steps

const currentRef = ref(1);
const currentStatus = computed(() => {
    switch (currentRef.value) {
        case 1:
            return 'process';
        case 2:
            return 'process';
        case 3:
            return 'finish';
    }
});
const current = computed(() => currentRef.value);

function nextStep() {
    if (currentRef.value < 3) {
        currentRef.value++;
    }
}

const setCurrentStep = (to) => {
    if(current.value > to) {
        currentRef.value = parseInt(to);
    }
    else {
        message.warning('Vui lòng hoàn thành bước hiện tại trước khi chuyển sang bước tiếp theo!');
    }
}

//<========== Liên quan đến Steps

//==========>  Liên quan đến đăng ký
const form1Ref           =   ref(null);
const form2Ref           =   ref(null);
const account            =   ref(null);
const form1Data          =   ref({
    firstName: '',
    lastName: '',
    birthday: Date.now(),
    gender: true,
    address: '',
    phone: '',
})

const form2Data          =   ref({
    email: '',
    password: '',
    confirmPassword: ''
})

const checkPhoneNumber = () => {
    if(!form1Data.value.phone) {
        return new Error('Vui lòng nhập số điện thoại');
    }
    //sdt 9 - 10 số
    const phoneRegex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-4|6-9])[0-9]{7}$/;
    if(!phoneRegex.test(form1Data.value.phone)) {
        return new Error('Số điện thoại không hợp lệ');
    }
}

const form1Rules     =   {
    lastName: [
        { required: true, message: 'Vui lòng nhập tên', trigger: ['blur'] }
    ],
    birthday: [
        { validator: () => {
            if(!form1Data.value.birthday) {
                return new Error('Vui lòng chọn ngày sinh');
            }
            return true;
        }, trigger: ['blur'] }
    ],
    address: [
        { required: true, message: 'Vui lòng nhập địa chỉ', trigger: ['blur'] }
    ],
    phone: [
        { 
            validator: checkPhoneNumber, 
            trigger: ['blur', 'change'] 
        }
    ],
}

const form2Rules     =   {
    email: [
        { required: true, message: 'Vui lòng nhập email', trigger: ['blur'] },
        { type: 'email', message: 'Email không hợp lệ', trigger: ['blur', 'change'] }
    ],
    password: [
        { required: true, message: 'Vui lòng nhập mật khẩu', trigger: ['blur'] },
        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự', trigger: ['blur', 'change'] }
    ],
    confirmPassword: [
        { required: true, message: 'Vui lòng xác nhận mật khẩu', trigger: ['blur'] },
        { 
            validator: (rule, value) => {
                if (value !== form2Data.value.password) {
                    return new Error('Mật khẩu xác nhận không khớp');
                }
            }, 
            trigger: ['blur', 'change'] 
        }
    ]
}


const checkForm1 = () => {
    form1Ref.value.validate((error) => {
        if (!error) {
            nextStep();
            return true;
        } else {
            return false;
        }
    });
}

const checkForm2 = () => {
    form2Ref.value.validate(async (error) => {
        if (!error) {
            const requestData = {
                HOLOT: form1Data.value.firstName,
                TEN: form1Data.value.lastName,
                NGAYSINH: form1Data.value.birthday,
                PHAI: form1Data.value.gender,
                DIACHI: form1Data.value.address,
                DIENTHOAI: form1Data.value.phone,
                EMAIL: form2Data.value.email,
                PASSWORD: form2Data.value.password,
                GOI: selectedPackage.value
            }
            
            const response = await registerAccount(requestData);
            message[response.status](response.message);
            if (response.status === "success") {
                account.value = {...requestData, Goi: dataPackage }
                nextStep();
            }
        } else {
            return false;
        }
    });
}

//<==========  Liên quan đến đăng ký
</script>


<template>
    <NConfigProvider :theme-overrides="isDark ? themeDark : themeLight">
        <NSpace vertical justify="center" align="center" class="min-h-screen">
            <NSpace align="center" class="mb-4 absolute left-4 top-4">
                <NImage class="rounded-full overflow-hidden shadow-md" width="80" src="/logo-nobg.png" />
                <h1 class="text-4xl font-bold text-gray-300">RuryLib</h1>
            </NSpace>
            
            <NSpace vertical class="bg-[url('/banner/book-bg2.png')] bg-cover p-8 rounded-md shadow-lg ring-2 ring-slate-100/50">
                <NSteps :current="current" :status="currentStatus" class="my-2">
                    <NStep @click="setCurrentStep(1)" title="Nhập thông tin"/>
                    <NStep @click="setCurrentStep(2)" title="Đăng kí tài khoản"/>
                    <NStep @click="setCurrentStep(3)" title="Hoàn tất"/>
                </NSteps>
                <!-- Bước 1 -->
                <NSpace vertical v-show="current === 1">
                    <h1 class="text-2xl uppercase font-semibold text-slate-300">Điền thông tin cá nhân</h1>
                    <NForm class="rounded-md p-4 shadow-lg" ref="form1Ref" :model="form1Data" :rules="form1Rules">
                        <NGrid cols="2" x-gap="12" y-gap="12">
                            <NGi span="1">
                                <NFormItem label="Họ">
                                    <NInput v-model:value="form1Data.firstName" class="min-w-xs" type="text" placeholder="Nhập họ của bạn"/>
                                </NFormItem>
                            </NGi>
                            <NGi span="1">
                                <NFormItem label="Tên" path="lastName">
                                    <NInput v-model:value="form1Data.lastName" class="min-w-xs" type="text" placeholder="Nhập tên của bạn" />
                                </NFormItem>
                            </NGi>
                            <NGi span="1">
                                <NFormItem label="Ngày sinh" path="birthday">
                                    <NDatePicker v-model:value="form1Data.birthday" type="date" class="w-full"></NDatePicker>
                                </NFormItem> 
                            </NGi>
                            <NGi span="1">
                                <NFormItem label="Giới tính">
                                    <NRadioGroup v-model:value="form1Data.gender">
                                        <NRadio :value="true">Nam</NRadio>
                                        <NRadio :value="false">Nữ</NRadio>
                                    </NRadioGroup>
                                </NFormItem>
                            </NGi>
                            <NGi span="1">
                                <NFormItem label="Địa chỉ" path="address">
                                    <NInput class="min-w-xs" v-model:value="form1Data.address" type="text" placeholder="Nhập địa chỉ" />
                                </NFormItem>
                            </NGi>
                            <NGi span="1">
                                <NFormItem label="Số điện thoại" path="phone">
                                    <NInput class="min-w-xs" v-model:value="form1Data.phone" type="text" placeholder="Nhập số điện thoại" />
                                </NFormItem>
                            </NGi>
                            <NGi span="1">
                                <NButton @click="checkForm1" class="min-w-xs" color="rgb(136, 8, 136)">Tiếp theo</NButton>
                            </NGi>
                        </NGrid>
                    </NForm>
                </NSpace>
                <!-- Bước 2 -->
                 <NSpace vertical v-show="current === 2">
                    <h1 class="text-2xl uppercase font-semibold text-slate-300">Đăng ký tài khoản thành viên</h1>
                    <NGrid cols="2">
                        <NGi span="1">
                            <NSpace vertical align="center" justify="center">
                                <NForm class="rounded-md p-4 shadow-lg" ref="form2Ref" :model="form2Data" :rules="form2Rules">
                                    <NFormItem label="Email" path="email">
                                        <NInput class="min-w-xs" type="email" v-model:value="form2Data.email" />
                                    </NFormItem>
                                    <NFormItem label="Password" path="password">
                                        <NInput class="min-w-xs" type="password" v-model:value="form2Data.password" />
                                    </NFormItem>
                                    <NFormItem label="Confirm Password" path="confirmPassword">
                                        <NInput class="min-w-xs" type="password" v-model:value="form2Data.confirmPassword" />
                                    </NFormItem>
                                    <NButton @click="checkForm2" class="min-w-xs" color="rgb(136, 8, 136)">Đăng ký</NButton>
                                </NForm>
                                <NIcon>
                                    <i class="fa-solid fa-forward-arrow"></i>
                                </NIcon>
                            </NSpace>
                        </NGi>
                        <NGi span="1">
                            <NSpace vertical align="center" justify="center" class="max-w-md">
                                <NThing class="relative ring-2 p-2 rounded-md ring-slate-100/50 shadow-lg">
                                    <template #description>
                                        <h1 class="text-lg uppercase font-semibold text-slate-300">{{ dataPackage?.TenGoi }}</h1>
                                        <NDivider />
                                        <ul class="list-disc list-inside text-gray-300">
                                            <li v-for="value in dataPackage?.QuyenLoi">{{ value }}</li>
                                        </ul>
                                        <NDivider />
                                        <NTag type="warning">{{ dataPackage?.Gia === 0 ? 'Free' : `${dataPackage?.Gia} VNĐ / Tháng` }}</NTag>
                                        <BookMarkControll :img="dataPackage?.HuyHieu" :children="{width: '40px'}" :position="{top: '0px', right: '0px'}" />
                                    </template>
                                </NThing>
                                <h1 class="text-xl uppercase font-semibold text-slate-300">Chọn gói thành viên</h1>
                                <NRadioGroup v-model:value="selectedPackage">
                                    <NRadioButton 
                                    v-for="pack in currentListPackages" 
                                    :key="pack.value" 
                                    :value="pack.MaGoi">{{ pack.TenGoi }}</NRadioButton>
                                </NRadioGroup>
                            </NSpace>
                        </NGi>
                    </NGrid>
                </NSpace>
                <!-- Bước 3 -->
                <NSpace vertical v-if="current === 3" align="center" justify="center">
                    <NSpace vertical align="center" justify="center" class="min-w-2xl">
                        <NSpace align="center" class="my-4">
                            <NIcon size="40">
                                <i class="fa-regular fa-circle-check text-green-500"></i>
                            </NIcon>
                            <h1 class="text-2xl font-semibold text-white dark:text-gray-300">Đăng ký thành công!</h1>
                        </NSpace>
                        <NThing class="relative ring-2 p-2 rounded-md ring-slate-100/50 shadow-lg min-w-md">
                            <template #description>
                                <NGrid cols="3">
                                    <NGi span="1">
                                        <NSpace justify="center" align="center" class="h-full">
                                            <NImage class="rounded-full overflow-hidden shadow-md" width="120" round src="/logo.png" />
                                        </NSpace>
                                    </NGi>
                                    <NGi span="2">
                                        <h3 class="text-lg text-white dark:text-gray-300 uppercase font-semibold">{{ `${account.HOLOT} ${account.TEN}` }}</h3>
                                        <NSpace >
                                            <p class="dark:text-gray-300 text-white">NS: {{ new Date(account.NGAYSINH).toLocaleDateString() }}</p>
                                            <p class="dark:text-gray-300 text-white">Giới tính: {{ account.PHAI ? 'Nam' : 'Nữ' }}</p>
                                        </NSpace>
                                        <NDivider />
                                        <p class="dark:text-gray-300 text-gray-200 mb-4">
                                            Bạn đã đăng kí tài khoản thành công! <br>
                                            Để sử dụng quyền hạn hãy tiến hành đăng nhập bằng nút bên dưới <br>
                                            Thẻ thành viên bản cứng sẽ được cấp khi bạn đến thư viện <br>
                                         </p>
                                        <NTag type="warning">{{ account.Goi.TenGoi }}</NTag>
                                        <BookMarkControll :img="account.Goi.HuyHieu" :children="{width: '40px'}" :position="{top: '0px', right: '0px'}" />
                                    </NGi>
                                </NGrid>
                            </template>
                        </NThing>
                    </NSpace>
                    <NDivider />
                    <NButton @click="setCurrentStep(1)" class="min-w-xs custom-register-btn">Đăng nhập ngay</NButton>
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
                        <router-link to="/auth/login">Đăng nhập</router-link>
                    </NButton>
                </NSpace>
            </NSpace>
        </NSpace>
    </NConfigProvider>
</template>


<style scoped>
.custom-register-btn {
    background: rgb(194, 9, 194);
    color: white;
}
.custom-register-btn:hover {
    background: rgb(136, 8, 136);
    color: white;
}
</style>