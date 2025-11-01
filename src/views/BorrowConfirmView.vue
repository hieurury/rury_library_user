<script setup>
import { ref, computed, onMounted } from 'vue';
import {
    NSpace,
    NCard,
    NImage,
    NButton,
    NIcon,
    NTag,
    NText,
    NDivider,
    NDescriptions,
    NDescriptionsItem,
    NSpin,
    NRadioGroup,
    NRadioButton,
    NModal,
    useMessage
} from 'naive-ui';
import { useRouter } from 'vue-router';
import { getSelectedBagItems, clearBag, clearSelectedBagItems } from '../hooks/useBag';
import { getAccountData } from '../hooks/useAccount';
import { getBookById } from '../services/apiBook';
import { checkBill, createBill } from '../services/apiBill';
import { getUserInfo, getBorrowingCount } from '../services/apiUser';
import { clearBookIds, getBookIds, setBookIds } from '../hooks/usePayment'

const API_BASE = import.meta.env.VITE_API_BASE;
const router = useRouter();
const message = useMessage();

// State
const loading = ref(false);
const submitting = ref(false);
const booksDetail = ref([]); // Chỉ chứa sách được chọn từ BagDrawer
const userInfo = ref(null);
const currentBorrowingCount = ref(0);
const paymentMethod = ref('online'); // 'online' (VNPAY) hoặc 'cash' (Tiền mặt)
const billData = ref(null);
const showSuccessModal = ref(false);

// Computed
const userData = computed(() => getAccountData());

const maxBooksAllowed = computed(() => {
    return userInfo.value?.GOI?.SoSachToiDa || 0;
});

const remainingSlots = computed(() => {
    return Math.max(0, maxBooksAllowed.value - currentBorrowingCount.value);
});

const canProceed = computed(() => {
    return booksDetail.value.length > 0 && booksDetail.value.length <= remainingSlots.value;
});

const totalAmount = computed(() => {
    return booksDetail.value.reduce((sum, book) => sum + (book.DONGIA || 0), 0);
});

const borrowDuration = computed(() => {
    return userInfo.value?.GOI?.ThoiHanMuon || 0;
});

const returnDate = computed(() => {
    if (!borrowDuration.value) return '';
    const date = new Date();
    date.setDate(date.getDate() + borrowDuration.value);
    return date.toLocaleDateString('vi-VN');
});

// Lifecycle
onMounted(async () => {
    if (!userData.value) {
        message.error('Vui lòng đăng nhập');
        router.push('/auth/login');
        return;
    }
    
    // Lấy các sách đã được chọn từ BagDrawer
    const selectedItems = getBookIds();
    if (selectedItems.length === 0) {
        message.warning('Chưa có sách nào được chọn');
        router.push('/');
        return;
    }
    
    await loadData(selectedItems);
});

// Methods
const loadData = async (selectedItems) => {
    loading.value = true;
    try {
        // Load user info và borrowing count
        const [userRes, borrowingRes] = await Promise.all([
            getUserInfo(userData.value.MADOCGIA),
            getBorrowingCount(userData.value.MADOCGIA)
        ]);
        
        userInfo.value = userRes.data;
        currentBorrowingCount.value = borrowingRes.data?.count || 0;
        
        // Load books detail cho các sách đã chọn
        const bookPromises = selectedItems.map(async (item) => {
            try {
                const res = await getBookById(item.split('T')[0]);
                return {
                    ...res.data,
                    copyId: item,
                };
            } catch (error) {
                console.error(`Error loading book ${item.bookId}:`, error);
                return null;
            }
        });
        
        const books = await Promise.all(bookPromises);
        booksDetail.value = books.filter(book => book !== null);
        
        // Kiểm tra giới hạn
        if (booksDetail.value.length > remainingSlots.value) {
            message.error(`Bạn chỉ còn có thể mượn thêm ${remainingSlots.value} cuốn sách`);
        }
    } catch (error) {
        message.error('Không thể tải thông tin');
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const handleVNPSubmit = async () => {
    if (booksDetail.value.length === 0) {
        message.warning('Không có sách để mượn');
        return;
    }
    
    if (!canProceed.value) {
        message.error(`Bạn chỉ còn có thể mượn thêm ${remainingSlots.value} cuốn sách`);
        return;
    }
    
    submitting.value = true;
    try {
        // Lấy danh sách MA_BANSAO từ tất cả sách hiển thị
        const LIST_MA_BANSAO = booksDetail.value.map(book => book.copyId);
        
        const response = await checkBill(
            userData.value.MADOCGIA,
            LIST_MA_BANSAO,
            paymentMethod.value
        );
        billData.value = response;
        
        // Chỉ còn VNPAY - Kiểm tra xem có paymentUrl không
        // apiBill.js return response.data, nên response chính là data từ server
        // Server trả về: { status, message, data: { bill, paymentUrl, ... } }
        const paymentUrl = response?.paymentUrl;

        if (!paymentUrl) {
            message.error('Có lỗi xảy ra trong quá trình xử lý thanh toán VNPAY');
            submitting.value = false;
            return;
        }
        clearSelectedBagItems();
        clearBag();
        // Chuyển hướng đến URL thanh toán VNPAY
        window.location.href = paymentUrl;
    } catch (error) {
        console.error('❌ Error creating bill:', error);
        console.error('Error response:', error.response?.data);
        const errorMsg = error.response?.data?.message || 'Không thể tạo phiếu mượn';
        message.error(errorMsg);
        submitting.value = false;
    }
};

const handleCashSubmit = async () => {
    if (booksDetail.value.length === 0) {
        message.warning('Không có sách để mượn');
        return;
    }
    
    if (!canProceed.value) {
        message.error(`Bạn chỉ còn có thể mượn thêm ${remainingSlots.value} cuốn sách`);
        return;
    }
    
    submitting.value = true;
    try {
        // Lấy danh sách MA_BANSAO từ tất cả sách hiển thị
        const LIST_MA_BANSAO = booksDetail.value.map(book => book.copyId);
        
        const response = await createBill(
            userData.value.MADOCGIA,
            LIST_MA_BANSAO,
            paymentMethod.value
        );
        billData.value = response;
        
        // Hiển thị modal thành công
        showSuccessModal.value = true;
        
        // Xoá giỏ hàng và sách đã chọn
        clearSelectedBagItems();
        clearBookIds();
        
    } catch (error) {
        console.error('❌ Error creating bill:', error);
        console.error('Error response:', error.response?.data);
        const errorMsg = error.response?.data?.message || 'Không thể tạo phiếu mượn';
        message.error(errorMsg);
    } finally {
        submitting.value = false;
    }
};

const returnPage = () => {
    clearBookIds();
    router.back();
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

const goToHistory = () => {
    showSuccessModal.value = false;
    router.push('/profile/history');
};

const goToHome = () => {
    showSuccessModal.value = false;
    router.push('/');
};
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div class="container mx-auto px-4 max-w-6xl">
            <NSpace vertical :size="24">
                <!-- Header -->
                <div>
                    <h1 class="text-3xl font-bold mb-2">Xác nhận mượn sách</h1>
                    <NText class="text-gray-500 dark:text-gray-400">
                        Kiểm tra thông tin và chọn phương thức thanh toán
                    </NText>
                </div>

                <div v-if="loading" class="flex justify-center items-center h-64">
                    <NSpin size="large" />
                </div>

                <template v-else>
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Left: Book List -->
                        <div class="lg:col-span-2">
                            <NCard :bordered="true">
                                <template #header>
                                    <div>
                                        <div class="font-bold text-lg">Danh sách sách mượn</div>
                                        <NText depth="3" class="text-sm">
                                            Các sách đã chọn từ balo ({{ booksDetail.length }} cuốn)
                                        </NText>
                                    </div>
                                </template>
                                
                                <NSpace vertical :size="12">
                                    <NCard
                                        v-for="book in booksDetail"
                                        :key="book.copyId"
                                        size="small"
                                        :bordered="true"
                                        class="border-2 border-blue-500 dark:border-blue-400"
                                    >
                                        <div class="flex gap-4">
                                            <!-- Book Image -->
                                            <div class="flex-shrink-0">
                                                <NImage
                                                    :src="`${API_BASE}${book.HINHANH}`"
                                                    :alt="book.TENSACH"
                                                    width="80"
                                                    height="120"
                                                    object-fit="cover"
                                                    class="rounded"
                                                />
                                            </div>

                                            <!-- Book Info -->
                                            <div class="flex-1">
                                                <h3 class="text-lg font-semibold mb-2">
                                                    {{ book.TENSACH }}
                                                </h3>
                                                <NSpace vertical :size="4">
                                                    <NText class="text-sm text-gray-600 dark:text-gray-400">
                                                        <NIcon><i class="fa-solid fa-user-pen"></i></NIcon>
                                                        {{ book.TACGIA }}
                                                    </NText>
                                                    <NSpace :size="4">
                                                        <NTag size="tiny" type="info">{{ book.copyId }}</NTag>
                                                    </NSpace>
                                                    <NSpace :size="4">
                                                        <NTag
                                                            v-for="category in book.THELOAI?.slice(0, 3)"
                                                            :key="category.MaLoai"
                                                            :color="{ color: category.Color }"
                                                            size="small"
                                                        >
                                                            {{ category.TenLoai }}
                                                        </NTag>
                                                    </NSpace>
                                                </NSpace>
                                            </div>

                                            <!-- Price -->
                                            <div class="flex-shrink-0 text-right">
                                                <NTag type="warning" size="large">
                                                    {{ formatPrice(book.DONGIA || 0) }}
                                                </NTag>
                                            </div>
                                        </div>
                                    </NCard>
                                </NSpace>
                            </NCard>
                        </div>

                        <!-- Right: Summary & Payment -->
                        <div class="lg:col-span-1">
                            <NSpace vertical :size="16">
                                <!-- User Info -->
                                <NCard title="Thông tin mượn" :bordered="true">
                                    <NDescriptions label-placement="left" :column="1" size="small">
                                        <NDescriptionsItem label="Độc giả">
                                            {{ userInfo?.HOLOT }} {{ userInfo?.TEN }}
                                        </NDescriptionsItem>
                                        <NDescriptionsItem label="Gói dịch vụ">
                                            <NTag type="info">{{ userInfo?.GOI?.TenGoi }}</NTag>
                                        </NDescriptionsItem>
                                        <NDescriptionsItem label="Đang mượn">
                                            <NTag :type="currentBorrowingCount >= maxBooksAllowed ? 'error' : 'success'">
                                                {{ currentBorrowingCount }} / {{ maxBooksAllowed }} cuốn
                                            </NTag>
                                        </NDescriptionsItem>
                                        <NDescriptionsItem label="Còn lại">
                                            <NTag :type="remainingSlots > 0 ? 'success' : 'error'">
                                                {{ remainingSlots }} cuốn
                                            </NTag>
                                        </NDescriptionsItem>
                                        <NDescriptionsItem label="Sẽ mượn">
                                            <NTag :type="canProceed ? 'info' : 'error'">
                                                {{ booksDetail.length }} cuốn
                                            </NTag>
                                        </NDescriptionsItem>
                                        <NDescriptionsItem label="Thời hạn mượn">
                                            {{ borrowDuration }} ngày
                                        </NDescriptionsItem>
                                        <NDescriptionsItem label="Ngày hẹn trả">
                                            <NTag type="success">{{ returnDate }}</NTag>
                                        </NDescriptionsItem>
                                    </NDescriptions>
                                </NCard>

                                <!-- Payment Method -->
                                <NCard title="Phương thức thanh toán" :bordered="true">
                                    <NSpace vertical :size="12">
                                        <NRadioGroup v-model:value="paymentMethod" size="large" class="w-full">
                                            <NSpace vertical :size="12" class="w-full">
                                                <NRadioButton value="online" class="w-full">
                                                    <NSpace align="center">
                                                        <NIcon size="20" color="#0088cc">
                                                            <i class="fa-solid fa-credit-card"></i>
                                                        </NIcon>
                                                        <div class="w-full">
                                                            <div class="font-semibold">Chuyển khoản VNPAY</div>
                                                            <NText depth="3" class="text-xs">
                                                                Thanh toán trực tuyến an toàn
                                                            </NText>
                                                        </div>
                                                    </NSpace>
                                                </NRadioButton>
                                                <NRadioButton value="cash" class="w-full">
                                                    <NSpace align="center">
                                                        <NIcon size="20" color="#52c41a">
                                                            <i class="fa-solid fa-money-bill-wave"></i>
                                                        </NIcon>
                                                        <div>
                                                            <div class="font-semibold">Tiền mặt</div>
                                                            <NText depth="3" class="text-xs">
                                                                Thanh toán tại quầy thư viện
                                                            </NText>
                                                        </div>
                                                    </NSpace>
                                                </NRadioButton>
                                            </NSpace>
                                        </NRadioGroup>
                                        <NDivider class="!my-2" />
                                        <NText depth="3" class="text-xs">
                                            💡 Sau khi thanh toán thành công, vui lòng đến quầy thư viện để nhận sách
                                        </NText>
                                    </NSpace>
                                </NCard>

                                <!-- Total -->
                                <NCard :bordered="true">
                                    <NSpace vertical :size="12">
                                        <NSpace justify="space-between">
                                            <NText>Số sách:</NText>
                                            <NTag :type="canProceed ? 'info' : 'error'">
                                                {{ booksDetail.length }} cuốn
                                            </NTag>
                                        </NSpace>
                                        <NSpace justify="space-between">
                                            <NText>Tổng tiền:</NText>
                                            <NText strong class="text-xl text-orange-500">
                                                {{ formatPrice(totalAmount) }}
                                            </NText>
                                        </NSpace>
                                        <NDivider class="!my-0" />
                                        <NButton
                                            v-if="paymentMethod === 'online'"
                                            type="primary"
                                            size="large"
                                            block
                                            :loading="submitting"
                                            :disabled="!canProceed"
                                            @click="handleVNPSubmit"
                                        >
                                            <template #icon>
                                                <NIcon><i class="fa-solid fa-credit-card"></i></NIcon>
                                            </template>
                                            Thanh toán VNPAY
                                        </NButton>
                                        <NButton
                                            v-else
                                            type="success"
                                            size="large"
                                            block
                                            :loading="submitting"
                                            :disabled="!canProceed"
                                            @click="handleCashSubmit"
                                        >
                                            <template #icon>
                                                <NIcon><i class="fa-solid fa-money-bill-wave"></i></NIcon>
                                            </template>
                                            Thanh toán tiền mặt
                                        </NButton>
                                        <NText v-if="!canProceed" type="error" class="text-xs text-center">
                                            Vượt quá giới hạn! Bạn chỉ còn có thể mượn thêm {{ remainingSlots }} cuốn
                                        </NText>
                                        <NButton
                                            size="large"
                                            block
                                            @click="returnPage"
                                        >
                                            <template #icon>
                                                <NIcon><i class="fa-solid fa-arrow-left"></i></NIcon>
                                            </template>
                                            Quay lại
                                        </NButton>
                                    </NSpace>
                                </NCard>
                            </NSpace>
                        </div>
                    </div>
                </template>
            </NSpace>
        </div>

        <!-- Success Modal -->
        <NModal
            v-model:show="showSuccessModal"
            preset="dialog"
            title="Thanh toán thành công!"
            positive-text="Xem lịch sử mượn"
            negative-text="Về trang chủ"
            @positive-click="goToHistory"
            @negative-click="goToHome"
        >
            <NSpace vertical :size="16" align="center" class="py-4">
                <NIcon size="64" color="#52c41a">
                    <i class="fa-solid fa-circle-check"></i>
                </NIcon>
                <div class="text-center">
                    <NText class="text-lg font-semibold">
                        Tạo phiếu mượn thành công!
                    </NText>
                    <br />
                    <NText depth="3" class="text-sm mt-2">
                        Vui lòng đến quầy thư viện để thanh toán và nhận sách
                    </NText>
                </div>
            </NSpace>
        </NModal>
    </div>
</template>
