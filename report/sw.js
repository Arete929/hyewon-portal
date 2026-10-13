/* 혜원포털 서비스워커 — 홈 화면 설치(PWA) + 푸시 알림(FCM).
   ★ FCM_CONFIG 는 index.html 위쪽의 FCM_CONFIG 와 «똑같이» 채운다(비어 있으면 푸시는 조용히 꺼져 있다). */
var CACHE = 'hyewon-report-v1';
var FCM_CONFIG = { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };

try {
  if (FCM_CONFIG.apiKey) {
    importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
    firebase.initializeApp(FCM_CONFIG);
    firebase.messaging();   // 백그라운드 수신 · 알림 표시 · 눌렀을 때 열기까지 SDK가 처리
  }
} catch (e) {}

var SHELL = ['./', './index.html', '../assets/logo.png', '../assets/favicon-192.png', './manifest.webmanifest'];

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
  var url = new URL(req.url);
  if (req.method !== 'GET') return;
  // 과제 서버(Apps Script) 호출은 절대 캐시하지 않습니다.
  if (url.hostname.indexOf('script.google') >= 0 || url.hostname.indexOf('googleusercontent') >= 0) return;
  if (url.origin !== location.origin) return;

  var isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') >= 0;
  if (isHTML) {
    // 화면은 «네트워크 먼저» — 고친 코드가 바로 반영되고, 오프라인이면 저장본을 보여 줍니다.
    e.respondWith(fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (r) { return r || caches.match('./index.html'); });
    }));
    return;
  }
  // 그림·아이콘은 «캐시 먼저»
  e.respondWith(caches.match(req).then(function (hit) {
    return hit || fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    });
  }));
});
