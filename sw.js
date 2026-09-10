/* My Family Funds — Service Worker
   ทำให้เปิดแอปได้แม้ไม่มีเน็ต (ข้อมูลเก็บใน localStorage ของเครื่องอยู่แล้ว)
   เพิ่มเวอร์ชันตรงนี้ทุกครั้งที่แก้ไข index.html เพื่อบังคับให้ผู้ใช้ได้ไฟล์ใหม่ */
const CACHE_VERSION = 'v39-4-google-sheets-central';
const CACHE_NAME = 'mff-v39-3-' + CACHE_VERSION;

const APP_SHELL = [
  './',
  './index.html',
  './dashboard.html',
  './auth.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // ไฟล์ของแอปเอง (same-origin): cache-first แล้วอัปเดตแคชเงียบๆ เบื้องหลัง
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Google Sheets/Drive API และ Google Sign-In: ต้องใช้เน็ตจริงเสมอ ไม่ cache
  // (ปล่อยให้ผ่านไปเป็น network request ปกติ ถ้าออฟไลน์จะ fail ตามจริง
  //  และโค้ดในแอปจะจับ error แล้วแจ้งเตือนผู้ใช้เอง)
});
