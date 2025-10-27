<script setup>
import {
    getAllBooks,
    getBookById
} from "../services/apiBook";

import {
    ref,
    onMounted
} from 'vue';
import {
    useRoute
} from 'vue-router';
const route = useRoute();
const bookId = ref(null);
const bookData = ref(null);
onMounted(async () => {
    bookId.value = route.params.id;
    const rs = await getBookById(bookId.value);
    bookData.value = rs.data || [];
})
</script>


<template>

</template>


<style scoped>

</style>