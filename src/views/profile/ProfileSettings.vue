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
import { getAccountData, setAccountData } from '../../hooks/useAccount';
import { getUserInfo, updateEmailNotification, updateUser, uploadAvatar } from '../../services/apiUser';
import ProfileSidebar from '../../components/ProfileSidebar.vue';

const API_BASE = import.meta.env.VITE_API_BASE;
const router = useRouter();
const message = useMessage();

const loading = ref(false);
const uploadingAvatar = ref(false);
const userInfo = ref(null);
const formRef = ref(null);
const avatarFile = ref(null);
const previewUrl = ref(''); // Thêm biến preview

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
        
        // Set initial preview URL
        previewUrl.value = formValue.AVATAR;
        
        console.log(formValue);
    } catch (error) {
        message.error('Không thể tải thông tin người dùng');
    }
});

const handleUpdateProfile = async () => {
    try {
        await formRef.value?.validate();
        loading.value = true;

        // Upload avatar trước nếu có
        if (avatarFile.value) {
            try {
                uploadingAvatar.value = true;
                const avatarResponse = await uploadAvatar(userInfo.value.MADOCGIA, avatarFile.value);
                if (avatarResponse.status === 'success') {
                    formValue.AVATAR = avatarResponse.data.avatarPath;
                }
            } catch (error) {
                message.error('Không thể upload ảnh đại diện');
                throw error;
            } finally {
                uploadingAvatar.value = false;
            }
        }

        // Cập nhật thông tin user
        const updateData = {
            HOLOT: formValue.HOLOT,
            TEN: formValue.TEN,
            DIENTHOAI: formValue.DIENTHOAI,
            EMAIL: formValue.EMAIL,
            DIACHI: formValue.DIACHI,
            NGAYSINH: new Date(formValue.NGAYSINH),
            PHAI: formValue.PHAI,
            AVATAR: formValue.AVATAR
        };
        
        const response = await updateUser(userInfo.value.MADOCGIA, updateData);
        
        if (response.status === 'success') {
            message.success('Cập nhật thông tin thành công!');
            
            // Cập nhật lại account data trong localStorage
            const currentAccount = getAccountData();
            if (currentAccount) {
                currentAccount.TEN = formValue.TEN;
                currentAccount.HOLOT = formValue.HOLOT;
                setAccountData(currentAccount);
            }
            
            // Reload user info
            const rs = await getUserInfo(userInfo.value.MADOCGIA);
            userInfo.value = rs.data;
            avatarFile.value = null; // Reset file
        } else {
            message.error('❌ ' + (response.message || 'Không thể cập nhật thông tin'));
        }
    } catch (error) {
        if (error?.errors) {
            message.error('❌ Vui lòng kiểm tra lại thông tin');
        } else {
            const errorMsg = error.response?.data?.message || 'Không thể cập nhật thông tin';
            message.error('❌ ' + errorMsg);
        }
    } finally {
        loading.value = false;
    }
};

const handleEmailNotificationChange = async (value) => {
    try {
        const response = await updateEmailNotification(value);
        message.success(response.message || 'Cập nhật cài đặt thành công');
        formValue.EMAIL_NOTIF = value;
    } catch (error) {
        message.error(error.response?.data?.message || 'Không thể cập nhật cài đặt');
        // Revert về giá trị cũ nếu failed
        formValue.EMAIL_NOTIF = !value;
    }
};

const handleAvatarUpload = ({ file }) => {
    // Kiểm tra file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.file.type)) {
        message.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)');
        return false;
    }
    
    // Kiểm tra file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.file.size > maxSize) {
        message.error('Kích thước ảnh không được vượt quá 5MB');
        return false;
    }
    
    // Lưu file để upload sau
    avatarFile.value = file.file;
    
    // Tạo preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
        previewUrl.value = e.target.result;
    };
    reader.readAsDataURL(file.file);
    
    return false; // Prevent default upload
};

// Reset avatar về ảnh gốc
const resetAvatar = () => {
    avatarFile.value = null;
    previewUrl.value = formValue.AVATAR;
    message.info('Đã hủy chọn ảnh mới');
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
                            <div class="relative">
                                <img class="w-20 h-20 overflow-hidden rounded-full object-cover" :src="`${API_BASE}${userInfo?.AVATAR}`" alt="">
                                <div 
                                    v-if="avatarFile" 
                                    class="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
                                >
                                    <NIcon><i class="fa-solid fa-check"></i></NIcon>
                                </div>
                            </div>
                            <NSpace vertical :size="8">
                                <NUpload
                                    :custom-request="handleAvatarUpload"
                                    :show-file-list="false"
                                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                >
                                    <NButton size="small" type="primary">
                                        <template #icon>
                                            <NIcon><i class="fa-solid fa-camera"></i></NIcon>
                                        </template>
                                        Chọn ảnh mới
                                    </NButton>
                                </NUpload>
                                <NButton 
                                    v-if="avatarFile"
                                    size="small" 
                                    @click="resetAvatar"
                                    secondary
                                >
                                    <template #icon>
                                        <NIcon><i class="fa-solid fa-rotate-left"></i></NIcon>
                                    </template>
                                    Hủy
                                </NButton>
                                <div class="text-xs text-gray-400">
                                    JPG, PNG, GIF, WEBP. Tối đa 5MB
                                </div>
                            </NSpace>
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

                    <NFormItem label="Email">
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
                            <NSwitch 
                                v-model:value="formValue.EMAIL_NOTIF"
                                @update:value="handleEmailNotificationChange"
                            />
                            <span class="text-sm text-gray-500 dark:text-gray-400">
                                {{ formValue.EMAIL_NOTIF ? 'Đang bật' : 'Đang tắt' }}
                            </span>
                        </NSpace>
                        <div class="text-xs text-gray-400 mt-2">
                            Nhận email thông báo về mượn sách, gần đến hạn trả, và các cập nhật quan trọng
                        </div>
                    </NFormItem>

                    <NDivider />

                    <!-- Actions -->
                    <NSpace justify="end" :size="12">
                        <NButton @click="router.push('/user/profile/overview')">
                            <template #icon>
                                <NIcon><i class="fa-solid fa-xmark"></i></NIcon>
                            </template>
                            Hủy
                        </NButton>
                        <NButton
                            type="primary"
                            :loading="loading || uploadingAvatar"
                            :disabled="loading || uploadingAvatar"
                            @click="handleUpdateProfile"
                            strong
                        >
                            <template #icon>
                                <NIcon><i class="fa-solid fa-floppy-disk"></i></NIcon>
                            </template>
                            {{ uploadingAvatar ? 'Đang upload ảnh...' : loading ? 'Đang lưu...' : 'Lưu thay đổi' }}
                        </NButton>
                    </NSpace>
                </NForm>
            </NCard>
        </NLayoutContent>
    </NLayout>
</template>
