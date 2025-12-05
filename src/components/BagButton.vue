<script setup>
import { ref } from 'vue';
import { NButton, NIcon, NBadge, NImage } from 'naive-ui';
import { bagCount } from '../hooks/useBag';
import BagDrawer from './BagDrawer.vue';

const showDrawer = ref(false);

const handleClick = () => {
    showDrawer.value = true;
};
</script>

<template>
    <div>
        <NBadge :value="bagCount" :max="99" show-zero>
            <NButton size="large" @click="handleClick">
                <template #icon>
                    <!-- <NImage :show-toolbar="false" src="/backpack.svg"></NImage>
                    <NImage :show-toolbar="false" src="/backpack-light.svg"></NImage> -->
                    <NIcon size="20">
                        <i class="fa-solid fa-suitcase"></i>
                    </NIcon>
                </template>
            </NButton>
        </NBadge>

        <BagDrawer v-model:show="showDrawer" />
    </div>
</template>
