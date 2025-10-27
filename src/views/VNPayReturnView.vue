<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    NResult,
    NButton,
    NIcon,
    NSpace,
    NCard,
    NDescriptions,
    NDescriptionsItem,
    NTag,
    NSpin
} from 'naive-ui';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const status = ref(''); // 'success', 'failed', 'error'
const message = ref('');
const billId = ref('');

onMounted(() => {
    // Lấy params từ URL
    status.value = route.query.status || 'error';
    message.value = decodeURIComponent(route.query.message || '');
    billId.value = route.query.billId || '';
    
    loading.value = false;
});

const handleGoToHistory = () => {
    router.push('/user/profile/history');
};

const handleGoHome = () => {
    router.push('/');
};
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div class="max-w-2xl w-full">
            <div v-if="loading" class="flex justify-center">
                <NSpin size="large" />
            </div>

            <NCard v-else :bordered="false" class="shadow-lg">
                <!-- Success -->
                <NResult
                    v-if="status === 'success'"
                    status="success"
                    title="Thanh toán thành công!"
                    description="Giao dịch của bạn đã được xử lý thành công"
                >
                    <template #footer>
                        <NSpace vertical :size="16">
                            <NDescriptions label-placement="left" :column="1" bordered>
                                <NDescriptionsItem label="Mã bill">
                                    <NTag type="info">{{ billId }}</NTag>
                                </NDescriptionsItem>
                                <NDescriptionsItem label="Trạng thái">
                                    <NTag type="success">Đã thanh toán</NTag>
                                </NDescriptionsItem>
                            </NDescriptions>

                            <NSpace justify="center" :size="12">
                                <NButton type="primary" size="large" @click="handleGoToHistory">
                                    <template #icon>
                                        <NIcon><i class="fa-solid fa-clock-rotate-left"></i></NIcon>
                                    </template>
                                    Xem lịch sử mượn
                                </NButton>
                                <NButton size="large" @click="handleGoHome">
                                    <template #icon>
                                        <NIcon><i class="fa-solid fa-home"></i></NIcon>
                                    </template>
                                    Về trang chủ
                                </NButton>
                            </NSpace>

                            <div class="text-center text-sm text-gray-600 dark:text-gray-400">
                                Vui lòng đến quầy thủ thư để nhận sách
                            </div>
                        </NSpace>
                    </template>
                </NResult>

                <!-- Failed -->
                <NResult
                    v-else-if="status === 'failed'"
                    status="error"
                    title="Thanh toán thất bại"
                    :description="message || 'Giao dịch không thành công. Bill đã bị hủy.'"
                >
                    <template #footer>
                        <NSpace vertical :size="16">
                            <div class="text-center text-gray-600 dark:text-gray-400">
                                <p class="mb-2">Thanh toán không thành công, giao dịch đã bị hủy.</p>
                                <p class="text-sm">Các sách trong balo vẫn được giữ nguyên, bạn có thể thử lại.</p>
                            </div>

                            <NSpace justify="center" :size="12">
                                <NButton type="primary" size="large" @click="router.push('/borrow/confirm')">
                                    <template #icon>
                                        <NIcon><i class="fa-solid fa-rotate-right"></i></NIcon>
                                    </template>
                                    Thử lại thanh toán
                                </NButton>
                                <NButton size="large" @click="handleGoHome">
                                    <template #icon>
                                        <NIcon><i class="fa-solid fa-home"></i></NIcon>
                                    </template>
                                    Về trang chủ
                                </NButton>
                            </NSpace>
                        </NSpace>
                    </template>
                </NResult>

                <!-- Error -->
                <NResult
                    v-else
                    status="500"
                    title="Lỗi hệ thống"
                    description="Đã có lỗi xảy ra trong quá trình xử lý thanh toán"
                >
                    <template #footer>
                        <NSpace justify="center">
                            <NButton type="primary" @click="handleGoHome">
                                <template #icon>
                                    <NIcon><i class="fa-solid fa-home"></i></NIcon>
                                </template>
                                Về trang chủ
                            </NButton>
                        </NSpace>
                    </template>
                </NResult>
            </NCard>
        </div>
    </div>
</template>
