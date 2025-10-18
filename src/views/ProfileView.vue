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
    NDivider,
    NCard,
    NQrCode,
    NDataTable,
    NButton,
}                               from    'naive-ui';
import {
    getAccountData
}                               from    '../hooks/useAccount';
import {
    getUserInfo
}                               from    '../services/apiUser'; 
import {
    ref,
    onMounted,
    computed,
    h
}                               from    'vue';
import {
    useRouter
}                               from    'vue-router'
import BookMarkControll         from    '../components/BookMarkControll.vue';

// ==================== GLOBAL VARIABLES =======================//
const API_BASE                  =       import.meta.env.VITE_API_BASE;
const router                    =       useRouter();

const userInfo                  =       ref(null);
onMounted(async () => {
    const userData = getAccountData();
    if(!userData) {
        router.push('/auth/login');
    } else {
        const rs = await getUserInfo(userData.MADOCGIA);
        userInfo.value = rs.data;
    }
    console.log(userInfo.value);
})

//==========> Liên quan đến bảng dữ liệu
function createColumns({
  play
}) {
  return [
    {
      title: "Số thứ tự",
      key: "no"
    },
    {
      title: "Tiêu đề sách",
      key: "title"
    },
    {
      title: "Thời gian mượn",
      key: "borrowedTime"
    },
    {
      title: "Chi tiết sách",
      key: "actions",
      render(row) {
        return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: "small",
            onClick: () => play(row)
          },
          { default: () => "Play" }
        );
      }
    }
  ];
}

const data = [
  { no: 3, title: "Wonderwall", borrowedTime: "4:18" },
  { no: 4, title: "Don't Look Back in Anger", borrowedTime: "4:48" },
  { no: 12, title: "Champagne Supernova", borrowedTime: "7:27" }
];
const columns = createColumns({
  play(row) {
    message.info(`Play ${row.title}`);
  }
});
const pagination = false;
//<========== Liên quan đến bảng dữ liệu
</script>



<template>
    <NLayout has-sider sider-placement="left">
        <NLayoutSider 
        bordered 
        collapse-mode="transform"
        :collapsed-width="120"
        :width="340" 
        show-trigger="arrow-circle">
            <h1>huhu</h1>
        </NLayoutSider>
        <NLayoutContent class="min-h-screen p-4">
            <NSpace vertical justify="start" align="" :class="`relative min-h-[250px] bg-[url('/banner/book-bg1.png')] bg-cover bg-center border border-gray-300 rounded-md p-4`">
                <NSpace class="absolute -bottom-10">
                    <NGrid cols="3" class="shadow-lg rounded-md min-w-md bg-slate-300/50 backdrop-blur-md border border-gray-300 p-4">
                            <NGi span="1">
                                <NSpace justify="center" class="h-full" vertical="true" align="center">
                                    <NImage width="100" src="/users/default-avatar.svg"></NImage>
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
                <NGrid cols="3">
                    <NGi span="2">
                        <h1 class="text-xl uppercase my-2">Tổng quát về sách đã mượn</h1>
                        <n-data-table
                        class="w-full"
                            :columns="columns"
                            :data="data"
                            :pagination="pagination"
                            :bordered="false"
                        />
                    </NGi>
                    <NGi span="1"></NGi>
                </NGrid>
            </div>
        </NLayoutContent>
    </NLayout>
</template>


<style scoped>

</style>