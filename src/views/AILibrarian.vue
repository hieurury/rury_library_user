<script setup>
import {
    NSpace,
    NButton,
    NInput,
    useMessage,
    NSpin,
    NAvatar,
    NCard,
    NIcon,
    NSwitch,
    NDivider,
    NLayout,
    NLayoutContent,
    NLayoutSider,
    NLayoutHeader,
    NText,
    NTag,
    NScrollbar,
    NBreadcrumb,
    NBreadcrumbItem
} from "naive-ui";
import { marked } from "marked";
import { ref, nextTick, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAccountData } from "../hooks/useAccount.js";
import AI from '../hooks/useAI.js';
const API_BASE = import.meta.env.VITE_API_BASE;

const router = useRouter();

const message = useMessage();
const history = ref([]);
const userRequest = ref('');
const loading = ref(false);
const chatHistoryRef = ref(null);
const accountData = ref(getAccountData());

// AI Configuration toggles
const enableBooks = ref(true);
const enableBorrowData = ref(true);
const enableLabBorrows = ref(true);

// Suggested questions
const suggestedQuestions = [
    { icon: 'fa-info-circle', text: 'Giới thiệu về thư viện RuryLib', category: 'info' },
    { icon: 'fa-book', text: 'Có những thể loại sách nào?', category: 'books' },
    { icon: 'fa-chart-line', text: 'Thống kê tình hình mượn trả sách', category: 'stats' },
    { icon: 'fa-list-check', text: 'Nội quy thư viện là gì?', category: 'rules' },
    { icon: 'fa-clock', text: 'Thời gian mượn sách tối đa', category: 'rules' },
    { icon: 'fa-tag', text: 'Giá mượn sách như thế nào?', category: 'info' }
];

// Load chat history from session storage on mount
onMounted(() => {
    history.value = AI.getChatHistory();
    console.log(accountData.value);
});

// Save chat history whenever it changes
watch(history, (newHistory) => {
    AI.saveChatHistory(newHistory);
    scrollToBottom();
}, { deep: true });

const scrollToBottom = () => {
    nextTick(() => {
        const el = chatHistoryRef.value?.$el || chatHistoryRef.value;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    });
};

const markdownRender = (value) => {
    if (!value) return '';
    return marked(value);
}

const sendRequest = async (questionText = null) => {
    const requestText = questionText || userRequest.value;
    if (!requestText.trim() || loading.value) return;

    history.value.push({ 
        isUser: true,
        message: requestText 
    });
    userRequest.value = '';
    loading.value = true;
    scrollToBottom();
    
    const aiMessageIndex = history.value.length;
    history.value.push({
        isUser: false,
        message: '...'
    });
    scrollToBottom();

    try {
        const response = await AI.generate({
            message: requestText, 
            has_books: enableBooks.value, 
            borrow_data: enableBorrowData.value, 
            lab_borrows: enableLabBorrows.value
        });
        if(response) {
            history.value[aiMessageIndex].message = response;
        } else {
            message.error("Không nhận được phản hồi từ AI.");
            history.value[aiMessageIndex].message = "Xin lỗi, đã có lỗi xảy ra.";
        }
    } catch (error) {
        message.error("Lỗi khi kết nối đến AI.");
        history.value[aiMessageIndex].message = "Xin lỗi, đã có lỗi xảy ra.";
    } finally {
        loading.value = false;
        scrollToBottom();
    }
}

const clearHistory = () => {
    history.value = [];
    AI.clearChatHistory();
    message.success('Đã xóa lịch sử chat');
}
</script>

<template>
    <NLayout has-sider class="h-screen">
        <!-- Content - Chat Area -->
        <NLayoutContent class="flex flex-col h-full">
            <!-- Navigation Header -->
            <NLayoutHeader bordered class="px-6 py-4 flex-shrink-0">
                <NSpace justify="space-between" align="center">
                    <NSpace align="center" :size="12">
                        <NAvatar round src="/logo-nobg.png" :size="40" />
                        <div>
                            <h1 class="text-xl font-bold">
                                Thủ Thư Mọt
                            </h1>
                        </div>
                    </NSpace>
                    
                    <NSpace align="center">
                        <NButton 
                            secondary 
                            @click="router.push('/')"
                        >
                            <template #icon>
                                <NIcon><i class="fa-solid fa-arrow-left"></i></NIcon>
                            </template>
                            Về trang chủ
                        </NButton>
                    </NSpace>
                </NSpace>
            </NLayoutHeader>

            <div class="flex-1 flex flex-col p-6 overflow-hidden">
                <!-- Chat Container -->
                <NCard 
                    class="h-full flex flex-col overflow-hidden"
                    :segmented="{ content: true, footer: 'soft' }"
                >
                    <!-- Chat History -->
                    <NScrollbar ref="chatHistoryRef" class="flex-1 overflow-y-auto">
                        <div class="p-6">
                            <!-- Welcome Message -->
                            <div v-if="history.length === 0" class="flex flex-col items-center justify-center py-16">
                                <img round src="/mot-noname.png" :size="80" class="w-32 h-32 rounded-full shadow mb-4 object-cover" />
                                <h2 class="text-2xl font-bold mb-2">
                                    Xin chào <span class="text-orange-500">{{ accountData?.TEN || '' }}</span>, tôi là Mọt
                                </h2>
                                <NText depth="3" class="text-center max-w-md mb-8">
                                    Tôi là trợ lý AI thông minh, sẵn sàng giúp bạn khám phá thế giới sách và thư viện RuryLib
                                </NText>

                                <!-- Suggested Questions -->
                                <div class="w-full max-w-3xl">
                                    <NText strong class="block mb-4">
                                        💡 Câu hỏi gợi ý
                                    </NText>
                                    <div class="grid grid-cols-2 gap-3">
                                        <NCard 
                                            v-for="(question, index) in suggestedQuestions" 
                                            :key="index"
                                            hoverable
                                            size="small"
                                            class="cursor-pointer"
                                            @click="sendRequest(question.text)"
                                        >
                                            <NSpace align="center" :size="8">
                                                <NIcon size="18">
                                                    <i :class="`fa-solid ${question.icon}`"></i>
                                                </NIcon>
                                                <NText class="text-sm flex-1">{{ question.text }}</NText>
                                            </NSpace>
                                        </NCard>
                                    </div>
                                </div>
                            </div>

                            <!-- Chat Messages -->
                            <div v-else class="space-y-4">
                                <div v-for="(chat, index) in history" :key="index" class="chat-turn" :class="{'user-turn': chat.isUser, 'ai-turn': !chat.isUser}">
                                    <NSpace :align="chat.isUser ? 'flex-end' : 'flex-start'" :justify="chat.isUser ? 'flex-end' : 'flex-start'" class="gap-3">
                                        <img 
                                            v-if="!chat.isUser"
                                            round
                                            src="/mot-noname.png" 
                                            :size="36" 
                                            class="flex-shrink-0 w-12 h-12 object-cover rounded-full shadow"
                                        />
                                        <div class="message-bubble" :class="{'user-message': chat.isUser, 'ai-message': !chat.isUser}">
                                            <NSpin v-if="loading && chat.message === '...'" size="small" />
                                            <div v-else-if="chat.isUser" class="text-sm">
                                                {{ chat.message }}
                                            </div>
                                            <div v-else class="markdown-body text-sm" v-html="markdownRender(chat.message)"></div>
                                        </div>
                                        <img 
                                            v-if="chat.isUser"
                                            round
                                            src="/users/default-avatar.svg" 
                                            :size="36" 
                                            class="flex-shrink-0 w-12 h-12 object-cover rounded-full shadow"
                                        />
                                    </NSpace>
                                </div>
                            </div>
                        </div>
                    </NScrollbar>

                    <!-- Input Area -->
                    <template #footer>
                        <div class="p-4 flex-shrink-0">
                            <NSpace vertical class="w-full">
                                <NInput 
                                    v-model:value="userRequest" 
                                    type="textarea" 
                                    :autosize="{ minRows: 2, maxRows: 4 }"
                                    placeholder="Hỏi Mọt bất cứ điều gì về sách..."
                                    :disabled="loading"
                                    @keyup.ctrl.enter="sendRequest()"
                                />
                                <NSpace justify="space-between" align="center">
                                    <NText depth="3" class="text-xs">
                                        Nhấn Ctrl + Enter để gửi
                                    </NText>
                                    <NButton 
                                        @click="sendRequest()" 
                                        type="primary" 
                                        :loading="loading" 
                                        :disabled="loading || !userRequest.trim()"
                                    >
                                        <template #icon>
                                            <NIcon v-if="!loading"><i class="fa-solid fa-paper-plane"></i></NIcon>
                                        </template>
                                        {{ loading ? 'Đang xử lý...' : 'Gửi' }}
                                    </NButton>
                                </NSpace>
                            </NSpace>
                        </div>
                    </template>
                </NCard>
            </div>
        </NLayoutContent>

        <!-- Sider - Settings -->
        <NLayoutSider
            bordered
            show-trigger
            collapse-mode="width"
            :collapsed-width="0"
            :width="320"
            :native-scrollbar="false"
        >
            <div class="p-6">
                <NSpace vertical>
                    <!-- Header -->
                    <div class="text-center mb-4">
                        <NIcon size="24" class="mb-2">
                            <i class="fa-solid fa-sliders"></i>
                        </NIcon>
                        <h2 class="text-xl font-bold">
                            Cài đặt
                        </h2>
                    </div>

                    <NDivider />

                    <!-- Data Toggles -->
                    <div>
                        <NText strong class="block mb-3">Nguồn dữ liệu</NText>
                        
                        <!-- Enable Books -->
                        <NCard size="small" class="mb-2">
                            <NSpace justify="space-between" align="center">
                                <NSpace align="center" :size="8">
                                    <NIcon size="18">
                                        <i class="fa-solid fa-book"></i>
                                    </NIcon>
                                    <div>
                                        <NText class="block text-sm">
                                            Dữ liệu sách
                                        </NText>
                                    </div>
                                </NSpace>
                                <NSwitch v-model:value="enableBooks" />
                            </NSpace>
                        </NCard>

                        <!-- Enable Borrow Data -->
                        <NCard size="small" class="mb-2">
                            <NSpace justify="space-between" align="center">
                                <NSpace align="center" :size="8">
                                    <NIcon size="18">
                                        <i class="fa-solid fa-user-clock"></i>
                                    </NIcon>
                                    <div>
                                        <NText class="block text-sm">
                                            Lịch sử mượn của tôi
                                        </NText>
                                    </div>
                                </NSpace>
                                <NSwitch v-model:value="enableBorrowData" />
                            </NSpace>
                        </NCard>

                        <!-- Enable Lab Borrows -->
                        <NCard size="small">
                            <NSpace justify="space-between" align="center">
                                <NSpace align="center" :size="8">
                                    <NIcon size="18">
                                        <i class="fa-solid fa-chart-bar"></i>
                                    </NIcon>
                                    <div>
                                        <NText class="block text-sm">
                                            Thống kê thư viện
                                        </NText>
                                    </div>
                                </NSpace>
                                <NSwitch v-model:value="enableLabBorrows" />
                            </NSpace>
                        </NCard>
                    </div>

                    <NDivider />

                    <!-- Chat Actions -->
                    <div>
                        <NButton 
                            @click="clearHistory" 
                            secondary 
                            block
                            type="error"
                            :disabled="history.length === 0"
                        >
                            <template #icon>
                                <NIcon><i class="fa-solid fa-trash-can"></i></NIcon>
                            </template>
                            Xóa lịch sử
                        </NButton>
                    </div>

                    <!-- Stats -->
                    <div class="text-center">
                        <NText depth="3" class="text-sm">
                            {{ history.length }} tin nhắn
                        </NText>
                    </div>
                </NSpace>
            </div>
        </NLayoutSider>
    </NLayout>
</template>

<style scoped>
/* Chat Styles */
.chat-turn {
    display: flex;
}

.user-turn {
    justify-content: flex-end;
}

.ai-turn {
    justify-content: flex-start;
}

.message-bubble {
    max-width: 70%;
    padding: 10px 14px;
    border-radius: 12px;
    word-break: break-word;
    line-height: 1.5;
}

.user-message {
    background-color: var(--n-color-target);
    color: white;
    border-bottom-right-radius: 4px;
}

.ai-message {
    background-color: var(--n-color);
    border-bottom-left-radius: 4px;
    border: 1px solid var(--n-border-color);
}

/* Markdown Content Styling */
.markdown-body {
    font-size: 0.875rem;
    line-height: 1.6;
}

.markdown-body :deep(p) {
    margin: 0.4em 0;
}

.markdown-body :deep(h3),
.markdown-body :deep(h4) {
    font-size: 1.1em;
    font-weight: 600;
    margin: 0.8em 0 0.4em 0;
    padding-bottom: 0.3em;
    border-bottom: 2px solid var(--n-border-color);
}

.markdown-body :deep(strong) {
    font-weight: 600;
}

.markdown-body :deep(blockquote) {
    border-left: 3px solid var(--n-border-color);
    padding: 0.5em 0 0.5em 1em;
    margin: 0.6em 0;
    opacity: 0.8;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
    margin: 0.5em 0;
    padding-left: 1.5em;
}

.markdown-body :deep(li) {
    margin: 0.2em 0;
}

.markdown-body :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    border: 1px solid var(--n-border-color);
    font-size: 0.875em;
}

.markdown-body :deep(th) {
    background-color: var(--n-color-target);
    color: white;
    padding: 8px 10px;
    text-align: left;
    font-weight: 600;
}

.markdown-body :deep(td) {
    padding: 8px 10px;
    border-bottom: 1px solid var(--n-border-color);
}

.markdown-body :deep(code) {
    background-color: var(--n-color-hover);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.875em;
}

.markdown-body :deep(a) {
    color: var(--n-color-target);
    text-decoration: underline;
}
</style>