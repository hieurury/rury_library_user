<script setup>
import {
    NLayout,
    NLayoutHeader,
    NLayoutContent,
    NLayoutFooter,
    NLayoutSider,
    NGrid,
    NGi,
    NThing,
    NSpace,
    NAvatar,
    NImage,
    NTag,
    NP,
    NDivider,
    NCard,
    NQrCode,
    NDataTable,
    NButton,
    NIcon,
    NScrollbar,
    NResult,
}                               from    'naive-ui';
import {
    getAccountData
}                               from    '../../hooks/useAccount';
import {
    getBorrowWithUserId,
    getBorrowInfo
}                               from    '../../services/apiBorrow';
import {
    getUserInfo
}                               from    '../../services/apiUser'; 
import {
    ref,
    onMounted,
    computed,
    h
}                               from    'vue';
import {
    useRouter
}                               from    'vue-router'
import AI                    from    '../../hooks/useAI';
import BookMarkControll         from    '../../components/BookMarkControll.vue';
import { marked }               from    'marked';
import axios from 'axios';
import ProfileSidebar from '../../components/ProfileSidebar.vue';

// ==================== GLOBAL VARIABLES =======================//
const API_BASE                  =       import.meta.env.VITE_API_BASE;
const router                    =       useRouter();
const AI_RESPONSE = ref('');
const markdownRender = (value) => {
    if (!value) return '';
    return marked(value);
}



const userInfo                  =       ref(null);

onMounted(async () => {
    const userData = getAccountData();
    if(!userData) {
        router.push('/auth/login');
        return;
    }
    
    try {
        // Lấy thông tin user
        const rs = await getUserInfo(userData.MADOCGIA);
        userInfo.value = rs.data;

        // Lấy tất cả thông tin mượn trả của user
        const borrowsRes = await getBorrowWithUserId(userData.MADOCGIA);
        console.log(borrowsRes);
        allBorrows.value = borrowsRes.data || [];

        // Lấy chi tiết từng sách mượn - sử dụng Promise.all để chờ tất cả
        const details = [];
        if (allBorrows.value.length > 0) {
            const detailPromises = allBorrows.value.map(async (borrow, index) => {
                try {
                    const detail = await getBorrowInfo(borrow.MAPHIEU);
                    // Chỉ lấy sách đang mượn (chưa trả)
                    if(detail.data.TINHTRANG === 'borrowing') {
                        const borrowDate = new Date(detail.data.NGAYMUON);
                        const returnDate = new Date(detail.data.NGAYHANTRA);
                        const today = new Date();
                        
                        // Reset time để so sánh chỉ theo ngày
                        today.setHours(0, 0, 0, 0);
                        returnDate.setHours(0, 0, 0, 0);
                        
                        // Tính số ngày còn lại
                        const daysRemaining = Math.ceil((returnDate - today) / (1000 * 60 * 60 * 24));
                        const isOverdue = daysRemaining < 0;
                        
                        return {
                            no: index + 1,
                            title: detail.data.SACH.TENSACH,
                            borrowedTime: borrowDate.toLocaleDateString('vi-VN'),
                            returnDate: returnDate.toLocaleDateString('vi-VN'),
                            daysRemaining: daysRemaining,
                            isOverdue: isOverdue,
                        };
                    } else {
                        return null;
                    }
                } catch (error) {
                    return null;
                }
            });
            
            const resolvedDetails = await Promise.all(detailPromises);
            // Lọc bỏ null và đánh số thứ tự lại
            const filtered = resolvedDetails.filter(d => d !== null);
            allBorrowsDetail.value = filtered.map((item, idx) => ({
                ...item,
                no: idx + 1
            }));
        }

        // Nhận phản hồi mượn trả từ AI với prompt được tối ưu
        AI_RESPONSE.value = await AI.generate({
            message: `Phân tích thông tin mượn sách của tôi và trả về theo định dạng sau:

**TỔNG QUAN**
- Số sách đang mượn: [số lượng]
- Tình trạng: [OK/Cần chú ý/Cảnh báo]

**SẮP ĐẾN HẠN**
[Liệt kê dạng bảng: Tên sách | Ngày trả | Còn lại]

**QUÁ HẠN**
[Liệt kê dạng bảng hoặc thông báo "Không có sách quá hạn"]

**LỜI KHUYÊN**
[1-2 câu ngắn gọn về việc trả sách]

**YÊU CẦU:**
- Chỉ trả về thông tin quan trọng
- Dùng emoji và markdown để dễ nhìn
- Không thêm lời chào hay giải thích dài dòng
- Thông tin phải chính xác 100%`,
            borrow_data: true,
            short_response: true
        });
    } catch (error) {
        // Silent error handling
    }
})


//==========> Liên quan đến dữ liệu mượn
const allBorrows = ref([])
const allBorrowsDetail = ref([]);
//<========== Liên quan đến dữ liệu mượn

//==========> Liên quan đến bảng dữ liệu
function createColumns({
  play
}) {
  return [
    {
      title: "STT",
      key: "no",
      width: 60
    },
    {
      title: "Tiêu đề sách",
      key: "title"
    },
    {
      title: "Ngày mượn",
      key: "borrowedTime",
      width: 110
    },
    {
      title: "Hạn trả",
      key: "returnDate",
      width: 110
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render(row) {
        const { isOverdue, daysRemaining } = row;
        
        if (isOverdue) {
          return h(
            NTag,
            {
              type: "error",
              size: "small",
              bordered: false
            },
            { default: () => `Quá hạn ${Math.abs(daysRemaining)} ngày` }
          );
        } else {
          return h(
            NTag,
            {
              type: "success",
              size: "small",
              bordered: false
            },
            { default: () => `Còn hạn` }
          );
        }
      }
    },
    {
      title: "Chi tiết",
      key: "actions",
      width: 80,
      render(row) {
        return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: "small",
            onClick: () => play(row)
          },
          { default: () => "Xem" }
        );
      }
    }
  ];
}

const columns = createColumns({
  play(row) {
    message.info(`Play ${row.title}`);
  }
});
const pagination = false;
//<========== Liên quan đến bảng dữ liệu
</script>



<template>
    <NLayout>
        <NLayoutContent class="min-h-screen p-4">
            <NSpace vertical justify="start" align="" :class="`relative min-h-[250px] bg-[url('/banner/book-bg1.png')] bg-cover bg-center border border-gray-300 rounded-md p-4`">
                <NSpace class="absolute -bottom-10">
                    <NGrid cols="3" class="shadow-lg rounded-md min-w-md bg-slate-300/50 backdrop-blur-md border border-gray-300 p-4">
                            <NGi span="1">
                                <NSpace justify="center" class="h-full" vertical="true" align="center">
                                    <img class="w-26 h-26 overflow-hidden rounded-full object-cover" :src="`${API_BASE}${userInfo?.AVATAR}`" alt="">
                                </NSpace>
                            </NGi>
                            <NGi span="2">
                                <NThing class="relative p-2">
                                    <template #description>
                                        <h3 class="text-2xl text-gray-300 font-semibold uppercase">{{ `${userInfo?.HOLOT} ${userInfo?.TEN}` }}</h3>
                                        <NGrid cols="2">
                                            <NGi span="1">
                                                <NP class="text-gray-300">
                                                    Giới tính: {{ userInfo?.PHAI ? 'Nam' : 'Nữ' }}
                                                </NP>
                                            </NGi>
                                        </NGrid>
                                        <NDivider />
                                        <NTag type="info">{{ userInfo?.GOI?.TenGoi }}</NTag>
                                        <BookMarkControll 
                                        :img="userInfo?.GOI?.HuyHieu" 
                                        :children="{width: '50px'}"
                                        :position="{
                                            top: '0px',
                                            right: '0px'
                                        }"/>
                                    </template>
                                </NThing>
                            </NGi>
                        </NGrid>
                </NSpace>
            </NSpace>
            <div class="mt-18 border border-gray-300/20 shadow-md p-4 rounded-md">
                <NGrid cols="3" x-gap="12" y-gap="12">
                    <NGi span="2">
                        <h1 class="text-xl uppercase my-2">Tổng quát về sách đã mượn</h1>
                        <n-data-table
                            class="w-full shadow-md"
                            :columns="columns"
                            :data="allBorrowsDetail"
                            :pagination="pagination"
                            :bordered="false"
                        />
                    </NGi>
                    <NGi span="1">
                        <h1 class="text-xl uppercase my-2">Thủ thư Mọt sẽ giúp bạn tóm tắt</h1>
                        <NCard class="bg-gradient-to-br rounded-lg shadow-md from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900" :bordered="false">
                            <NScrollbar class="h-64">
                                <div class="ai-response-container pr-3">
                                    <div v-if="!AI_RESPONSE" class="flex items-center justify-center h-40 text-gray-400">
                                        <NResult>
                                            <template #icon>
                                                <NSpace vertical align="center">
                                                    <NIcon size="40"><i class="fa-solid fa-robot"></i></NIcon>
                                                    <h3 class="animate-pulse">Chờ chút! Mọt sẽ giúp bạn thống kê...</h3>
                                                </NSpace>
                                            </template>
                                        </NResult>
                                    </div>
                                    <div v-else class="ai-markdown text-sm leading-relaxed">
                                        <div v-html="markdownRender(AI_RESPONSE)"></div>
                                    </div>
                                </div>
                            </NScrollbar>
                        </NCard>
                    </NGi>
                </NGrid>
            </div>
        </NLayoutContent>
    </NLayout>
</template>


<style scoped>
.ai-response-container {
    padding: 1rem;
}

.ai-markdown {
    margin: 0.4em 0;
    line-height: 1.6;
}

.ai-markdown :deep(p:first-child) {
    margin-top: 0;
}

.ai-markdown :deep(p:last-child) {
    margin-bottom: 0;
}

.ai-markdown :deep(h3),
.ai-markdown :deep(h4) {
    font-size: 1.1em;
    font-weight: 600;
    margin: 0.6em 0 0.3em 0;
    padding-bottom: 0.2em;
    border-bottom: 2px solid #818cf8;
    color: #4338ca;
}

:global(.dark) .ai-markdown :deep(h3),
:global(.dark) .ai-markdown :deep(h4) {
    color: #a5b4fc;
    border-bottom-color: #6366f1;
}

.ai-markdown :deep(strong) {
    font-weight: 600;
    color: #3730a3;
}

:global(.dark) .ai-markdown :deep(strong) {
    color: #c7d2fe;
}

.ai-markdown :deep(ul),
.ai-markdown :deep(ol) {
    margin: 0.4em 0;
    padding-left: 1.5em;
}

.ai-markdown :deep(li) {
    margin: 0.15em 0;
    padding-left: 0.3em;
}

.ai-markdown :deep(blockquote) {
    border-left: 3px solid #818cf8;
    padding: 0.3em 0 0.3em 0.7em;
    margin: 0.5em 0;
    background-color: rgba(129, 140, 248, 0.1);
    border-radius: 0 4px 4px 0;
    color: #3730a3;
    font-size: 0.95em;
}

:global(.dark) .ai-markdown :deep(blockquote) {
    background-color: rgba(129, 140, 248, 0.15);
    border-left-color: #6366f1;
    color: #a5b4fc;
}

.ai-markdown :deep(code) {
    background-color: rgba(129, 140, 248, 0.15);
    padding: 0.15em 0.35em;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.85em;
    color: #3730a3;
}

:global(.dark) .ai-markdown :deep(code) {
    background-color: rgba(99, 102, 241, 0.2);
    color: #a5b4fc;
}

.ai-markdown :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 0.6em 0;
    border: 1px solid #e0e7ff;
    border-radius: 4px;
    overflow-x: scroll;
    font-size: 0.9em;
}

:global(.dark) .ai-markdown :deep(table) {
    border-color: #4c1d95;
}

.ai-markdown :deep(th) {
    background-color: #eef2ff;
    padding: 6px 10px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #818cf8;
    color: #3730a3;
}

:global(.dark) .ai-markdown :deep(th) {
    background-color: #3730a3;
    border-bottom-color: #6366f1;
    color: #e0e7ff;
}

.ai-markdown :deep(td) {
    padding: 6px 10px;
    border-bottom: 1px solid #e0e7ff;
    max-width: 100px;
    /* giới hạn */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

:global(.dark) .ai-markdown :deep(td) {
    border-bottom-color: #4c1d95;
}

.ai-markdown :deep(tr:nth-child(even)) {
    background-color: #f8fafc;
    color: #3730a3;
}

:global(.dark) .ai-markdown :deep(tr:nth-child(even)) {
    background-color: #2d1b69;
}

.ai-markdown :deep(a) {
    color: #4338ca;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.ai-markdown :deep(a:hover) {
    color: #2e1065;
    text-decoration: underline;
}

:global(.dark) .ai-markdown :deep(a) {
    color: #818cf8;
}

:global(.dark) .ai-markdown :deep(a:hover) {
    color: #c7d2fe;
}
</style>