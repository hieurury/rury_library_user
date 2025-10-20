import {
    ref
}                          from    'vue';
//lấy từ sesstion nếu có
const accountData = ref(sessionStorage.getItem('accountData') ? JSON.parse(sessionStorage.getItem('accountData')) : null);

const setAccountData = (data) => {
    sessionStorage.setItem('accountData', JSON.stringify(data));
    accountData.value = data;
}



const setToken = (token) => {
    sessionStorage.setItem('token', token);
}

const getToken = () => {
    return sessionStorage.getItem('token');
}

const removeToken = () => {
    sessionStorage.removeItem('token');
}



const getAccountData = () => {
    return accountData.value;
}

const removeAccountData = () => {
    accountData.value = null;
    sessionStorage.removeItem('accountData');
    sessionStorage.removeItem('token');
}
export {
    setAccountData,
    getAccountData,
    removeAccountData,
    setToken,
    getToken,
    removeToken
}