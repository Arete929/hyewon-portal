// 혜원포털 공통 바닥글 — 화면(GitHub 최신 커밋)·서버(Apps Script 버전/배포 시각)를 작게 표시합니다.
// 쓰는 법: 화면에 <div class="hv-foot"></div> 를 두고 HyewonVer.load(exec) 를 한 번 부르면, 이후 HyewonVer.paint() 로 다시 칠해요.
(function () {
  var REPO = 'Arete929/hyewon-portal';
  var v = { loaded: false, loading: false, web: null, server: null };
  function kst(iso) {
    var d = new Date(iso); if (isNaN(d.getTime())) return '';
    var p = {};
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    return p.year + '-' + p.month + '-' + p.day + ' ' + p.hour + ':' + p.minute;
  }
  function text() {
    if (!v.loaded) return '혜원포털 · 버전 확인 중…';
    var times = [v.web && v.web.time, v.server && v.server.buildTime].filter(function (t) { return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(t || ''); }).sort();
    return ['혜원포털', v.server ? 'v' + v.server.version : '', times.length ? '배포 ' + times[times.length - 1] + ' (KST)' : ''].filter(Boolean).join(' · ');
  }
  function paint() {
    var els = document.querySelectorAll('.hv-foot');
    for (var i = 0; i < els.length; i++) {
      els[i].innerHTML = '<small>' + text() + '</small><span>ⓒKIM.JIN.HO</span>';
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
    '.hv-foot small{display:block;font-size:11px;margin-bottom:3px}.hv-foot span{display:block;font-size:11px}';
  document.head.appendChild(css);
  window.HyewonVer = { load: load, paint: paint };
})();
