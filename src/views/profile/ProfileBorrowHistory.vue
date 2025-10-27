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
    useMessage
} from 'naive-ui';
import { getAccountData } from '../../hooks/useAccount';
import { getBillsByDocGia, getBillById } from '../../services/apiBill';
import { useRouter } from 'vue-router';

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
});

// Methods
const loadBills = async (MADOCGIA) => {
    loading.value = true;
    try {
        const response = await getBillsByDocGia(MADOCGIA);
        bills.value = response.data || [];
    } catch (error) {
        console.error(error);
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
        console.error(error);
        message.error('Không thể tải chi tiết bill');
    } finally {
        detailLoading.value = false;
    }
};

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
            return row.DANHSACHPHIEU?.length || 0;
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
                    type: row.LOAITHANHTOAN === 'cash' ? 'warning' : 'success',
                    size: 'small'
                },
                {
                    default: () => row.LOAITHANHTOAN === 'cash' ? 'Tiền mặt' : 'VNPAY'
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
                    type: row.TRANGTHAI ? 'success' : 'error',
                    size: 'small'
                },
                {
                    default: () => row.TRANGTHAI ? 'Đã thanh toán' : 'Chưa thanh toán'
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

                <NSpace v-else-if="selectedBill" vertical :size="20">
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
                                <NTag :type="selectedBill.LOAITHANHTOAN === 'cash' ? 'warning' : 'success'">
                                    {{ selectedBill.LOAITHANHTOAN === 'cash' ? 'Tiền mặt' : 'VNPAY' }}
                                </NTag>
                            </NDescriptionsItem>
                            <NDescriptionsItem label="Trạng thái">
                                <NTag :type="selectedBill.TRANGTHAI ? 'success' : 'error'">
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
                        <NSpace vertical :size="12">
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
                                            width="60"
                                            height="90"
                                            object-fit="cover"
                                            class="rounded"
                                        />
                                    </NGi>

                                    <!-- Book Info -->
                                    <NGi :span="3">
                                        <NSpace vertical :size="4">
                                            <h4 class="font-semibold text-sm line-clamp-2">
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
                                            <NTag
                                                size="small"
                                                :type="phieu.TINHTRANG === 'borrowing' ? 'warning' : 'success'"
                                            >
                                                {{ phieu.TINHTRANG === 'borrowing' ? 'Đang mượn' : 'Đã trả' }}
                                            </NTag>
                                        </NSpace>
                                    </NGi>
                                </NGrid>
                            </div>

                            <div v-if="!selectedBill.PHIEUMUON || selectedBill.PHIEUMUON.length === 0">
                                <NEmpty description="Chưa có phiếu mượn nào" size="small" />
                                <p class="text-xs text-center text-gray-500 mt-2">
                                    (Bill chờ thanh toán VNPAY)
                                </p>
                            </div>
                        </NSpace>
                    </NCard>
                </NSpace>
            </NDrawerContent>
        </NDrawer>
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
