/* 혜원포털 관리자 서비스워커 — 홈 화면 설치(PWA) + 선생님 알림(FCM).
   서버(Apps Script)·GitHub 호출은 캐시하지 않고 그대로 통과(다른 주소). 화면 파일은 «네트워크 먼저», 안 되면 저장본. */
var CACHE = 'admin-shell-v4';
var FCM_CONFIG = { apiKey: 'AIzaSyBtpG79Dr6u-pLz3FiwebWf3v8Qq16OXv8', authDomain: 'hyewon-portal.firebaseapp.com', projectId: 'hyewon-portal', storageBucket: 'hyewon-portal.firebasestorage.app', messagingSenderId: '926603414719', appId: '1:926603414719:web:a068b0a313ca0986834a0a' };
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
  firebase.initializeApp(FCM_CONFIG);
  firebase.messaging();   // 앱이 닫혀 있을 때 알림 표시 · 눌렀을 때 과제 화면 열기
} catch (e) {}
var SHELL = ['./', './index.html', './manifest.webmanifest', './qrcode.js', '../routes.json',
  '../assets/admin-192.png', '../assets/admin-512.png', '../assets/admin-maskable-512.png', '../assets/logo.png', '../assets/login-bg.webp'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(SHELL.map(function (u) { return c.add(new Request(u, { cache: 'reload' })).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('admin-shell-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(fetch(req).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req).then(function (r) { return r || caches.match('./index.html'); });
  }));
});

// 앱을 켜 둔 채 받은 알림(화면에서 띄운 것)을 누르면 그 과제 화면을 열어요. FCM이 직접 띄운 알림은 FCM이 처리해요.
self.addEventListener('notificationclick', function (e) {
  var d = e.notification && e.notification.data;
  if (!d || !d.link || d.FCM_MSG) return;
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) { if (cs[i].url.indexOf('/admin/') >= 0 && 'focus' in cs[i]) { cs[i].navigate(d.link).catch(function () {}); return cs[i].focus(); } }
    return self.clients.openWindow(d.link);
  }));
});
