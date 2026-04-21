let database = [];
let favorites = JSON.parse(localStorage.getItem("favUEH")) || [];
let currentViewing = null;
let currentFocus = -1;

const majorSelect = document.getElementById("majorSelect");
const searchInput = document.getElementById("searchInput");
const suggestionBox = document.getElementById("suggestionBox");

// ==================== INIT ====================
async function initApp() {
    document.getElementById("listMajors").innerHTML =
        '<div class="skeleton"></div><div class="skeleton"></div>';
    try {
        const res = await fetch("data.json");
        database = await res.json();
        renderOptions();
        populateCompareSelects();
        renderFavorites();
        document.getElementById("listMajors").innerHTML = "";
    } catch (e) {
        console.error("Lỗi tải data", e);
    }
}

function renderOptions() {
    const grouped = database.reduce((acc, obj) => {
        acc[obj.nhom] = acc[obj.nhom] || [];
        acc[obj.nhom].push(obj.nganh);
        return acc;
    }, {});
    for (const g in grouped) {
        const group = document.createElement("optgroup");
        group.label = g;
        grouped[g].forEach((n) => {
            const opt = document.createElement("option");
            opt.value = n;
            opt.textContent = n;
            group.appendChild(opt);
        });
        majorSelect.appendChild(group);
    }
}

// ==================== DISPLAY ====================
function displayData(name) {
    const item = database.find((i) => i.nganh === name);
    if (!item) return;
    currentViewing = item;

    const view = document.getElementById("dataView");
    view.style.display = "flex";

    document.getElementById("listMajors").innerHTML = `
        <div class="data-item">
            <strong>${item.nganh}</strong>
            <div style="font-size:12px; color:var(--text-muted); margin-top:4px">${item.nhom}</div>
            ${item.tochat ? `<div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:4px">${item.tochat.map((t) => `<span style="font-size:11px; padding:2px 8px; border-radius:10px; background:var(--primary-light); color:var(--primary); border:1px solid var(--primary)">${t}</span>`).join("")}</div>` : ""}
        </div>`;

    document.getElementById("detailView").innerHTML = item.chitiet;
    document.getElementById("btnBookmark").textContent = favorites.includes(
        name,
    )
        ? "❤️"
        : "🤍";
}

// ==================== AUTOCOMPLETE ====================
searchInput.addEventListener("input", function () {
    const val = this.value.toLowerCase().trim();
    majorSelect.disabled = val.length > 0;
    suggestionBox.innerHTML = "";
    currentFocus = -1;
    if (!val) {
        suggestionBox.style.display = "none";
        return;
    }

    const matches = database.filter((i) => i.nganh.toLowerCase().includes(val));
    if (matches.length > 0) {
        suggestionBox.style.display = "block";
        matches.forEach((m) => {
            const d = document.createElement("div");
            d.className = "suggestion-item";
            d.textContent = m.nganh;
            d.onclick = () => {
                searchInput.value = m.nganh;
                suggestionBox.style.display = "none";
                displayData(m.nganh);
            };
            suggestionBox.appendChild(d);
        });
    } else {
        suggestionBox.style.display = "none";
    }
});

searchInput.addEventListener("keydown", function (e) {
    const items = suggestionBox.getElementsByClassName("suggestion-item");
    if (e.key === "ArrowDown") {
        currentFocus++;
        addActive(items);
    } else if (e.key === "ArrowUp") {
        currentFocus--;
        addActive(items);
    } else if (e.key === "Enter") {
        if (currentFocus > -1) items[currentFocus].click();
        else if (items.length > 0) items[0].click();
    }
});

function addActive(items) {
    if (!items.length) return;
    for (const i of items) i.classList.remove("selected");
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add("selected");
}

// ==================== SMART FILTER ====================
document.querySelectorAll(".trait-btn").forEach((btn) => {
    btn.onclick = function () {
        this.classList.toggle("active");
        const activeTraits = Array.from(
            document.querySelectorAll(".trait-btn.active"),
        ).map((b) => b.dataset.trait);
        if (activeTraits.length === 0) {
            majorSelect.disabled = false;
            document.getElementById("dataView").style.display = "none";
            return;
        }
        const filtered = database.filter(
            (i) => i.tochat && i.tochat.some((t) => activeTraits.includes(t)),
        );
        renderList(filtered);
    };
});

function renderList(list) {
    document.getElementById("dataView").style.display = "flex";
    document.getElementById("listMajors").innerHTML = list.length
        ? list
              .map(
                  (i) =>
                      `<div class="suggestion-item" onclick="displayData('${i.nganh}')" style="cursor:pointer">${i.nganh}</div>`,
              )
              .join("")
        : `<div style="padding:16px; color:var(--text-muted); font-size:13px">Không tìm thấy ngành phù hợp.</div>`;
    document.getElementById("detailView").innerHTML =
        `<div class="placeholder-hint">← Chọn một ngành để xem chi tiết</div>`;
}

// ==================== BOOKMARK ====================
document.getElementById("btnBookmark").onclick = () => {
    if (!currentViewing) return;
    const name = currentViewing.nganh;
    favorites = favorites.includes(name)
        ? favorites.filter((f) => f !== name)
        : [...favorites, name];
    localStorage.setItem("favUEH", JSON.stringify(favorites));
    renderFavorites();
    displayData(name);
};

function renderFavorites() {
    const container = document.getElementById("favoriteItems");
    const section = document.getElementById("favoriteSection");
    if (!favorites.length) {
        section.classList.remove("has-items");
        return;
    }
    section.classList.add("has-items");
    container.innerHTML = favorites
        .map(
            (f) =>
                `<span class="fav-tag" onclick="displayData('${f}')">${f}</span>`,
        )
        .join("");
}

// ==================== COMPARE FEATURE ====================
function populateCompareSelects() {
    [
        document.getElementById("compareSelect1"),
        document.getElementById("compareSelect2"),
    ].forEach((sel) => {
        const grouped = database.reduce((acc, obj) => {
            acc[obj.nhom] = acc[obj.nhom] || [];
            acc[obj.nhom].push(obj.nganh);
            return acc;
        }, {});
        for (const g in grouped) {
            const group = document.createElement("optgroup");
            group.label = g;
            grouped[g].forEach((n) => {
                const opt = document.createElement("option");
                opt.value = n;
                opt.textContent = n;
                group.appendChild(opt);
            });
            sel.appendChild(group);
        }
    });
}

function updateSlotPreview(selectEl, previewEl) {
    const name = selectEl.value;
    if (!name) {
        previewEl.innerHTML =
            '<span style="color:var(--text-muted); font-size:13px">Chưa chọn ngành...</span>';
        previewEl.classList.remove("has-content");
        return;
    }
    const item = database.find((i) => i.nganh === name);
    if (!item) return;
    previewEl.classList.add("has-content");
    previewEl.innerHTML = `
        <div class="preview-name">${item.nganh}</div>
        <div class="preview-group">${item.nhom}</div>
        ${item.tochat ? `<div class="preview-traits">${item.tochat.map((t) => `<span>${t}</span>`).join("")}</div>` : ""}
    `;
}

function checkCompareReady() {
    const v1 = document.getElementById("compareSelect1").value;
    const v2 = document.getElementById("compareSelect2").value;
    const btn = document.getElementById("btnDoCompare");
    btn.disabled = !(v1 && v2 && v1 !== v2);
}

document
    .getElementById("compareSelect1")
    .addEventListener("change", function () {
        updateSlotPreview(this, document.getElementById("preview1"));
        checkCompareReady();
    });
document
    .getElementById("compareSelect2")
    .addEventListener("change", function () {
        updateSlotPreview(this, document.getElementById("preview2"));
        checkCompareReady();
    });

document.getElementById("btnOpenCompare").onclick = () => {
    openModal("comparePickerModal");
};

document.getElementById("btnDoCompare").onclick = () => {
    const name1 = document.getElementById("compareSelect1").value;
    const name2 = document.getElementById("compareSelect2").value;
    const item1 = database.find((i) => i.nganh === name1);
    const item2 = database.find((i) => i.nganh === name2);
    if (!item1 || !item2) return;

    document.getElementById("compareResultContent").innerHTML = `
        ${renderCompareCard(item1)}
        ${renderCompareCard(item2)}
    `;
    closeModal("comparePickerModal");
    openModal("compareResultModal");
};

function renderCompareCard(item) {
    const traits = item.tochat
        ? item.tochat.map((t) => `<span>${t}</span>`).join("")
        : "";
    return `
        <div class="compare-card">
            <div class="compare-card-header">
                <h3>${item.nganh}</h3>
                <div class="card-group">${item.nhom}</div>
                ${traits ? `<div class="card-traits">${traits}</div>` : ""}
            </div>
            <div class="compare-card-body">${item.chitiet}</div>
        </div>
    `;
}

document.getElementById("btnBackPicker").onclick = () => {
    closeModal("compareResultModal");
    openModal("comparePickerModal");
};

// ==================== MODAL HELPERS ====================
function openModal(id) {
    document.getElementById(id).style.display = "block";
}
function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.onclick = () => {
        const target = btn.dataset.target;
        if (target) closeModal(target);
    };
});

window.onclick = (e) => {
    if (e.target.classList.contains("modal")) e.target.style.display = "none";
};

// ==================== DARK MODE ====================
(function restoreDarkMode() {
    const saved = localStorage.getItem("uehTheme");
    if (saved === "dark") {
        document.body.setAttribute("data-theme", "dark");
        document.documentElement.setAttribute("data-theme", "dark");
        const icon = document.querySelector("#darkModeToggle .mode-icon");
        if (icon) icon.textContent = "☀️";
    }
})();

document.getElementById("darkModeToggle").onclick = function () {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    document.body.setAttribute("data-theme", next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("uehTheme", next);
    this.querySelector(".mode-icon").textContent = isDark ? "🌙" : "☀️";
};

majorSelect.onchange = (e) => {
    if (e.target.value) displayData(e.target.value);
};

window.addEventListener("load", () => {
    const splash = document.getElementById("splash-screen");

    // Bạn có thể cá nhân hóa lời chào dựa theo thời gian
    const welcomeText = document.getElementById("welcome-text");
    const hour = new Date().getHours();
    if (hour < 12) welcomeText.textContent = "Chào buổi sáng!";
    else if (hour < 18) welcomeText.textContent = "Chào buổi chiều!";
    else welcomeText.textContent = "Chào buổi tối!";

    // Sau 2 giây thì ẩn màn hình chào
    setTimeout(() => {
        splash.style.opacity = "0";
        splash.style.visibility = "hidden";

        // Sau khi ẩn xong thì có thể kích hoạt các tính năng khác của app
        console.log("Đã vào trang chính");
    }, 2000);
});

initApp();
