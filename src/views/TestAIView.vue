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
    NText,
    NTag,
    NScrollbar
} from "naive-ui";
import { marked } from "marked";
import { ref, nextTick, watch, onMounted } from "vue";
import AI from '../hooks/useAI.js';

const message = useMessage();
const history = ref([]);
const userRequest = ref('');
const loading = ref(false);
const chatHistoryRef = ref(null);

// AI Configuration toggles
const enableBooks = ref(false);
const enableBorrowData = ref(false);
const enableLabBorrows = ref(false);

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
    <NLayout has-sider class="min-h-screen">
        <!-- Content - Chat Area -->
        <NLayoutContent class="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
            <div class="h-full flex flex-col p-6 ">

                <!-- Chat Container -->
                <NCard class="flex-1 shadow-lg flex flex-col" :segmented="{ content: true, footer: 'soft' }">
                    <!-- Chat History -->
                    <NScrollbar ref="chatHistoryRef" class="flex-1">
                        <div class="p-4 bg-white dark:bg-gray-800 min-h-[50%]">
                            <!-- Welcome Message -->
                            <div v-if="history.length === 0" class="flex flex-col items-center justify-center py-12">
                                <NAvatar round src="/AI-logo.png" :size="70" class="mb-3" />
                                <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
                                    Xin chào, tôi là Mọt
                                </h2>
                                <p class="text-sm text-gray-600 dark:text-gray-400 text-center max-w-xs mb-6">
                                    Hỏi tôi về sách, tác giả hoặc thư viện RuryLib
                                </p>

                                <!-- Suggested Questions Grid -->
                                <div class="w-full max-w-2xl">
                                    <NText class="block mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        💡 Một số câu hỏi gợi ý:
                                    </NText>
                                    <div class="grid grid-cols-2 gap-3">
                                        <NCard 
                                            v-for="(question, index) in suggestedQuestions" 
                                            :key="index"
                                            hoverable
                                            size="small"
                                            class="cursor-pointer hover:shadow-md transition-shadow"
                                            @click="sendRequest(question.text)"
                                        >
                                            <NSpace align="center" :size="8">
                                                <NIcon :color="question.category === 'info' ? '#3b82f6' : question.category === 'books' ? '#10b981' : question.category === 'stats' ? '#f59e0b' : '#8b5cf6'">
                                                    <i :class="`fa-solid ${question.icon}`"></i>
                                                </NIcon>
                                                <NText class="text-sm">{{ question.text }}</NText>
                                            </NSpace>
                                        </NCard>
                                    </div>
                                </div>
                            </div>

                            <!-- Chat Messages -->
                            <div v-else class="space-y-3">
                                <div v-for="(chat, index) in history" :key="index" class="chat-turn" :class="{'user-turn': chat.isUser, 'ai-turn': !chat.isUser}">
                                    <NSpace :align="chat.isUser ? 'flex-end' : 'flex-start'" :justify="chat.isUser ? 'flex-end' : 'flex-start'" class="gap-2">
                                        <NAvatar 
                                            v-if="!chat.isUser"
                                            round
                                            src="/AI-logo.png" 
                                            :size="36" 
                                            class="flex-shrink-0"
                                        />
                                        <div class="message-bubble" :class="{'user-message': chat.isUser, 'ai-message': !chat.isUser}">
                                            <NSpin v-if="loading && chat.message === '...'" size="small" />
                                            <div v-else-if="chat.isUser" class="text-white text-sm">
                                                {{ chat.message }}
                                            </div>
                                            <div v-else class="markdown-body text-sm" v-html="markdownRender(chat.message)"></div>
                                        </div>
                                        <NAvatar 
                                            v-if="chat.isUser"
                                            round
                                            src="/users/default-avatar.svg" 
                                            :size="36" 
                                            class="flex-shrink-0"
                                        />
                                    </NSpace>
                                </div>
                            </div>
                        </div>
                    </NScrollbar>

                    <!-- Input Area -->
                    <template #footer>
                        <NSpace vertical class="w-full gap-2">
                            <NInput 
                                v-model:value="userRequest" 
                                type="textarea" 
                                :autosize="{ minRows: 2, maxRows: 3 }"
                                placeholder="Hỏi Mọt bất cứ điều gì về sách..."
                                :disabled="loading"
                                @keyup.ctrl.enter="sendRequest()"
                                class="bg-white dark:bg-gray-700"
                            />
                            <NButton 
                                @click="sendRequest()" 
                                type="primary" 
                                block 
                                :loading="loading" 
                                :disabled="loading || !userRequest.trim()"
                            >
                                <template #icon>
                                    <NIcon v-if="!loading"><i class="fa-solid fa-paper-plane"></i></NIcon>
                                </template>
                                {{ loading ? 'Đang xử lý...' : 'Gửi (Ctrl + Enter)' }}
                            </NButton>
                        </NSpace>
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
            class="bg-white dark:bg-gray-800"
        >
            <div class="p-6">
                <NSpace vertical size="large">
                    <!-- Header -->
                    <div>
                        <h2 class="text-xl font-bold mb-1">Cài đặt</h2>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            Bật/tắt nguồn dữ liệu để tối ưu phản hồi
                        </p>
                    </div>

                    <NDivider class="!my-2" />

                    <!-- Data Toggles -->
                    <div>
                        <NText class="block mb-3 font-semibold text-sm">Nguồn dữ liệu</NText>
                        
                        <!-- Enable Books -->
                        <NCard size="small" class="mb-3">
                            <NSpace justify="space-between" align="center">
                                <div>
                                    <NText class="block font-medium text-sm mb-1">
                                        <NIcon class="mr-1"><i class="fa-solid fa-book"></i></NIcon>
                                        Dữ liệu sách
                                    </NText>
                                    <NText depth="3" class="text-xs">
                                        Danh sách tất cả sách trong thư viện
                                    </NText>
                                </div>
                                <NSwitch v-model:value="enableBooks" />
                            </NSpace>
                        </NCard>

                        <!-- Enable Borrow Data -->
                        <NCard size="small" class="mb-3">
                            <NSpace justify="space-between" align="center">
                                <div>
                                    <NText class="block font-medium text-sm mb-1">
                                        <NIcon class="mr-1"><i class="fa-solid fa-user-clock"></i></NIcon>
                                        Lịch sử mượn của tôi
                                    </NText>
                                    <NText depth="3" class="text-xs">
                                        Thông tin sách bạn đang mượn
                                    </NText>
                                </div>
                                <NSwitch v-model:value="enableBorrowData" />
                            </NSpace>
                        </NCard>

                        <!-- Enable Lab Borrows -->
                        <NCard size="small">
                            <NSpace justify="space-between" align="center">
                                <div>
                                    <NText class="block font-medium text-sm mb-1">
                                        <NIcon class="mr-1"><i class="fa-solid fa-chart-bar"></i></NIcon>
                                        Thống kê thư viện
                                    </NText>
                                    <NText depth="3" class="text-xs">
                                        Dữ liệu mượn trả toàn thư viện
                                    </NText>
                                </div>
                                <NSwitch v-model:value="enableLabBorrows" />
                            </NSpace>
                        </NCard>
                    </div>

                    <NDivider class="!my-2" />

                    <!-- Info -->
                    <div>
                        <NText class="block mb-2 font-semibold text-sm">Lưu ý</NText>
                        <NCard size="small" class="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <NText class="text-xs text-gray-600 dark:text-gray-400">
                                <NIcon class="mr-1" color="#3b82f6"><i class="fa-solid fa-lightbulb"></i></NIcon>
                                Bật nhiều nguồn dữ liệu sẽ giúp Mọt trả lời chính xác hơn nhưng có thể làm tăng thời gian phản hồi.
                            </NText>
                        </NCard>
                    </div>

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
                                <NIcon><i class="fa-solid fa-trash"></i></NIcon>
                            </template>
                            Xóa lịch sử chat
                        </NButton>
                    </div>

                    <!-- Stats -->
                    <div class="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <NTag size="small" :bordered="false">
                            <NIcon class="mr-1"><i class="fa-solid fa-message"></i></NIcon>
                            {{ history.length }} tin nhắn
                        </NTag>
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
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.user-turn {
    justify-content: flex-end;
}

.ai-turn {
    justify-content: flex-start;
}

.message-bubble {
    max-width: 75%;
    padding: 10px 15px;
    border-radius: 18px;
    word-break: break-word;
    line-height: 1.4;
}

.user-message {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border-bottom-right-radius: 6px;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.ai-message {
    background-color: #f3f4f6;
    color: #1f2937;
    border-bottom-left-radius: 6px;
}

:global(.dark) .ai-message {
    background-color: #374151;
    color: #f3f4f6;
}

/* Markdown Content Styling */
.markdown-body {
    font-size: 0.9rem;
    line-height: 1.5;
}

.markdown-body :deep(p) {
    margin: 0.3em 0;
    line-height: 1.5;
}

.markdown-body :deep(h3) {
    font-size: 1.2em;
    font-weight: 600;
    margin: 0.8em 0 0.4em 0;
    padding-bottom: 0.2em;
    border-bottom: 2px solid #e5e7eb;
}

:global(.dark) .markdown-body :deep(h3) {
    border-bottom-color: #4b5563;
}

.markdown-body :deep(strong) {
    font-weight: 600;
    color: #1f2937;
}

:global(.dark) .markdown-body :deep(strong) {
    color: #f3f4f6;
}

.markdown-body :deep(blockquote) {
    border-left: 4px solid #3b82f6;
    padding: 0.4em 0 0.4em 0.8em;
    margin: 0.6em 0;
    background-color: #eff6ff;
    border-radius: 0 4px 4px 0;
    color: #1e40af;
}

:global(.dark) .markdown-body :deep(blockquote) {
    background-color: rgba(59, 130, 246, 0.1);
    color: #93c5fd;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
    margin: 0.4em 0;
    padding-left: 1.5em;
}

.markdown-body :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 0.8em 0;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
    font-size: 0.9em;
}

:global(.dark) .markdown-body :deep(table) {
    border-color: #4b5563;
}

.markdown-body :deep(th) {
    background-color: #f3f4f6;
    padding: 8px 10px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
}

:global(.dark) .markdown-body :deep(th) {
    background-color: #4b5563;
    border-bottom-color: #6b7280;
}

.markdown-body :deep(td) {
    padding: 8px 10px;
    border-bottom: 1px solid #e5e7eb;
}

:global(.dark) .markdown-body :deep(td) {
    border-bottom-color: #6b7280;
}

.markdown-body :deep(code) {
    background-color: #f3f4f6;
    padding: 0.15em 0.35em;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.85em;
}

:global(.dark) .markdown-body :deep(code) {
    background-color: #374151;
    color: #f3f4f6;
}
</style>