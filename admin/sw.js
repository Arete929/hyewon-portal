/* 혜원포털 관리자 서비스워커 — 홈 화면 설치(PWA)용.
   서버(Apps Script)·GitHub 호출은 캐시하지 않고 그대로 통과(다른 주소). 화면 파일은 «네트워크 먼저», 안 되면 저장본. */
var CACHE = 'admin-shell-v1';
var SHELL = ['./', './index.html', './manifest.webmanifest', './qrcode.js', '../routes.json',
  '../assets/admin-192.png', '../assets/admin-512.png', '../assets/logo.png', '../assets/login-bg.webp'];

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
