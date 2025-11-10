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
import AI from '../hooks/useAI.js';

const router = useRouter();

const message = useMessage();
const history = ref([]);
const userRequest = ref('');
const loading = ref(false);
const chatHistoryRef = ref(null);

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
        <NLayoutContent class="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
            <!-- Navigation Header -->
            <NLayoutHeader class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10 shadow-sm">
                <NSpace justify="space-between" align="center">
                    <NSpace align="center" :size="12">
                        <NAvatar round src="/AI-logo.png" :size="40" class="shadow-md" />
                        <div>
                            <h1 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Thủ Thư Mọt
                            </h1>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Trợ lý AI thông minh của thư viện</p>
                        </div>
                    </NSpace>
                    
                    <NSpace align="center">
                        <NBreadcrumb>
                            <NBreadcrumbItem @click="router.push('/')">
                                <NIcon class="mr-1"><i class="fa-solid fa-home"></i></NIcon>
                                Trang chủ
                            </NBreadcrumbItem>
                            <NBreadcrumbItem>
                                <NIcon class="mr-1"><i class="fa-solid fa-robot"></i></NIcon>
                                Trợ lý AI
                            </NBreadcrumbItem>
                        </NBreadcrumb>
                        
                        <NButton 
                            strong 
                            secondary 
                            @click="router.push('/')"
                            class="ml-4"
                        >
                            <template #icon>
                                <NIcon><i class="fa-solid fa-arrow-left"></i></NIcon>
                            </template>
                            Về trang chủ
                        </NButton>
                    </NSpace>
                </NSpace>
            </NLayoutHeader>

            <div class="h-full flex flex-col p-6 pt-4">
                <!-- Chat Container with modern design -->
                <NCard 
                    class="flex-1 shadow-2xl flex flex-col border-2 border-indigo-100 dark:border-indigo-900/50 overflow-hidden"
                    :segmented="{ content: true, footer: 'soft' }"
                >
                    <!-- Chat History -->
                    <NScrollbar ref="chatHistoryRef" class="flex-1">
                        <div class="p-6 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 min-h-[50%]">
                            <!-- Welcome Message with enhanced design -->
                            <div v-if="history.length === 0" class="flex flex-col items-center justify-center py-16">
                                <div class="relative mb-6">
                                    <div class="absolute inset-0 animate-ping bg-indigo-400 rounded-full opacity-20"></div>
                                    <NAvatar round src="/AI-logo.png" :size="90" class="relative shadow-2xl ring-4 ring-indigo-200 dark:ring-indigo-800" />
                                </div>
                                <h2 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                                    Xin chào, tôi là Mọt 👋
                                </h2>
                                <p class="text-base text-gray-600 dark:text-gray-400 text-center max-w-md mb-8 leading-relaxed">
                                    Tôi là trợ lý AI thông minh, sẵn sàng giúp bạn khám phá thế giới sách, tác giả và thư viện RuryLib
                                </p>

                                <!-- Suggested Questions Grid with modern cards -->
                                <div class="w-full max-w-3xl">
                                    <div class="flex items-center gap-2 mb-4">
                                        <div class="h-1 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                                        <NText class="text-base font-bold text-gray-700 dark:text-gray-300">
                                            💡 Câu hỏi gợi ý
                                        </NText>
                                        <div class="h-1 flex-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <NCard 
                                            v-for="(question, index) in suggestedQuestions" 
                                            :key="index"
                                            hoverable
                                            class="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
                                            @click="sendRequest(question.text)"
                                        >
                                            <NSpace align="center" :size="10">
                                                <div 
                                                    class="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                                                    :style="{
                                                        background: question.category === 'info' 
                                                            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                                            : question.category === 'books'
                                                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                                            : question.category === 'stats'
                                                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                                            : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                                                    }"
                                                >
                                                    <NIcon color="white" size="18">
                                                        <i :class="`fa-solid ${question.icon}`"></i>
                                                    </NIcon>
                                                </div>
                                                <NText class="text-sm font-medium flex-1">{{ question.text }}</NText>
                                                <NIcon size="16" color="#9ca3af">
                                                    <i class="fa-solid fa-chevron-right"></i>
                                                </NIcon>
                                            </NSpace>
                                        </NCard>
                                    </div>
                                </div>
                            </div>

                            <!-- Chat Messages with enhanced styling -->
                            <div v-else class="space-y-4">
                                <div v-for="(chat, index) in history" :key="index" class="chat-turn" :class="{'user-turn': chat.isUser, 'ai-turn': !chat.isUser}">
                                    <NSpace :align="chat.isUser ? 'flex-end' : 'flex-start'" :justify="chat.isUser ? 'flex-end' : 'flex-start'" class="gap-3">
                                        <NAvatar 
                                            v-if="!chat.isUser"
                                            round
                                            src="/AI-logo.png" 
                                            :size="40" 
                                            class="flex-shrink-0 shadow-lg ring-2 ring-indigo-200 dark:ring-indigo-800"
                                        />
                                        <div class="message-bubble" :class="{'user-message': chat.isUser, 'ai-message': !chat.isUser}">
                                            <NSpin v-if="loading && chat.message === '...'" size="small" />
                                            <div v-else-if="chat.isUser" class="text-white text-sm leading-relaxed">
                                                {{ chat.message }}
                                            </div>
                                            <div v-else class="markdown-body text-sm" v-html="markdownRender(chat.message)"></div>
                                        </div>
                                        <NAvatar 
                                            v-if="chat.isUser"
                                            round
                                            src="/users/default-avatar.svg" 
                                            :size="40" 
                                            class="flex-shrink-0 shadow-lg ring-2 ring-purple-200 dark:ring-purple-800"
                                        />
                                    </NSpace>
                                </div>
                            </div>
                        </div>
                    </NScrollbar>

                    <!-- Input Area with enhanced design -->
                    <template #footer>
                        <div class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-4 border-t-2 border-indigo-100 dark:border-indigo-900">
                            <NSpace vertical class="w-full gap-3">
                                <NInput 
                                    v-model:value="userRequest" 
                                    type="textarea" 
                                    :autosize="{ minRows: 2, maxRows: 4 }"
                                    placeholder="✨ Hỏi Mọt bất cứ điều gì về sách, tác giả, văn học..."
                                    :disabled="loading"
                                    @keyup.ctrl.enter="sendRequest()"
                                    class="bg-white dark:bg-gray-700 shadow-inner border-2 border-indigo-100 dark:border-indigo-900 focus:border-indigo-300 dark:focus:border-indigo-700 rounded-xl"
                                    size="large"
                                />
                                <NSpace justify="space-between" align="center">
                                    <NText depth="3" class="text-xs">
                                        <NIcon class="mr-1"><i class="fa-solid fa-keyboard"></i></NIcon>
                                        Nhấn <kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Ctrl + Enter</kbd> để gửi
                                    </NText>
                                    <NButton 
                                        @click="sendRequest()" 
                                        type="primary" 
                                        :loading="loading" 
                                        :disabled="loading || !userRequest.trim()"
                                        size="large"
                                        class="shadow-lg"
                                        strong
                                    >
                                        <template #icon>
                                            <NIcon v-if="!loading"><i class="fa-solid fa-paper-plane"></i></NIcon>
                                        </template>
                                        {{ loading ? 'Đang xử lý...' : 'Gửi tin nhắn' }}
                                    </NButton>
                                </NSpace>
                            </NSpace>
                        </div>
                    </template>
                </NCard>
            </div>
        </NLayoutContent>

        <!-- Sider - Settings with modern design -->
        <NLayoutSider
            bordered
            show-trigger
            collapse-mode="width"
            :collapsed-width="0"
            :width="340"
            :native-scrollbar="false"
            class="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-l-2 border-indigo-100 dark:border-indigo-900"
        >
            <div class="p-6">
                <NSpace vertical size="large">
                    <!-- Header with gradient -->
                    <div class="text-center">
                        <div class="inline-block p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-3 shadow-lg">
                            <NIcon size="28" color="white">
                                <i class="fa-solid fa-sliders"></i>
                            </NIcon>
                        </div>
                        <h2 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                            Cài đặt
                        </h2>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            Tùy chỉnh nguồn dữ liệu AI
                        </p>
                    </div>

                    <NDivider class="!my-2">
                        <NIcon size="16"><i class="fa-solid fa-database"></i></NIcon>
                    </NDivider>

                    <!-- Data Toggles with enhanced cards -->
                    <div>
                        <div class="flex items-center gap-2 mb-4">
                            <div class="h-1 w-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                            <NText class="font-bold text-sm">Nguồn dữ liệu</NText>
                        </div>
                        
                        <!-- Enable Books -->
                        <NCard 
                            size="small" 
                            class="mb-3 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                            :class="{ 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20': enableBooks }"
                        >
                            <NSpace justify="space-between" align="center">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-md">
                                        <NIcon color="white" size="20">
                                            <i class="fa-solid fa-book"></i>
                                        </NIcon>
                                    </div>
                                    <div>
                                        <NText class="block font-semibold text-sm mb-0.5">
                                            Dữ liệu sách
                                        </NText>
                                        <NText depth="3" class="text-xs">
                                            Toàn bộ sách trong thư viện
                                        </NText>
                                    </div>
                                </div>
                                <NSwitch v-model:value="enableBooks" size="large" />
                            </NSpace>
                        </NCard>

                        <!-- Enable Borrow Data -->
                        <NCard 
                            size="small" 
                            class="mb-3 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                            :class="{ 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20': enableBorrowData }"
                        >
                            <NSpace justify="space-between" align="center">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-md">
                                        <NIcon color="white" size="20">
                                            <i class="fa-solid fa-user-clock"></i>
                                        </NIcon>
                                    </div>
                                    <div>
                                        <NText class="block font-semibold text-sm mb-0.5">
                                            Lịch sử mượn của tôi
                                        </NText>
                                        <NText depth="3" class="text-xs">
                                            Sách bạn đang mượn
                                        </NText>
                                    </div>
                                </div>
                                <NSwitch v-model:value="enableBorrowData" size="large" />
                            </NSpace>
                        </NCard>

                        <!-- Enable Lab Borrows -->
                        <NCard 
                            size="small"
                            class="hover:shadow-lg transition-shadow border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                            :class="{ 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20': enableLabBorrows }"
                        >
                            <NSpace justify="space-between" align="center">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-md">
                                        <NIcon color="white" size="20">
                                            <i class="fa-solid fa-chart-bar"></i>
                                        </NIcon>
                                    </div>
                                    <div>
                                        <NText class="block font-semibold text-sm mb-0.5">
                                            Thống kê thư viện
                                        </NText>
                                        <NText depth="3" class="text-xs">
                                            Dữ liệu mượn trả toàn hệ thống
                                        </NText>
                                    </div>
                                </div>
                                <NSwitch v-model:value="enableLabBorrows" size="large" />
                            </NSpace>
                        </NCard>
                    </div>

                    <NDivider class="!my-2">
                        <NIcon size="16"><i class="fa-solid fa-info-circle"></i></NIcon>
                    </NDivider>

                    <!-- Info Card -->
                    <NCard 
                        size="small" 
                        class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 shadow-md"
                    >
                        <NSpace vertical :size="8">
                            <div class="flex items-start gap-2">
                                <NIcon size="20" color="#3b82f6">
                                    <i class="fa-solid fa-lightbulb"></i>
                                </NIcon>
                                <div>
                                    <NText class="text-xs font-semibold text-blue-900 dark:text-blue-200 block mb-1">
                                        💡 Mẹo sử dụng
                                    </NText>
                                    <NText class="text-xs text-gray-600 dark:text-gray-400">
                                        Bật nhiều nguồn dữ liệu giúp Mọt trả lời chính xác hơn nhưng có thể tăng thời gian phản hồi.
                                    </NText>
                                </div>
                            </div>
                        </NSpace>
                    </NCard>

                    <!-- Chat Actions -->
                    <div>
                        <NButton 
                            @click="clearHistory" 
                            secondary 
                            block
                            type="error"
                            :disabled="history.length === 0"
                            size="large"
                            strong
                            class="shadow-md"
                        >
                            <template #icon>
                                <NIcon><i class="fa-solid fa-trash-can"></i></NIcon>
                            </template>
                            Xóa lịch sử chat
                        </NButton>
                    </div>

                    <!-- Stats with enhanced design -->
                    <div class="text-center pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                        <NTag 
                            :bordered="false" 
                            size="large"
                            class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                        >
                            <NIcon class="mr-2" size="16">
                                <i class="fa-solid fa-messages"></i>
                            </NIcon>
                            <strong>{{ history.length }}</strong> tin nhắn
                        </NTag>
                    </div>
                </NSpace>
            </div>
        </NLayoutSider>
    </NLayout>
</template>

<style scoped>
/* Chat Styles with enhanced animations */
.chat-turn {
    display: flex;
    animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(15px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
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
    padding: 12px 18px;
    border-radius: 20px;
    word-break: break-word;
    line-height: 1.5;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.message-bubble:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

.user-message {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
    color: white;
    border-bottom-right-radius: 8px;
}

.ai-message {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    color: #1e293b;
    border-bottom-left-radius: 8px;
    border: 1px solid #e2e8f0;
}

:global(.dark) .ai-message {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    color: #f1f5f9;
    border-color: #475569;
}

/* Breadcrumb cursor */
.n-breadcrumb-item {
    cursor: pointer;
}

/* Markdown Content Styling - Enhanced */
.markdown-body {
    font-size: 0.9rem;
    line-height: 1.6;
}

.markdown-body :deep(p) {
    margin: 0.4em 0;
    line-height: 1.6;
}

.markdown-body :deep(h3),
.markdown-body :deep(h4) {
    font-size: 1.25em;
    font-weight: 700;
    margin: 1em 0 0.5em 0;
    padding-bottom: 0.3em;
    border-bottom: 3px solid #6366f1;
    color: #4338ca;
    background: linear-gradient(90deg, #6366f1 0%, transparent 100%);
    background-size: 100% 3px;
    background-position: 0 100%;
    background-repeat: no-repeat;
}

:global(.dark) .markdown-body :deep(h3),
:global(.dark) .markdown-body :deep(h4) {
    color: #a5b4fc;
    border-bottom-color: #818cf8;
}

.markdown-body :deep(strong) {
    font-weight: 700;
    color: #4338ca;
    text-shadow: 0 0 1px rgba(67, 56, 202, 0.1);
}

:global(.dark) .markdown-body :deep(strong) {
    color: #c7d2fe;
}

.markdown-body :deep(blockquote) {
    border-left: 4px solid #6366f1;
    padding: 0.6em 0 0.6em 1em;
    margin: 0.8em 0;
    background: linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%);
    border-radius: 0 8px 8px 0;
    color: #4338ca;
    font-style: italic;
}

:global(.dark) .markdown-body :deep(blockquote) {
    background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%);
    color: #a5b4fc;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
    margin: 0.5em 0;
    padding-left: 1.8em;
}

.markdown-body :deep(li) {
    margin: 0.3em 0;
    padding-left: 0.3em;
}

.markdown-body :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    border: 2px solid #e0e7ff;
    border-radius: 8px;
    overflow: hidden;
    font-size: 0.9em;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

:global(.dark) .markdown-body :deep(table) {
    border-color: #4c1d95;
}

.markdown-body :deep(th) {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    padding: 10px 12px;
    text-align: left;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.85em;
    letter-spacing: 0.5px;
}

.markdown-body :deep(td) {
    padding: 10px 12px;
    border-bottom: 1px solid #e0e7ff;
}

:global(.dark) .markdown-body :deep(td) {
    border-bottom-color: #4c1d95;
}

.markdown-body :deep(tr:nth-child(even)) {
    background-color: #f8fafc;
}

:global(.dark) .markdown-body :deep(tr:nth-child(even)) {
    background-color: #2d1b69;
}

.markdown-body :deep(tr:hover) {
    background-color: #eff6ff;
}

:global(.dark) .markdown-body :deep(tr:hover) {
    background-color: #3730a3;
}

.markdown-body :deep(code) {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.85em;
    color: #4338ca;
    border: 1px solid #c7d2fe;
}

:global(.dark) .markdown-body :deep(code) {
    background: linear-gradient(135deg, #312e81 0%, #4338ca 100%);
    color: #c7d2fe;
    border-color: #6366f1;
}

.markdown-body :deep(a) {
    color: #4f46e5;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;
}

.markdown-body :deep(a:hover) {
    color: #6366f1;
    border-bottom-color: #6366f1;
}

:global(.dark) .markdown-body :deep(a) {
    color: #818cf8;
}

:global(.dark) .markdown-body :deep(a:hover) {
    color: #a5b4fc;
    border-bottom-color: #a5b4fc;
}
</style>