// let database = [];

// // 1. Hàm nạp dữ liệu và phân nhóm
// async function initApp() {
//     try {
//         const response = await fetch('data.json');
//         database = await response.json();

//         const select = document.getElementById('majorSelect');

//         // Nhóm dữ liệu theo 'nhom'
//         const grouped = database.reduce((acc, obj) => {
//             acc[obj.nhom] = acc[obj.nhom] || [];
//             acc[obj.nhom].push(obj.nganh);
//             return acc;
//         }, {});

//         // Render vào select (optgroup)
//         for (const groupName in grouped) {
//             const optGroup = document.createElement('optgroup');
//             optGroup.label = groupName;

//             grouped[groupName].forEach(nganh => {
//                 const opt = document.createElement('option');
//                 opt.value = nganh;
//                 opt.textContent = nganh;
//                 optGroup.appendChild(opt);
//             });
//             select.appendChild(optGroup);
//         }
//     } catch (err) {
//         console.error("Lỗi: ", err);
//     }
// }

// // 2. Hàm hiển thị dữ liệu ra Datagridview
// function displayData(nganhName) {
//     const item = database.find(i => i.nganh === nganhName);
//     if (item) {
//         const view = document.getElementById('dataView');
//         view.style.display = 'flex'; // Hiện datagrid

//         document.getElementById('listMajors').innerHTML = `<div class="data-item">${item.nganh}</div>`;
//         document.getElementById('detailView').textContent = item.chitiet;
//     }
// }

// // 3. Sự kiện thay đổi Select
// document.getElementById('majorSelect').addEventListener('change', (e) => {
//     if (e.target.value) displayData(e.target.value);
// });

// // 4. Sự kiện Tìm kiếm (Nhấn Enter)
// document.getElementById('searchInput').addEventListener('keypress', (e) => {
//     if (e.key === 'Enter') {
//         const val = e.target.value.toLowerCase().trim();
//         const found = database.find(i => i.nganh.toLowerCase().includes(val));
//         if (found) {
//             displayData(found.nganh);
//             document.getElementById('majorSelect').value = found.nganh; // Đồng bộ dropdown
//         } else {
//             alert("Không tìm thấy thông tin ngành này!");
//         }
//     }
// });

// initApp();

// Biến toàn cục lưu trữ dữ liệu nạp từ JSON
let database = [];
// Thêm biến theo dõi vị trí đang chọn trong danh sách gợi ý
let currentFocus = -1;

// 1. Khởi tạo ứng dụng và nạp dữ liệu
async function initApp() {
    try {
        const response = await fetch("data.json");
        if (!response.ok) throw new Error("Không thể tải file JSON");

        database = await response.json();

        renderSelectOptions();
    } catch (err) {
        console.error("Lỗi khởi tạo:", err);
    }
}

// 2. Tự động render và phân nhóm <optgroup> vào thẻ Select
function renderSelectOptions() {
    const select = document.getElementById("majorSelect");

    // Gom nhóm dữ liệu theo thuộc tính 'nhom'
    const grouped = database.reduce((acc, obj) => {
        acc[obj.nhom] = acc[obj.nhom] || [];
        acc[obj.nhom].push(obj.nganh);
        return acc;
    }, {});

    // Render từng nhóm vào HTML
    for (const groupName in grouped) {
        const optGroup = document.createElement("optgroup");
        optGroup.label = groupName;

        grouped[groupName].forEach((nganh) => {
            const opt = document.createElement("option");
            opt.value = nganh;
            opt.textContent = nganh;
            optGroup.appendChild(opt);
        });
        select.appendChild(optGroup);
    }
}

// 3. Hàm hiển thị dữ liệu ra Datagridview
function displayData(nganhName) {
    const item = database.find((i) => i.nganh === nganhName);
    if (item) {
        const view = document.getElementById("dataView");
        view.style.display = "flex"; // Hiện khối datagridview

        document.getElementById("listMajors").innerHTML =
            `<div class="data-item">${item.nganh}</div>`;
        document.getElementById("detailView").innerHTML = item.chitiet;
    }
}

// --- XỬ LÝ SỰ KIỆN ---
const majorSelect = document.getElementById("majorSelect");
const searchInput = document.getElementById("searchInput");
const suggestionBox = document.getElementById("suggestionBox");

// A. Xử lý khi chọn từ thẻ Select
majorSelect.addEventListener("change", (e) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
        displayData(selectedValue);

        // Khóa ô input search
        searchInput.disabled = true;
        searchInput.placeholder = "Đang xem theo danh sách chọn...";
    } else {
        // Nếu chọn lại "-- Chọn ngành --", mở khóa input
        searchInput.disabled = false;
        searchInput.placeholder = "Nhập tên ngành...";
        document.getElementById("dataView").style.display = "none";
    }
});

// B. Xử lý khi gõ vào Input Search (Gợi ý và Disable)
searchInput.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase().trim();

    if (val.length > 0) {
        majorSelect.disabled = true;
    } else {
        majorSelect.disabled = false;
        document.getElementById("dataView").style.display = "none";
    }

    suggestionBox.innerHTML = "";
    currentFocus = -1; // Reset lại vị trí mỗi khi gõ từ mới

    if (val === "") {
        suggestionBox.style.display = "none";
        return;
    }

    const matches = database.filter((i) => i.nganh.toLowerCase().includes(val));

    if (matches.length > 0) {
        suggestionBox.style.display = "block";
        matches.forEach((match, index) => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.textContent = match.nganh;

            // Lưu index vào thuộc tính của element để dễ quản lý
            div.setAttribute("data-index", index);

            div.onclick = () => {
                selectSuggestion(match.nganh);
            };
            suggestionBox.appendChild(div);
        });
    } else {
        suggestionBox.style.display = "none";
    }
});

// XỬ LÝ PHÍM MŨI TÊN VÀ ENTER
searchInput.addEventListener("keydown", (e) => {
    let items = suggestionBox.getElementsByClassName("suggestion-item");

    if (e.key === "ArrowDown") {
        currentFocus++;
        addActive(items);
        e.preventDefault(); // Ngăn con trỏ nhảy về cuối input
    } else if (e.key === "ArrowUp") {
        currentFocus--;
        addActive(items);
        e.preventDefault();
    } else if (e.key === "Enter") {
        e.preventDefault(); // Ngăn form submit nếu có
        if (currentFocus > -1) {
            if (items) items[currentFocus].click(); // Giả lập click vào mục đang chọn
        } else {
            // Nếu chưa chọn mục nào bằng mũi tên, lấy kết quả đầu tiên (nếu có)
            if (items.length > 0) items[0].click();
        }
    } else if (e.key === "Backspace" && searchInput.value === "") {
        majorSelect.disabled = false;
    }
});

// Hàm tô màu mục đang chọn bằng bàn phím
function addActive(items) {
    if (!items) return false;
    removeActive(items);

    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;

    items[currentFocus].classList.add("selected");

    // Tự động cuộn theo nếu danh sách dài quá
    items[currentFocus].scrollIntoView({ block: "nearest" });
}

// Hàm xóa trạng thái tô màu cũ
function removeActive(items) {
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove("selected");
    }
}

// Hàm bổ trợ để chọn kết quả
function selectSuggestion(name) {
    searchInput.value = name;
    suggestionBox.style.display = "none";
    displayData(name);
}

// C. Click ra ngoài thì ẩn danh sách gợi ý
document.addEventListener("click", (e) => {
    if (e.target !== searchInput) {
        suggestionBox.style.display = "none";
    }
});

// D. Hỗ trợ Reset nhanh bằng phím Backspace khi input trống
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && searchInput.value === "") {
        majorSelect.disabled = false;
    }
});

// Khởi chạy ứng dụng
initApp();
