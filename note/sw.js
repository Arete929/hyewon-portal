/* 학생 기록 서비스워커 — 홈 화면 설치(PWA) + 오프라인에서도 화면 열기.
   서버(Apps Script) 호출은 절대 캐시하지 않습니다. 화면은 «네트워크 먼저», 안 되면 저장본. */
var CACHE = 'note-shell-v1';
var SHELL = ['./', './index.html', './manifest.webmanifest', '../assets/favicon-192.png', '../assets/favicon-512.png', '../routes.json'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(SHELL.map(function (u) { return c.add(new Request(u, { cache: 'reload' })).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;          // 구글 서버·폰트 등은 그대로 통과
  e.respondWith(fetch(req).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req).then(function (r) { return r || caches.match('./index.html'); });
  }));
});
