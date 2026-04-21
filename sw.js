const cacheName = "ueh-v1";
const assets = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./data.json",
];

// Lưu các file vào bộ nhớ đệm khi cài đặt
self.addEventListener("install", (e) => {
    e.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(assets)));
});

// Phản hồi dữ liệu ngay cả khi offline
self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then((res) => res || fetch(e.request)),
    );
});
