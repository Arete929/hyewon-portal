// 혜원포털 공통 바닥글 — 화면(GitHub 최신 커밋)·서버(Apps Script 버전/배포 시각)를 작게 표시합니다.
// 쓰는 법: 화면에 <div class="hv-foot"></div> 를 두고 HyewonVer.load(exec) 를 한 번 부르면, 이후 HyewonVer.paint() 로 다시 칠해요.
(function () {
  var REPO = 'Arete929/hyewon-portal';
  var v = { loaded: false, loading: false, web: null, server: null };
  function kst(iso) {
    var d = new Date(iso); if (isNaN(d.getTime())) return '';
    var p = {};
    new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    return p.month + '/' + p.day + ' ' + p.hour + ':' + p.minute;
  }
  function text() {
    var web = v.web ? v.web.sha + ' · ' + v.web.time : (v.loaded ? '확인 못 함' : '확인 중…');
    var server = v.loaded ? '확인 못 함' : '확인 중…';
    if (v.server) {
      var m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2})$/.exec(String(v.server.buildTime || ''));
      server = 'v' + v.server.version + (m ? ' · ' + Number(m[2]) + '/' + Number(m[3]) + ' ' + m[4] : '');
    }
    return '화면 ' + web + ' · 서버 ' + server;
  }
  function paint() {
    var els = document.querySelectorAll('.hv-foot');
    for (var i = 0; i < els.length; i++) {
      els[i].innerHTML = '<span>메이드 바이 이글티처 · 교육 목적</span><small>' + text() + '</small>';
    }
  }
  async function load(exec) {
    paint();
    if (v.loaded || v.loading) return;
    v.loading = true;
    if (exec) {
      try {
        var u = new URL(exec); u.searchParams.set('action', 'authStatus');
        var st = await (await fetch(u.toString())).json();
        if (st && st.ok) v.server = { version: st.serverVersion, buildTime: st.buildTime || '' };
      } catch (e) {}
    }
    try {
      var r = await fetch('https://api.github.com/repos/' + REPO + '/commits/main', { headers: { Accept: 'application/vnd.github+json' } });
      if (r.ok) {
        var j = await r.json(), t = kst(j && j.commit && j.commit.committer && j.commit.committer.date);
        if (j && j.sha && t) v.web = { sha: String(j.sha).slice(0, 7), time: t };
      }
    } catch (e) {}
    v.loading = false; v.loaded = true;
    paint();
  }
  var css = document.createElement('style');
  css.textContent = '.hv-foot{text-align:center;padding:18px 16px 26px;color:#9AA79F;line-height:1.6}' +
    '.hv-foot span{display:block;font-size:11px}.hv-foot small{display:block;font-size:10px;opacity:.85}';
  document.head.appendChild(css);
  window.HyewonVer = { load: load, paint: paint };
})();
