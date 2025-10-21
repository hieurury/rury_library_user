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
    NAlert
}                       from    "naive-ui";
import {
    marked
}                       from    "marked";
import {
    ref,
    nextTick,
    watch
}                       from    "vue";
import AI               from '../hooks/useAI.js';

const message = useMessage();
const history = ref([]);
const userRequest = ref('');
const loading = ref(false);
const chatHistoryRef = ref(null);

const scrollToBottom = () => {
    nextTick(() => {
        const el = chatHistoryRef.value;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    });
};

watch(history, () => {
    scrollToBottom();
}, { deep: true });

const markdownRender = (value) => {
    if (!value) return '';
    return marked(value);
}

const sendRequest = async() => {
    if (!userRequest.value.trim() || loading.value) return;

    const currentRequest = userRequest.value;
    history.value.push({ 
        isUser: true,
        message: currentRequest 
    });
    userRequest.value = '';
    loading.value = true;
    scrollToBottom();
    
    // Add a placeholder for AI response
    const aiMessageIndex = history.value.length;
    history.value.push({
        isUser: false,
        message: '...'
    });
    scrollToBottom();

    try {
        const response = await AI.generate({message: currentRequest, has_books: true, borrow_data: true, lab_borrows: true});
        if(response) {
            console.log(response);
            history.value[aiMessageIndex].message = response;
        } else {
            message.error("Không nhận được phản hồi từ AI.");
            history.value[aiMessageIndex].message = "Xin lỗi, đã có lỗi xảy ra.";
        }
    } catch (error) {
        message.error("Lỗi khi kết nối đến AI.");
        history.value[aiMessageIndex].message = "Xin lỗi, đã có lỗi xảy ra.";
        console.error(error);
    } finally {
        loading.value = false;
        scrollToBottom();
    }
}
</script>


<template>
    <div class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 md:px-8">
        <NSpace vertical justify="center" align="center" class=" mx-auto">
            <!-- Header -->
            <div class="text-center mb-6">
                <h1 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                    Thủ Thư AI
                </h1>
                <p class="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    Hỏi đáp về sách và tìm kiếm các tác phẩm yêu thích
                </p>
            </div>

            <!-- Chat Container -->
            <NCard class="w-full shadow-lg" :segmented="{ content: true, footer: 'soft' }">
                <!-- Chat History -->
                <div ref="chatHistoryRef" class="chat-history max-h-[500px] overflow-y-auto p-4 bg-white dark:bg-gray-800">
                    <div v-if="history.length === 0" class="flex flex-col items-center justify-center h-56">
                        <NAvatar round src="/logo.png" :size="70" class="mb-3" />
                        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
                            Xin chào, tôi là Thủ Thư AI
                        </h2>
                        <p class="text-sm text-gray-600 dark:text-gray-400 text-center max-w-xs">
                            Hỏi tôi về sách, tác giả hoặc thư viện
                        </p>
                    </div>

                    <div v-else class="space-y-3">
                        <div v-for="(chat, index) in history" :key="index" class="chat-turn" :class="{'user-turn': chat.isUser, 'ai-turn': !chat.isUser}">
                            <NSpace :align="chat.isUser ? 'flex-end' : 'flex-start'" :justify="chat.isUser ? 'flex-end' : 'flex-start'" class="gap-2">
                                <NAvatar 
                                    v-if="!chat.isUser"
                                    round
                                    src="/logo.png" 
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

                <!-- Input Area -->
                <template #footer>
                    <NSpace vertical class="w-full gap-2">
                        <NInput 
                            v-model:value="userRequest" 
                            type="textarea" 
                            :autosize="{ minRows: 2, maxRows: 3 }"
                            placeholder="Hỏi tôi bất cứ điều gì về sách..."
                            :disabled="loading"
                            @keyup.enter.prevent="sendRequest"
                            class="bg-white dark:bg-gray-700"
                        />
                        <NButton 
                            @click="sendRequest" 
                            type="primary" 
                            block 
                            :loading="loading" 
                            :disabled="loading || !userRequest.trim()"
                            size="small"
                        >
                            <NIcon v-if="!loading"><i class="fa-solid fa-paper-plane"></i></NIcon>
                            {{ loading ? 'Xử lý...' : 'Gửi' }}
                        </NButton>
                    </NSpace>
                </template>
            </NCard>

            <!-- Info Alert -->
            <NAlert type="info" closable class="w-full text-sm text-gray-700 dark:text-gray-300">
                <template #icon>
                    <NIcon><i class="fa-solid fa-circle-info"></i></NIcon>
                </template>
                💡 Hỏi tôi về thể loại sách, tác giả hoặc những sách bạn tìm kiếm!
            </NAlert>
        </NSpace>
    </div>
</template>


<style scoped>
/* Chat History Scrollbar */
.chat-history {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.chat-history::-webkit-scrollbar {
    width: 6px;
}

.chat-history::-webkit-scrollbar-track {
    background: transparent;
}

.chat-history::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
}

.chat-history::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.7);
}

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

.markdown-body :deep(p:first-child) {
    margin-top: 0;
}

.markdown-body :deep(p:last-child) {
    margin-bottom: 0;
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

.markdown-body :deep(li) {
    margin: 0.2em 0;
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

.markdown-body :deep(tr:last-child td) {
    border-bottom: none;
}

.markdown-body :deep(tr:nth-child(even)) {
    background-color: #f9fafb;
}

:global(.dark) .markdown-body :deep(tr:nth-child(even)) {
    background-color: #374151;
}

.markdown-body :deep(a) {
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.markdown-body :deep(a:hover) {
    color: #1d4ed8;
    text-decoration: underline;
}

:global(.dark) .markdown-body :deep(a) {
    color: #60a5fa;
}

:global(.dark) .markdown-body :deep(a:hover) {
    color: #93c5fd;
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

.markdown-body :deep(pre) {
    background-color: #1f2937;
    color: #f3f4f6;
    padding: 0.8em;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0.8em 0;
    font-size: 0.85em;
}

.markdown-body :deep(pre code) {
    background-color: transparent;
    padding: 0;
    color: inherit;
}
</style>