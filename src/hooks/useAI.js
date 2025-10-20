import axios from "axios";
import { GoogleGenAI }      from    "@google/genai";
import {
    LIBRARY_DATA,
    RESPONSE_RULES,
    PERFECT_RESPONSE,
    SUPPORT_ANOTHER_BOOKS
}                           from    "../services/supportAI";
import {
    getAllBooks
}                           from    "../services/apiBook";
import {
    getBorrowWithUserId,
    getBorrowInfo
}                           from    "../services/apiBorrow";
import {
    getAccountData
}                           from    "../hooks/useAccount.js";
import { 
    computed 
}                           from    "vue";
import {
    useMessage
}                           from    "naive-ui";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API;
const messageNoti = useMessage();
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });



async function generate({
    message, 
    has_books = false, 
    has_categories = false,
    borrow_data = false,
    short_response = false
}) {
    // if(!message) {
    //     messageNoti.error("Vui lòng nhập tin nhắn!");
    //     return;
    // }
    const booksData = computed(async() => {
        if(has_books) {
            const rs = await getAllBooks();
            return rs.data;
        } else {
            return [];
        }
    });
    const borrowData = computed(async() => {
        if(borrow_data) {
            const account = getAccountData();
            console.log(account);
            if(!account || !account.MADOCGIA) {
                return null;
            }
            const rs = await getBorrowWithUserId(account.MADOCGIA);
            //lấy chi tiết thông tin mượn trả
            const detailedBorrows = await Promise.all(rs.data.map(async(borrow) => {
                const info = await getBorrowInfo(borrow.MAPHIEU);
                return info;
            }));
            console.log(detailedBorrows);
            return detailedBorrows;
        } else {
            return [];
        }
    });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
        {
        role: "user",
        parts: [
            { text: message },
            {
                text: `Cho biết ngày hiện tại là ${new Date().toLocaleDateString()}.`
            },
            {
                text: `Hãy tuân thủ các quy tắc sau khi trả lời người dùng:
                ${JSON.stringify(RESPONSE_RULES)}`
            },
            {
                text: `Dưới đây là một số thông tin về thư viện mà bạn có thể sử dụng để trả lời người dùng:
                ${JSON.stringify(LIBRARY_DATA)}`
            },
            {
                text: has_books ? `Dưới đây là danh sách các sách hiện có trong thư viện:
                ${JSON.stringify(await booksData.value)}` : 'Tôi không có quyền trích xuất dữ liệu về sách!'
            },
            {
                text: borrow_data ? `Dưới đây là thông tin mượn trả của người dùng:
                ${JSON.stringify(await borrowData.value)}` : 'Tôi không có quyền trích xuất dữ liệu về mượn trả!'
            },
            {
                text: `Hãy cố gắng trả lời người dùng một cách hoàn hảo nhất có thể dựa trên các thông tin sau:
                ${JSON.stringify(PERFECT_RESPONSE)}`
            },
            {
                text: `Nếu người dùng mô tả về một loại sách mà họ không biết cụ thể **HÃY LÀM NHƯ SAU:**
                ${JSON.stringify(SUPPORT_ANOTHER_BOOKS)}`
            },
            { text: short_response ? `**TRẢ LỜI NGẮN GỌN**.` : '' }
        ]
        }
    ],
    system_instruction: {
        parts: [
            {
                text: `Bạn LÀ một trợ lý AI chuyên gia về thư viện, tên là 'Thủ Thư AI'.
                BẠN PHẢI TUÂN THỦ NGHIÊM NGẶT CÁC QUY TẮC SAU:
                1.  **CHỈ ĐƯỢC PHÉP** thảo luận về các chủ đề liên quan đến sách, tác giả, và tác phẩm văn học.
                2.  **BẮT BUỘC** sử dụng tiếng Việt.
                3.  Với **BẤT KỲ** câu hỏi nào không thuộc chủ đề cho phép ở quy tắc 1, bạn **PHẢI** trả lời chính xác bằng câu: "Tôi là Thủ Thư AI, tôi chỉ có thể hỗ trợ các vấn đề về sách vở."
                4.  **KHÔNG** được thêm bất kỳ thông tin nào khác ngoài câu trả lời ở quy tắc 3 khi từ chối.`
            }
        ]
    }
        
    });
    return response.text;
}


export default {
    generate
}

