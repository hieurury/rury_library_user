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
    NSpin,
    useMessage,
    NHighlight
} from 'naive-ui';
import {
    createBill
} from '../services/apiBill';
import {
    getBookIds,
    clearBookIds
} from '../hooks/usePayment';
import {
    clearSelectedBagItems
} from '../hooks/useBag';
import {
    getAccountData
} from '../hooks/useAccount';


const message = useMessage();

const route = useRoute();
const router = useRouter();

const status = ref('');
const resultMessage = ref('');
const resultContent = ref('');
const resultStatus = ref('');
const billStatus = ref('');
const loading = ref(true);

const solveRespone = (responseCode) => {
    const errorCode = {
        '00': {
            status: 'success',
            message: 'Giao dịch thành công',
            content: 'RuryLib cảm ơn quý khách đã mượn sách tại thư viện.'
        },
        '51': {
            status: 'error',
            message: 'Số dư không đủ',
            content: 'Vui lòng kiểm tra số dư tài khoản và thử lại.'
        },
        '24': {
            status: 'error',
            message: 'Giao dịch bị hủy',
            content: 'Vui lòng thử lại hoặc liên hệ hỗ trợ.'
        },
    }
    message[errorCode[responseCode].status](errorCode[responseCode].message);
    resultMessage.value = errorCode[responseCode].message;
    resultContent.value = errorCode[responseCode].content;
    resultStatus.value = errorCode[responseCode].status;

}

onMounted(async () => {
    // Lấy params từ URL
    status.value = route.query.vnp_ResponseCode;
    console.log(status.value, message.value);
    solveRespone(status.value);

    //xử lí tạo bill
    if(resultStatus.value === 'success') {
        const accountData = getAccountData();
        const MADOCGIA = accountData.MADOCGIA;
        const LIST_MA_BANSAO = getBookIds();
        const LOAITHANHTOAN = 'online';
        loading.value = true;
        const response = await createBill(
            MADOCGIA,
            LIST_MA_BANSAO,
            LOAITHANHTOAN
        );
        console.log(response);
        loading.value = false;
        if(response.status === 'success') {
            billStatus.value = 'success';
            clearBookIds();
            //xoá các sách đã chọn khỏi giỏ
            clearSelectedBagItems(LIST_MA_BANSAO);
        } else {
            billStatus.value = 'error';
        }
    } else {
        loading.value = false;
    }

});

</script>

<template>
    <NSpace justify="center" align="center" direction="vertical" style="width: 100%; height: 100vh;">
        <NCard :title="status === '00' ? '✅ Thanh toán thành công' : '❌ Thanh toán thất bại'" style="width: 600px; margin: auto; margin-top: 50px;">
            <NSpin :show="loading">
                <NResult
                    :status="resultStatus || 'info'"
                    :title="resultMessage"
                >
                    <template #default>
                        <NSpace vertical size="large" justify="center" align="center">
                            <div v-if="resultStatus === 'success'" class="bg-slate-300 p-2 border-l-2 border-orange-500 text-gray-700 italic">
                                Quý khách vui lòng đến nhận sách trong vòng <span class="font-bold text-blue-500">3 ngày</span> kể từ ngày thanh toán <br>
                                Nếu vượt quá thời gian, Thư viện sẽ huỷ đơn mượn. Số tiền sẽ không được hoàn trả! <br>
                            </div>
                            <div>{{ resultContent }}</div>
                            <NButton type="primary" @click="router.push('/')">Quay về trang chủ</NButton>
                        </NSpace>
                    </template>
                </NResult>
            </NSpin>
        </NCard>
    </NSpace>
</template>
