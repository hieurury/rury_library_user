<template>
    <div class="notification-bell">
        <NDropdown trigger="click" :options="dropdownOptions" @select="handleSelect" class="max-h-[400px] overflow-y-scroll">
            <NBadge :value="unreadCount" :max="99" :show="unreadCount > 0">
                <NButton circle quaternary @click="loadNotifications">
                    <template #icon>
                        <NIcon :size="20">
                            <i class="fas fa-bell"></i>
                        </NIcon>
                    </template>
                </NButton>
            </NBadge>
        </NDropdown>
    </div>
</template>

<script setup>
import { ref, computed, h, onMounted } from 'vue';
import { NDropdown, NScrollbar, NBadge, NButton, NIcon, NText, NSpace, NTime, useMessage } from 'naive-ui';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteAllNotifications } from '../services/apiUser';

const message = useMessage();
const notifications = ref([]);
const unreadCount = ref(0);

// Màu sắc cho từng loại thông báo
const labelColors = {
    success: '#18a058',
    info: '#2080f0',
    warning: '#f0a020',
    error: '#d03050'
};

// Load thông báo
const loadNotifications = async () => {
    try {
        const response = await getNotifications();
        if (response.status === 'success') {
            notifications.value = response.data.notifications;
            unreadCount.value = response.data.unreadCount;
        }
    } catch (error) {
        // Không hiển thị lỗi để tránh làm phiền user
    }
};

// Tạo dropdown options
const dropdownOptions = computed(() => {
    const notifOptions = notifications.value.slice(0, 10).map(notif => ({
        key: notif._id,
        type: 'render',
        render: () => h(
            'div',
            {
                style: {
                    padding: '12px 16px',
                    borderLeft: `4px solid ${labelColors[notif.LABEL] || '#ccc'}`,
                    backgroundColor: notif.DAXEM ? '#fff' : '#f0f9ff',
                    cursor: 'pointer',
                    maxWidth: '400px'
                }
            },
            [
                h(NSpace, { vertical: true, size: 4 }, {
                    default: () => [
                        h(NText, { 
                            strong: !notif.DAXEM,
                            style: { fontSize: '14px' }
                        }, { default: () => notif.NOIDUNG }),
                        h(NTime, { 
                            time: new Date(notif.NGAYTAO),
                            type: 'relative',
                            style: { fontSize: '12px', color: '#999' }
                        })
                    ]
                })
            ]
        )
    }));

    // Thêm divider và các nút hành động
    if (unreadCount.value > 0) {
        notifOptions.push(
            { type: 'divider', key: 'divider-1' },
            {
                key: 'mark-all-read',
                label: 'Đánh dấu tất cả đã đọc',
                icon: () => h(NIcon, null, {
                    default: () => h('i', { class: 'fas fa-check-double' })
                })
            }
        );
    }
    
    // Thêm nút xóa tất cả nếu có thông báo
    if (notifications.value.length > 0) {
        notifOptions.push(
            { type: 'divider', key: 'divider-2' },
            {
                key: 'delete-all',
                label: 'Xóa tất cả thông báo',
                icon: () => h(NIcon, null, {
                    default: () => h('i', { class: 'fas fa-trash', style: 'color: #d03050' })
                }),
                props: {
                    style: 'color: #d03050'
                }
            }
        );
    }

    // Nếu không có thông báo
    if (notifications.value.length === 0) {
        return [{
            key: 'empty',
            type: 'render',
            render: () => h(
                'div',
                { style: { padding: '20px', textAlign: 'center', color: '#999' } },
                'Không có thông báo'
            )
        }];
    }

    return notifOptions;
});

// Xử lý khi chọn thông báo
const handleSelect = async (key) => {
    if (key === 'mark-all-read') {
        try {
            await markAllNotificationsAsRead();
            message.success('Đã đánh dấu tất cả thông báo đã đọc');
            await loadNotifications();
        } catch (error) {
            message.error('Không thể đánh dấu thông báo');
        }
    } else if (key === 'delete-all') {
        try {
            await deleteAllNotifications();
            message.success('Đã xóa tất cả thông báo');
            await loadNotifications();
        } catch (error) {
            message.error('Không thể xóa thông báo');
        }
    } else if (key !== 'empty' && key !== 'divider-1' && key !== 'divider-2') {
        try {
            await markNotificationAsRead(key);
            await loadNotifications();
        } catch (error) {
            // Silent fail
        }
    }
};

// Load thông báo khi component mount
onMounted(() => {
    loadNotifications();
    // Tự động refresh mỗi 30 giây
    setInterval(loadNotifications, 30000);
});
</script>

<style scoped>
.notification-bell {
    display: inline-flex;
    align-items: center;
}
</style>
