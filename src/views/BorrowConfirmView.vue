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
    NRadioGroup,
    NRadio,
    NResult,
    NSpin,
    useMessage,
    NModal,
    NDescriptions,
    NDescriptionsItem
} from 'naive-ui';
import { useRouter } from 'vue-router';
import { getSelectedBagItems, clearBag, clearSelectedBagItems } from '../hooks/useBag';
import { getAccountData } from '../hooks/useAccount';
import { getBookById } from '../services/apiBook';
import { createBill } from '../services/apiBill';
import { getUserInfo, getBorrowingCount } from '../services/apiUser';

const API_BASE = import.meta.env.VITE_API_BASE;
const router = useRouter();
const message = useMessage();

// State
const loading = ref(false);
const submitting = ref(false);
const booksDetail = ref([]); // Chỉ chứa sách được chọn từ BagDrawer
const userInfo = ref(null);
const currentBorrowingCount = ref(0);
const paymentMethod = ref('cash'); // 'cash' or 'online'
const showSuccessModal = ref(false);
const billData = ref(null);

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
    const selectedItems = getSelectedBagItems();
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
                const res = await getBookById(item.bookId);
                return {
                    ...res.data,
                    copyId: item.copyId,
                    condition: item.condition
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

const handleSubmit = async () => {
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
        
        billData.value = response.data;
        
        if (paymentMethod.value === 'online') {
            // VNPAY: Kiểm tra xem có paymentUrl không
            if (response.data.paymentUrl) {
                // Clear bag và selection trước khi redirect
                clearBag();
                clearSelectedBagItems();
                // Redirect đến VNPAY
                window.location.href = response.data.paymentUrl;
            } else {
                // Chưa có VNPAY key
                message.error('Chức năng thanh toán VNPAY chưa được kích hoạt. Vui lòng chọn thanh toán tiền mặt');
                submitting.value = false;
                return;
            }
        } else {
            // Cash payment - show success modal
            showSuccessModal.value = true;
            // Clear bag và selection
            clearBag();
            clearSelectedBagItems();
        }
        
    } catch (error) {
        console.error(error);
        const errorMsg = error.response?.data?.message || 'Không thể tạo phiếu mượn';
        message.error(errorMsg);
    } finally {
        if (paymentMethod.value === 'cash') {
            submitting.value = false;
        }
        // Nếu online thì không set false vì đang redirect
    }
};

const handleCloseModal = () => {
    showSuccessModal.value = false;
    router.push('/user/profile/history');
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
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
                                                        <NTag 
                                                            size="tiny" 
                                                            :type="book.condition === 'new' ? 'success' : 'warning'"
                                                        >
                                                            {{ book.condition === 'new' ? 'Mới' : 'Cũ' }}
                                                        </NTag>
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
                                    <NRadioGroup v-model:value="paymentMethod">
                                        <NSpace vertical>
                                            <NRadio value="cash">
                                                <NSpace align="center">
                                                    <NIcon size="20"><i class="fa-solid fa-money-bill"></i></NIcon>
                                                    <div>
                                                        <div class="font-semibold">Tiền mặt</div>
                                                        <NText depth="3" class="text-xs">
                                                            Đến quầy thủ thư để nhận sách và thanh toán
                                                        </NText>
                                                    </div>
                                                </NSpace>
                                            </NRadio>
                                            <NDivider class="!my-2" />
                                            <NRadio value="online">
                                                <NSpace align="center">
                                                    <NIcon size="20"><i class="fa-solid fa-credit-card"></i></NIcon>
                                                    <div>
                                                        <div class="font-semibold">Chuyển khoản VNPAY</div>
                                                        <NText depth="3" class="text-xs">
                                                            Thanh toán trực tuyến, chỉ cần đến quầy lấy sách
                                                        </NText>
                                                    </div>
                                                </NSpace>
                                            </NRadio>
                                        </NSpace>
                                    </NRadioGroup>
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
                                            type="primary"
                                            size="large"
                                            block
                                            :loading="submitting"
                                            :disabled="!canProceed"
                                            @click="handleSubmit"
                                        >
                                            <template #icon>
                                                <NIcon><i class="fa-solid fa-check"></i></NIcon>
                                            </template>
                                            {{ paymentMethod === 'cash' ? 'Xác nhận mượn' : 'Thanh toán VNPAY' }}
                                        </NButton>
                                        <NText v-if="!canProceed" type="error" class="text-xs text-center">
                                            Vượt quá giới hạn! Bạn chỉ còn có thể mượn thêm {{ remainingSlots }} cuốn
                                        </NText>
                                        <NButton
                                            size="large"
                                            block
                                            @click="router.push('/')"
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
        <NModal v-model:show="showSuccessModal" preset="card" title="Thành công!" :bordered="false" class="max-w-md">
            <NResult status="success" title="Tạo phiếu mượn thành công!">
                <template #footer>
                    <NSpace vertical :size="12">
                        <NDescriptions label-placement="left" :column="1" size="small" bordered>
                            <NDescriptionsItem label="Mã Bill">
                                <NTag type="info">{{ billData?.bill?.MABILL }}</NTag>
                            </NDescriptionsItem>
                            <NDescriptionsItem label="Số sách">
                                {{ billData?.bill?.DANHSACHPHIEU?.length }} cuốn
                            </NDescriptionsItem>
                            <NDescriptionsItem label="Tổng tiền">
                                <NText strong class="text-orange-500">
                                    {{ formatPrice(billData?.bill?.TONGTIEN || 0) }}
                                </NText>
                            </NDescriptionsItem>
                            <NDescriptionsItem label="Thanh toán">
                                {{ paymentMethod === 'cash' ? 'Tiền mặt tại quầy' : 'VNPAY' }}
                            </NDescriptionsItem>
                        </NDescriptions>
                        
                        <NText depth="3" class="text-sm text-center">
                            {{ paymentMethod === 'cash' 
                                ? 'Vui lòng đến quầy thủ thư để nhận sách và thanh toán' 
                                : 'Vui lòng đến quầy thủ thư để nhận sách' 
                            }}
                        </NText>
                        
                        <NButton type="primary" block @click="handleCloseModal">
                            Xem lịch sử mượn
                        </NButton>
                    </NSpace>
                </template>
            </NResult>
        </NModal>
    </div>
</template>
