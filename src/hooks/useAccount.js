import {
    ref
}                          from    'vue';
//lấy từ sesstion nếu có
const accountData = ref(sessionStorage.getItem('accountData') ? JSON.parse(sessionStorage.getItem('accountData')) : null);

const setAccountData = (data) => {
    sessionStorage.setItem('accountData', JSON.stringify(data));
    accountData.value = data;
}

const getAccountData = () => {
    return accountData.value;
}

const removeAccountData = () => {
    accountData.value = null;
    sessionStorage.removeItem('accountData');
}

export {
    setAccountData,
    getAccountData,
    removeAccountData
}