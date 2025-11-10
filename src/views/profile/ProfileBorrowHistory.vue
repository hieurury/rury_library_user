<script setup>
import { ref, onMounted, computed, h } from 'vue';
import {
    NCard,
    NSpace,
    NDataTable,
    NTag,
    NButton,
    NIcon,
    NSpin,
    NEmpty,
    NDrawer,
    NDrawerContent,
    NDescriptions,
    NDescriptionsItem,
    NImage,
    NDivider,
    NGrid,
    NGi,
    NPagination,
    NPopconfirm,
    useMessage
} from 'naive-ui';
import { getAccountData } from '../../hooks/useAccount';
import { getBillsByDocGia, getBillById, cancelBill } from '../../services/apiBill';
import { useRouter } from 'vue-router';
import FavoriteButton from '../../components/FavoriteButton.vue';

const API_BASE = import.meta.env.VITE_API_BASE;
const router = useRouter();
const message = useMessage();

// State
const loading = ref(false);
const bills = ref([]);
const selectedBill = ref(null);
const showDetailDrawer = ref(false);
const detailLoading = ref(false);

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);
const paginatedBills = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return bills.value.slice(start, end);
});

// Lifecycle
onMounted(async () => {
    const userData = getAccountData();
    if (!userData) {
        message.error('Vui lòng đăng nhập');
        router.push('/auth/login');
        return;
    }
    
    await loadBills(userData.MADOCGIA);
    console.log(bills.value);
});

// Methods
const loadBills = async (MADOCGIA) => {
    loading.value = true;
    try {
        const response = await getBillsByDocGia(MADOCGIA);
        bills.value = response.data || [];
    } catch (error) {
        message.error('Không thể tải lịch sử mượn');
    } finally {
        loading.value = false;
    }
};

const handleViewDetail = async (row) => {
    showDetailDrawer.value = true;
    detailLoading.value = true;
    
    try {
        const response = await getBillById(row.MABILL);
        selectedBill.value = response.data;
    } catch (error) {
        message.error('Không thể tải chi tiết bill');
    } finally {
        detailLoading.value = false;
    }
};

const handleCancelBill = async () => {
    if (!selectedBill.value) return;
    
    try {
        const response = await cancelBill(selectedBill.value.MABILL);
        message.success(response.message || 'Hủy đơn mượn sách thành công');
        
        // Reload bills và đóng drawer
        const userData = getAccountData();
        await loadBills(userData.MADOCGIA);
        showDetailDrawer.value = false;
        selectedBill.value = null;
    } catch (error) {
        message.error(error.response?.data?.message || 'Không thể hủy đơn mượn sách');
    }
};

const canCancelBill = computed(() => {
    if (!selectedBill.value) return false;
    
    // Chỉ cho phép hủy nếu:
    // 1. Chưa thanh toán HOẶC
    // 2. Tất cả phiếu đang ở trạng thái waiting
    const hasWaitingPhieu = selectedBill.value.PHIEUMUON?.some(p => p.TINHTRANG === 'waiting');
    const allWaiting = selectedBill.value.PHIEUMUON?.every(p => p.TINHTRANG === 'waiting');
    
    return !selectedBill.value.BIHUY && hasWaitingPhieu && allWaiting;
});

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Table columns
const columns = [
    {
        title: 'Mã Bill',
        key: 'MABILL',
        width: 130,
        render(row) {
            return h(
                NTag,
                { type: 'info', size: 'small' },
                { default: () => row.MABILL }
            );
        }
    },
    {
        title: 'Ngày lập',
        key: 'NGAYLAP',
        width: 150,
        render(row) {
            return formatDate(row.NGAYLAP);
        }
    },
    {
        title: 'Số sách',
        key: 'DANHSACHPHIEU',
        width: 100,
        align: 'center',
        render(row) {
            return h(
                NTag,
                { type: 'info', size: 'small' },
                { default: () => `${row.DANHSACHPHIEU?.length || 0} cuốn` }
            );
        }
    },
    {
        title: 'Tổng tiền',
        key: 'TONGTIEN',
        width: 130,
        render(row) {
            return h(
                'span',
                { class: 'font-semibold text-orange-600' },
                formatPrice(row.TONGTIEN)
            );
        }
    },
    {
        title: 'Thanh toán',
        key: 'LOAITHANHTOAN',
        width: 120,
        render(row) {
            return h(
                NTag,
                {
                    type: 'info',
                    size: 'small'
                },
                {
                    default: () => {
                        return row.LOAITHANHTOAN === 'online' ? 'VNPAY' : 'Tiền mặt';
                    }
                }
            );
        }
    },
    {
        title: 'Trạng thái',
        key: 'TRANGTHAI',
        width: 130,
        render(row) {
            return h(
                NTag,
                {
                    type: row.BIHUY ? 'error' : (row.TRANGTHAI ? 'success' : 'warning'),
                    size: 'small'
                },
                {
                    default: () => {
                        if(row.BIHUY) {
                            return 'Đã huỷ';
                        } else {
                            return row.TRANGTHAI ? 'Đã thanh toán' : 'Chưa thanh toán';
                        }
                    }
                }
            );
        }
    },
    {
        title: 'Hành động',
        key: 'actions',
        width: 100,
        align: 'center',
        render(row) {
            return h(
                NButton,
                {
                    size: 'small',
                    type: 'primary',
                    text: true,
                    onClick: () => handleViewDetail(row)
                },
                {
                    default: () => 'Chi tiết',
                    icon: () => h(NIcon, null, {
                        default: () => h('i', { class: 'fa-solid fa-eye' })
                    })
                }
            );
        }
    }
];

const renderTINHTRANG = (status) => {
    if (status === 'borrowing') {
        return {
            status: 'Đang mượn',
            type: 'warning'
        };
    } else if (status === 'returned') {
        return {
            status: 'Đã trả',
            type: 'success'
        };
    } else {
        return {
            status: 'Chờ lấy',
            type: 'info'
        };
    }
};

</script>

<template>
    <div class="p-6">
        <NSpace vertical :size="24">
            <!-- Header -->
            <div>
                <h1 class="text-2xl font-bold mb-2">Lịch sử mượn sách</h1>
                <p class="text-gray-500 dark:text-gray-400">
                    Danh sách tất cả các bill mượn sách của bạn
                </p>
            </div>

            <!-- Table -->
            <NCard :bordered="false" class="shadow-md">
                <div v-if="loading" class="flex justify-center items-center h-64">
                    <NSpin size="large" />
                </div>

                <div v-else-if="bills.length === 0">
                    <NEmpty description="Bạn chưa có lịch sử mượn sách nào">
                        <template #extra>
                            <NButton type="primary" @click="router.push('/')">
                                <template #icon>
                                    <NIcon><i class="fa-solid fa-book"></i></NIcon>
                                </template>
                                Khám phá sách
                            </NButton>
                        </template>
                    </NEmpty>
                </div>

                <template v-else>
                    <NDataTable
                        :columns="columns"
                        :data="paginatedBills"
                        :bordered="false"
                        :single-line="false"
                    />
                    
                    <div class="flex justify-end mt-4">
                        <NPagination
                            v-model:page="currentPage"
                            :page-count="Math.ceil(bills.length / pageSize)"
                            :page-size="pageSize"
                            show-size-picker
                            :page-sizes="[5, 10, 20, 50]"
                            @update:page-size="(size) => { pageSize = size; currentPage = 1; }"
                        />
                    </div>
                </template>
            </NCard>
        </NSpace>

        <!-- Detail Drawer -->
        <NDrawer
            v-model:show="showDetailDrawer"
            :width="600"
            placement="right"
        >
            <NDrawerContent title="Chi tiết Bill" closable>
                <div v-if="detailLoading" class="flex justify-center items-center h-64">
                    <NSpin size="large" />
                </div>

                <NSpace v-else-if="!selectedBill.BIHUY" vertical :size="20">
                    <!-- Bill Info -->
                    <NCard title="Thông tin bill" :bordered="true" size="small">
                        <NDescriptions label-placement="left" :column="1" size="small" bordered>
                            <NDescriptionsItem label="Mã Bill">
                                <NTag type="info">{{ selectedBill.MABILL }}</NTag>
                            </NDescriptionsItem>
                            <NDescriptionsItem label="Ngày lập">
                                {{ formatDate(selectedBill.NGAYLAP) }}
                            </NDescriptionsItem>
                            <NDescriptionsItem label="Phương thức">
                                <NTag type="info">
                                    {{ selectedBill.LOAITHANHTOAN === 'online' ? 'VNPAY' : 'Tiền mặt' }}
                                </NTag>
                            </NDescriptionsItem>
                            <NDescriptionsItem label="Trạng thái">
                                <NTag :type="selectedBill.TRANGTHAI ? 'success' : 'warning'">
                                    {{ selectedBill.TRANGTHAI ? 'Đã thanh toán' : 'Chưa thanh toán' }}
                                </NTag>
                            </NDescriptionsItem>
                            <NDescriptionsItem v-if="selectedBill.NGAYTHANHTOAN" label="Ngày thanh toán">
                                {{ formatDate(selectedBill.NGAYTHANHTOAN) }}
                            </NDescriptionsItem>
                            <NDescriptionsItem v-if="selectedBill.VNPAY_TRANSACTION_ID" label="Mã giao dịch">
                                <NTag size="small">{{ selectedBill.VNPAY_TRANSACTION_ID }}</NTag>
                            </NDescriptionsItem>
                            <NDescriptionsItem label="Tổng tiền">
                                <span class="text-lg font-bold text-orange-600">
                                    {{ formatPrice(selectedBill.TONGTIEN) }}
                                </span>
                            </NDescriptionsItem>
                        </NDescriptions>
                    </NCard>

                    <!-- Books List -->
                    <NCard title="Danh sách sách" :bordered="true" size="small">
                        <!-- Hiển thị phiếu mượn -->
                        <NSpace v-if="selectedBill.PHIEUMUON && selectedBill.PHIEUMUON.length > 0" vertical :size="12">
                            <div
                                v-for="phieu in selectedBill.PHIEUMUON"
                                :key="phieu.MAPHIEU"
                                class="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                            >
                                <NGrid :cols="4" :x-gap="12">
                                    <!-- Book Image -->
                                    <NGi :span="1">
                                        <NImage
                                            :src="`${API_BASE}${phieu.SACH?.HINHANH}`"
                                            :alt="phieu.SACH?.TENSACH"
                                            width="100%"
                                            object-fit="cover"
                                            class="rounded"
                                        />
                                    </NGi>

                                    <!-- Book Info -->
                                    <NGi :span="3">
                                        <NSpace vertical :size="4">
                                            <h4 
                                                class="font-semibold text-sm line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                @click="router.push(`/book/${phieu.SACH?.MASACH}`)"
                                            >
                                                {{ phieu.SACH?.TENSACH }}
                                            </h4>
                                            <p class="text-xs text-gray-600 dark:text-gray-400">
                                                <NIcon><i class="fa-solid fa-user-pen"></i></NIcon>
                                                {{ phieu.SACH?.TACGIA }}
                                            </p>
                                            <NSpace :size="4">
                                                <NTag size="tiny" type="info">{{ phieu.MAPHIEU }}</NTag>
                                                <NTag size="tiny" type="warning">{{ formatPrice(phieu.GIA) }}</NTag>
                                            </NSpace>
                                            <div class="text-xs text-gray-500">
                                                <div>Mượn: {{ formatDate(phieu.NGAYMUON) }}</div>
                                                <div>Hạn trả: {{ formatDate(phieu.NGAYHANTRA) }}</div>
                                                <div v-if="phieu.NGAYTRA">
                                                    Đã trả: {{ formatDate(phieu.NGAYTRA) }}
                                                </div>
                                            </div>
                                            <NSpace :size="4" align="center">
                                                <NTag
                                                    size="small"
                                                    :type="renderTINHTRANG(phieu.TINHTRANG).type"
                                                >
                                                    {{ renderTINHTRANG(phieu.TINHTRANG).status }}
                                                </NTag>
                                                <FavoriteButton :book-id="phieu.SACH?.MASACH" size="tiny" circle />
                                            </NSpace>
                                        </NSpace>
                                    </NGi>
                                </NGrid>
                            </div>
                        </NSpace>

                        <!-- Empty state -->
                        <div v-else>
                            <NEmpty description="Chưa có sách nào" size="small" />
                        </div>
                    </NCard>

                    <!-- Cancel Bill Button -->
                    <NCard v-if="canCancelBill" :bordered="true" size="small">
                        <NSpace vertical :size="12">
                            <div class="text-sm text-gray-600 dark:text-gray-400">
                                <NIcon color="#faad14"><i class="fa-solid fa-circle-info"></i></NIcon>
                                Đơn mượn sách này đang chờ lấy sách. Bạn có thể hủy đơn nếu không còn nhu cầu mượn.
                            </div>
                            <NPopconfirm
                                @positive-click="handleCancelBill"
                                positive-text="Xác nhận hủy"
                                negative-text="Không"
                            >
                                <template #trigger>
                                    <NButton type="error" block secondary>
                                        <template #icon>
                                            <NIcon><i class="fa-solid fa-trash-can"></i></NIcon>
                                        </template>
                                        Hủy đơn mượn sách
                                    </NButton>
                                </template>
                                Bạn có chắc chắn muốn hủy đơn mượn sách này? Hành động này không thể hoàn tác.
                            </NPopconfirm>
                        </NSpace>
                    </NCard>
                </NSpace>
                <NSpace justify="center" v-else-if="selectedBill.BIHUY">
                    <NEmpty description="Đơn mượn sách đã bị hủy" size="small" />
                </NSpace>
            </NDrawerContent>
        </NDrawer>
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
