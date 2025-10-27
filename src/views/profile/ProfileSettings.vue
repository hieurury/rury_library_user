<script setup>
import { ref, onMounted, reactive } from 'vue';
import {
    NLayout,
    NLayoutSider,
    NLayoutContent,
    NForm,
    NFormItem,
    NInput,
    NDatePicker,
    NRadioGroup,
    NRadio,
    NSwitch,
    NButton,
    NIcon,
    NSpace,
    NCard,
    NDivider,
    NUpload,
    NAvatar,
    useMessage
} from 'naive-ui';
import { useRouter } from 'vue-router';
import { getAccountData } from '../../hooks/useAccount';
import { getUserInfo } from '../../services/apiUser';
import ProfileSidebar from '../../components/ProfileSidebar.vue';

const API_BASE = import.meta.env.VITE_API_BASE;
const router = useRouter();
const message = useMessage();

const loading = ref(false);
const userInfo = ref(null);
const formRef = ref(null);

// Form data
const formValue = reactive({
    HOLOT: '',
    TEN: '',
    DIENTHOAI: '',
    EMAIL: '',
    DIACHI: '',
    NGAYSINH: null,
    PHAI: true,
    AVATAR: '',
    EMAIL_NOTIF: true
});

// Form rules
const rules = {
    HOLOT: [
        { required: true, message: 'Vui lòng nhập họ lót', trigger: 'blur' }
    ],
    TEN: [
        { required: true, message: 'Vui lòng nhập tên', trigger: 'blur' }
    ],
    EMAIL: [
        { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
        { type: 'email', message: 'Email không hợp lệ', trigger: 'blur' }
    ],
    DIENTHOAI: [
        { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' },
        { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số', trigger: 'blur' }
    ]
};

onMounted(async () => {
    const userData = getAccountData();
    if (!userData) {
        router.push('/auth/login');
        return;
    }

    try {
        const rs = await getUserInfo(userData.MADOCGIA);
        userInfo.value = rs.data;

        // Populate form with user data
        formValue.HOLOT = userInfo.value.HOLOT || '';
        formValue.TEN = userInfo.value.TEN || '';
        formValue.DIENTHOAI = userInfo.value.DIENTHOAI || '';
        formValue.EMAIL = userInfo.value.EMAIL || '';
        formValue.DIACHI = userInfo.value.DIACHI || '';
        formValue.PHAI = userInfo.value.PHAI !== undefined ? userInfo.value.PHAI : true;
        formValue.AVATAR = userInfo.value.AVATAR || '/users/default-avatar.svg';
        formValue.EMAIL_NOTIF = userInfo.value.OPTIONS?.EMAIL_NOTIF !== undefined 
            ? userInfo.value.OPTIONS.EMAIL_NOTIF 
            : true;

        // Convert date
        if (userInfo.value.NGAYSINH) {
            formValue.NGAYSINH = new Date(userInfo.value.NGAYSINH).getTime();
        }
    } catch (error) {
        message.error('Không thể tải thông tin người dùng');
    }
});

const handleUpdateProfile = async () => {
    try {
        await formRef.value?.validate();
        loading.value = true;

        // TODO: Gọi API updateUser khi backend đã implement
        // const updateData = {
        //     HOLOT: formValue.HOLOT,
        //     TEN: formValue.TEN,
        //     DIENTHOAI: formValue.DIENTHOAI,
        //     EMAIL: formValue.EMAIL,
        //     DIACHI: formValue.DIACHI,
        //     NGAYSINH: new Date(formValue.NGAYSINH),
        //     PHAI: formValue.PHAI,
        //     AVATAR: formValue.AVATAR,
        //     OPTIONS: {
        //         EMAIL_NOTIF: formValue.EMAIL_NOTIF
        //     }
        // };
        // await updateUser(userInfo.value.MADOCGIA, updateData);

        message.success('Cập nhật thông tin thành công!');
    } catch (error) {
        if (error?.errors) {
            message.error('Vui lòng kiểm tra lại thông tin');
        } else {
            message.error('Không thể cập nhật thông tin');
        }
    } finally {
        loading.value = false;
    }
};

const handleAvatarUpload = ({ file }) => {
    // TODO: Implement avatar upload
    // Tạm thời chỉ preview
    const reader = new FileReader();
    reader.onload = (e) => {
        formValue.AVATAR = e.target.result;
        message.info('Tính năng upload ảnh sẽ được cập nhật sau');
    };
    reader.readAsDataURL(file.file);
    return false; // Prevent default upload
};
</script>

<template>
    <NLayout>
        <NLayoutContent class="min-h-screen p-4">
            <div class="mb-6">
                <h1 class="text-3xl font-bold mb-2">Cài Đặt Tài Khoản</h1>
                <p class="text-gray-500 dark:text-gray-400">
                    Quản lý thông tin cá nhân và tùy chọn
                </p>
            </div>

            <NCard :bordered="true" class="max-w-3xl">
                <NForm
                    ref="formRef"
                    :model="formValue"
                    :rules="rules"
                    label-placement="left"
                    label-width="140"
                    require-mark-placement="right-hanging"
                >
                    <!-- Avatar Section -->
                    <NFormItem label="Ảnh đại diện" path="AVATAR">
                        <NSpace align="center" :size="16">
                            <NAvatar
                                round
                                :size="80"
                                :src="formValue.AVATAR"
                            />
                            <NUpload
                                :custom-request="handleAvatarUpload"
                                :show-file-list="false"
                                accept="image/*"
                            >
                                <NButton size="small">
                                    <template #icon>
                                        <NIcon><i class="fa-solid fa-camera"></i></NIcon>
                                    </template>
                                    Đổi ảnh
                                </NButton>
                            </NUpload>
                        </NSpace>
                    </NFormItem>

                    <NDivider />

                    <!-- Personal Info -->
                    <h3 class="text-lg font-semibold mb-4">Thông tin cá nhân</h3>

                    <NFormItem label="Họ lót" path="HOLOT">
                        <NInput
                            v-model:value="formValue.HOLOT"
                            placeholder="Nhập họ lót"
                        />
                    </NFormItem>

                    <NFormItem label="Tên" path="TEN">
                        <NInput
                            v-model:value="formValue.TEN"
                            placeholder="Nhập tên"
                        />
                    </NFormItem>

                    <NFormItem label="Giới tính" path="PHAI">
                        <NRadioGroup v-model:value="formValue.PHAI">
                            <NRadio :value="true">Nam</NRadio>
                            <NRadio :value="false">Nữ</NRadio>
                        </NRadioGroup>
                    </NFormItem>

                    <NFormItem label="Ngày sinh" path="NGAYSINH">
                        <NDatePicker
                            v-model:value="formValue.NGAYSINH"
                            type="date"
                            placeholder="Chọn ngày sinh"
                            class="w-full"
                        />
                    </NFormItem>

                    <NDivider />

                    <!-- Contact Info -->
                    <h3 class="text-lg font-semibold mb-4">Thông tin liên hệ</h3>

                    <NFormItem label="Số điện thoại" path="DIENTHOAI">
                        <NInput
                            v-model:value="formValue.DIENTHOAI"
                            placeholder="Nhập số điện thoại"
                        />
                    </NFormItem>

                    <NFormItem label="Email" path="EMAIL">
                        <NInput
                            v-model:value="formValue.EMAIL"
                            placeholder="Nhập email"
                            type="email"
                        />
                    </NFormItem>

                    <NFormItem label="Địa chỉ" path="DIACHI">
                        <NInput
                            v-model:value="formValue.DIACHI"
                            type="textarea"
                            placeholder="Nhập địa chỉ"
                            :rows="3"
                        />
                    </NFormItem>

                    <NDivider />

                    <!-- Preferences -->
                    <h3 class="text-lg font-semibold mb-4">Tùy chọn</h3>

                    <NFormItem label="Nhận thông báo email">
                        <NSpace align="center">
                            <NSwitch v-model:value="formValue.EMAIL_NOTIF" />
                            <span class="text-sm text-gray-500 dark:text-gray-400">
                                {{ formValue.EMAIL_NOTIF ? 'Đang bật' : 'Đang tắt' }}
                            </span>
                        </NSpace>
                    </NFormItem>

                    <NDivider />

                    <!-- Actions -->
                    <NSpace justify="end" :size="12">
                        <NButton @click="router.push('/user/profile/overview')">
                            Hủy
                        </NButton>
                        <NButton
                            type="primary"
                            :loading="loading"
                            @click="handleUpdateProfile"
                        >
                            <template #icon>
                                <NIcon><i class="fa-solid fa-floppy-disk"></i></NIcon>
                            </template>
                            Lưu thay đổi
                        </NButton>
                    </NSpace>
                </NForm>
            </NCard>
        </NLayoutContent>
    </NLayout>
</template>
