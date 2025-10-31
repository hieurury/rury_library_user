import {
    ref
} from 'vue';


const setBookIds = (ids) => {
    localStorage.setItem('bookIds', JSON.stringify(ids));
};

const getBookIds = () => {
    return JSON.parse(localStorage.getItem('bookIds')) || [];
};

const clearBookIds = () => {
    localStorage.removeItem('bookIds');
};

export {
    setBookIds,
    getBookIds,
    clearBookIds
};
