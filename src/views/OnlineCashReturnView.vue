<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    NResult,
    NButton,
    NIcon,
    NSpace,
    NCard,
    NSpin,
    useMessage,
    NText
} from 'naive-ui';
import {
    createBill
} from '../services/apiBill';
import {
    getBookIds,
    clearBookIds
} from '../hooks/usePayment';
import {
    clearSelectedBagItems,
    removeFromBag
} from '../hooks/useBag';
import {
    getAccountData
} from '../hooks/useAccount';

const message = useMessage();
const route = useRoute();
const router = useRouter();

const provider = ref(''); // 'vnpay' or 'paypal'
const status = ref('');
const resultMessage = ref('');
const resultContent = ref('');
const resultStatus = ref('');
const loading = ref(true);

// Detect payment provider from query params
const detectProvider = () => {
    // VNPay has vnp_ResponseCode
    if (route.query.vnp_ResponseCode) {
        return 'vnpay';
    }
    // PayPal has token or PayerID
    if (route.query.token || route.query.PayerID) {
        return 'paypal';
    }
    return null;
};

// Process VNPay response
const processVNPayResponse = (responseCode) => {
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
        }
    };
    
    const result = errorCode[responseCode] || {
        status: 'error',
        message: 'Giao dịch thất bại',
        content: 'Có lỗi xảy ra. Vui lòng liên hệ hỗ trợ.'
    };
    
    message[result.status](result.message);
    resultMessage.value = result.message;
    resultContent.value = result.content;
    resultStatus.value = result.status;
};

// Process PayPal response
const processPayPalResponse = () => {
    // If we have token and no error, consider it success
    // The actual capture will be done by backend
    const hasError = route.query.error || route.query.cancelled;
    
    if (hasError) {
        resultStatus.value = 'error';
        resultMessage.value = 'Giao dịch bị hủy';
        resultContent.value = 'Vui lòng thử lại hoặc liên hệ hỗ trợ.';
        message.error(resultMessage.value);
    } else {
        resultStatus.value = 'success';
        resultMessage.value = 'Giao dịch thành công';
        resultContent.value = 'RuryLib cảm ơn quý khách đã mượn sách tại thư viện.';
        message.success(resultMessage.value);
    }
};

// Create bill after successful payment
const createBillAfterPayment = async () => {
    try {
        const accountData = getAccountData();
        const MADOCGIA = accountData.MADOCGIA;
        const LIST_MA_BANSAO = getBookIds();
        const LOAITHANHTOAN = provider.value === 'vnpay' ? 'online' : 'paypal';
        
        // Prepare payment details based on provider
        const paymentDetails = {};
        if (provider.value === 'paypal') {
            paymentDetails.PAYPAL_TOKEN = route.query.token;
            paymentDetails.PAYER_ID = route.query.PayerID;
        } else if (provider.value === 'vnpay') {
            paymentDetails.VNPAY_TRANSACTION_ID = route.query.vnp_TransactionNo;
        }
        
        loading.value = true;
        const response = await createBill(
            MADOCGIA,
            LIST_MA_BANSAO,
            LOAITHANHTOAN,
            paymentDetails
        );
        loading.value = false;
        
        if (response.status === 'success') {
            clearBookIds();
            clearSelectedBagItems();
            
            // Remove items from bag
            LIST_MA_BANSAO.forEach(copyId => {
                removeFromBag(copyId);
            });
        } else {
            resultStatus.value = 'error';
            resultMessage.value = 'Lỗi tạo phiếu mượn';
            resultContent.value = 'Thanh toán thành công nhưng không thể tạo phiếu mượn. Vui lòng liên hệ hỗ trợ.';
        }
    } catch (error) {
        loading.value = false;
        resultStatus.value = 'error';
        resultMessage.value = 'Lỗi hệ thống';
        resultContent.value = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng liên hệ hỗ trợ.';
    }
};

onMounted(async () => {
    provider.value = detectProvider();
    
    if (!provider.value) {
        resultStatus.value = 'error';
        resultMessage.value = 'Giao dịch không hợp lệ';
        resultContent.value = 'Không xác định được phương thức thanh toán.';
        loading.value = false;
        return;
    }
    
    // Process based on provider
    if (provider.value === 'vnpay') {
        status.value = route.query.vnp_ResponseCode;
        processVNPayResponse(status.value);
        
        // Create bill if payment successful
        if (status.value === '00') {
            await createBillAfterPayment();
        } else {
            loading.value = false;
        }
    } else if (provider.value === 'paypal') {
        processPayPalResponse();
        
        // Create bill if payment successful
        if (resultStatus.value === 'success') {
            await createBillAfterPayment();
        } else {
            loading.value = false;
        }
    }
});
</script>

<template>
    <NSpace justify="center" align="center" direction="vertical" class="w-full h-screen">
        <NCard 
            :title="resultStatus === 'success' ? '✅ Thanh toán thành công' : '❌ Thanh toán thất bại'" 
            style="width: 600px; max-width: 90%;"
        >
            <NSpin :show="loading">
                <NResult
                    :status="resultStatus || 'info'"
                    :title="resultMessage"
                >
                    <template #default>
                        <NSpace vertical size="large" justify="center" align="center">
                            <NCard 
                                v-if="resultStatus === 'success'" 
                                size="small"
                                class="w-full"
                            >
                                <NText class="block mb-2">
                                    <strong>⚠️ Lưu ý quan trọng:</strong>
                                </NText>
                                <NText depth="3" class="text-sm">
                                    Quý khách vui lòng đến nhận sách trong vòng <strong class="text-orange-500">3 ngày</strong> kể từ ngày thanh toán.
                                </NText>
                                <br />
                                <NText depth="3" class="text-sm">
                                    Nếu vượt quá thời gian, Thư viện sẽ hủy đơn mượn. 
                                    <strong class="text-red-500">Số tiền sẽ không được hoàn trả!</strong>
                                </NText>
                            </NCard>
                            
                            <NText>{{ resultContent }}</NText>
                            
                            <NSpace>
                                <NButton type="primary" @click="router.push('/')">
                                    <template #icon>
                                        <NIcon><i class="fa-solid fa-home"></i></NIcon>
                                    </template>
                                    Quay về trang chủ
                                </NButton>
                                <NButton 
                                    v-if="resultStatus === 'success'"
                                    secondary 
                                    @click="router.push('/user/profile/history')"
                                >
                                    <template #icon>
                                        <NIcon><i class="fa-solid fa-history"></i></NIcon>
                                    </template>
                                    Xem lịch sử mượn
                                </NButton>
                            </NSpace>
                        </NSpace>
                    </template>
                </NResult>
            </NSpin>
        </NCard>
    </NSpace>
</template>
