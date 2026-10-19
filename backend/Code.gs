/**
 * Bru Safe Shift backend (Google Apps Script bound to a Google Sheet).
 * Tabs: Results, Supervisors, Audit, Config
 * Script property needed: SUBMIT_KEY (same text as KEY in app.js)
 * Supervisor sign-in uses a 6-digit code emailed from the script owner's account.
 */
var TOKEN_SECONDS = 6 * 3600;
var OTP_SECONDS = 600;

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Safe Shift')
    .addItem('1. Set up sheets', 'setup')
    .addItem('2. Generate supervisor IDs', 'generateSupervisorIds')
    .addItem('3. Purge old data now', 'purgeOld')
    .addToUi();
}

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function sha_(s) { return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s)); }

function setup() {
  var defs = {
    Results: ['Time', 'WorkerID', 'Name', 'Consent', 'Shift', 'Site', 'Area', 'Lang', 'Score', 'Traits', 'States', 'Missed'],
    Supervisors: ['UserID', 'Name', 'Email', 'Mobile', 'Site', 'Active', 'Created'],
    Audit: ['Time', 'UserID', 'Action'],
    Config: ['Key', 'Value']
  };
  for (var n in defs) {
    var sh = ss_().getSheetByName(n) || ss_().insertSheet(n);
    if (sh.getLastRow() === 0) sh.appendRow(defs[n]);
    sh.setFrozenRows(1);
  }
  ss_().getSheetByName('Supervisors').getRange('A:D').setNumberFormat('@');
  ss_().getSheetByName('Results').getRange('B:C').setNumberFormat('@');
  var cfg = ss_().getSheetByName('Config');
  var defaults = { retention_days: '180', c1: '#9e1b21', c2: '#f2b632', sites: JSON.stringify([]), shifts: JSON.stringify(['A', 'B', 'C']), logo: '',
    consent_en: '', consent_hi: '', consent_ta: '' };
  for (var k in defaults) if (cfgGet_(k) === null) cfg.appendRow([k, defaults[k]]);
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'purgeOld') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('purgeOld').timeBased().everyDays(1).atHour(3).create();
}

function cfgGet_(key) {
  var d = ss_().getSheetByName('Config').getDataRange().getValues();
  for (var i = 1; i < d.length; i++) if (String(d[i][0]) === key) return String(d[i][1]);
  return null;
}
function cfgSet_(key, val) {
  var sh = ss_().getSheetByName('Config'), d = sh.getDataRange().getValues();
  for (var i = 1; i < d.length; i++) if (String(d[i][0]) === key) { sh.getRange(i + 1, 2).setValue(val); return; }
  sh.appendRow([key, val]);
}
function publicCfg_() {
  function j(k, def) { try { return JSON.parse(cfgGet_(k) || ''); } catch (e) { return def; } }
  return {
    logo: cfgGet_('logo') || '', c1: cfgGet_('c1') || '#9e1b21', c2: cfgGet_('c2') || '#f2b632',
    sites: j('sites', []), shifts: j('shifts', ['A', 'B', 'C']),
    consent: { en: cfgGet_('consent_en') || '', hi: cfgGet_('consent_hi') || '', ta: cfgGet_('consent_ta') || '' }
  };
}

// Manager: fill Name, Email, Site (or leave blank for ALL) in Supervisors, then run this.
function generateSupervisorIds() {
  var sh = ss_().getSheetByName('Supervisors');
  var data = sh.getDataRange().getValues();
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (var i = 1; i < data.length; i++) {
    if (!data[i][2]) continue;
    if (!data[i][0]) {
      var id = 'SUP-';
      for (var k = 0; k < 6; k++) id += chars.charAt(Math.floor(Math.random() * chars.length));
      sh.getRange(i + 1, 1).setValue(id);
    }
    sh.getRange(i + 1, 3).setValue(String(data[i][2]).trim().toLowerCase());
    if (!data[i][4]) sh.getRange(i + 1, 5).setValue('ALL');
    if (!data[i][5]) sh.getRange(i + 1, 6).setValue('YES');
    if (!data[i][6]) sh.getRange(i + 1, 7).setValue(new Date());
  }
}

function findSup_(uid, email) {
  if (!uid || !email) return null;
  var data = ss_().getSheetByName('Supervisors').getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === uid && String(data[i][2]).toLowerCase() === email && String(data[i][5]).toUpperCase() === 'YES') {
      return { id: uid, name: String(data[i][1]), email: email, site: String(data[i][4] || 'ALL') };
    }
  }
  return null;
}

function rate_(key, max, secs) {
  var c = CacheService.getScriptCache();
  var n = Number(c.get(key) || 0);
  if (n >= max) return false;
  c.put(key, String(n + 1), secs);
  return true;
}
function audit_(uid, action) { ss_().getSheetByName('Audit').appendRow([new Date(), uid, action]); }
function safe_(v, n) { v = String(v == null ? '' : v).substr(0, n || 60); return (v.length && '=+-@'.indexOf(v.charAt(0)) >= 0) ? String.fromCharCode(39) + v : v; }

function doGet() { return out_({ ok: true, msg: 'Safe Shift API' }); }

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    switch (d.a) {
      case 'config': return out_({ ok: true, cfg: publicCfg_() });
      case 'submit': return submit_(d);
      case 'otpStart': return otpStart_(d);
      case 'otpCheck': return otpCheck_(d);
      case 'report': return report_(d);
      case 'setConfig': return setConfig_(d);
      case 'logout': CacheService.getScriptCache().remove('tok_' + d.token); return out_({ ok: true });
    }
    return out_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return out_({ ok: false, error: 'bad request' });
  }
}

function submit_(d) {
  var key = prop_('SUBMIT_KEY');
  if (key && d.key !== key) return out_({ ok: false, error: 'denied' });
  var r = d.rec || {};
  var consent = Number(r.consent) === 1 ? 1 : 0;
  var pct = Math.max(0, Math.min(100, Number(r.pct) || 0));
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  ss_().getSheetByName('Results').appendRow([
    safe_(r.ts, 30), safe_(r.wid, 20), consent ? safe_(r.n, 60) : '', consent,
    safe_(r.shift, 12), safe_(r.site, 40), safe_(r.ind, 4), safe_(r.lang, 4), pct,
    JSON.stringify(r.tr || {}).substr(0, 800), JSON.stringify(r.st || {}).substr(0, 200), JSON.stringify(r.miss || []).substr(0, 300)
  ]);
  lock.releaseLock();
  return out_({ ok: true });
}

function otpStart_(d) {
  var email = String(d.email || '').trim().toLowerCase(), uid = String(d.uid || '').toUpperCase();
  var at = email.indexOf('@');
  if (at < 1 || email.indexOf('.', at) < at + 2 || email.indexOf(' ') >= 0) return out_({ ok: false, error: 'Enter a valid email' });
  if (!rate_('os_' + email, 3, 600)) return out_({ ok: false, error: 'Too many requests. Try again later.' });
  var sup = findSup_(uid, email);
  if (sup) {
    var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Utilities.getUuid() + Date.now());
    var n = 0;
    for (var i = 0; i < 4; i++) n = n * 256 + ((bytes[i] + 256) % 256);
    var code = String(100000 + (n % 900000));
    CacheService.getScriptCache().put('otp_' + uid, sha_(code + uid), OTP_SECONDS);
    MailApp.sendEmail(email, 'Bru Safe Shift sign-in code',
      'Your sign-in code is ' + code + '. It is valid for 10 minutes. If you did not ask for it, ignore this email.');
  }
  return out_({ ok: true });
}

function otpCheck_(d) {
  var email = String(d.email || '').trim().toLowerCase(), uid = String(d.uid || '').toUpperCase();
  if (!rate_('oc_' + uid, 5, 600)) return out_({ ok: false, error: 'Too many attempts. Try again later.' });
  var sup = findSup_(uid, email);
  var cache = CacheService.getScriptCache();
  var want = cache.get('otp_' + uid);
  if (!sup || !want || sha_(String(d.code || '').trim() + uid) !== want) return out_({ ok: false, error: 'Invalid or expired code' });
  cache.remove('otp_' + uid);
  var token = Utilities.getUuid() + Utilities.getUuid();
  cache.put('tok_' + token, JSON.stringify(sup), TOKEN_SECONDS);
  audit_(sup.id, 'login');
  return out_({ ok: true, token: token, id: sup.id, name: sup.name, site: sup.site });
}

function auth_(token) {
  var raw = CacheService.getScriptCache().get('tok_' + token);
  return raw ? JSON.parse(raw) : null;
}

function report_(d) {
  var sup = auth_(d.token);
  if (!sup) return out_({ ok: false, error: 'auth' });
  var data = ss_().getSheetByName('Results').getDataRange().getValues();
  var rows = [];
  var p = function (s) { try { return JSON.parse(s); } catch (e) { return {}; } };
  for (var i = data.length - 1; i >= 1 && rows.length < 5000; i--) {
    var x = data[i];
    if (sup.site !== 'ALL' && String(x[5]) !== sup.site) continue;
    rows.push({ ts: String(x[0]), wid: String(x[1]), n: String(x[2]), consent: x[3], shift: String(x[4]), site: String(x[5]), ind: String(x[6]), lang: String(x[7]), pct: Number(x[8]), tr: p(x[9]), st: p(x[10]), miss: p(x[11]) });
  }
  audit_(sup.id, 'report');
  return out_({ ok: true, rows: rows });
}

// Only supervisors with Site = ALL may change shared settings.
function setConfig_(d) {
  var sup = auth_(d.token);
  if (!sup) return out_({ ok: false, error: 'auth' });
  if (sup.site !== 'ALL') return out_({ ok: false, error: 'Not allowed for your site scope' });
  var c = d.cfg || {};
  if (typeof c.logo === 'string') {
    if (c.logo !== '' && (c.logo.indexOf('data:image/') !== 0 || c.logo.length > 45000)) return out_({ ok: false, error: 'Invalid logo' });
    cfgSet_('logo', c.logo);
  }
  ['c1', 'c2'].forEach(function (k) { if (typeof c[k] === 'string' && /^#[0-9a-fA-F]{6}$/.test(c[k])) cfgSet_(k, c[k]); });
  function clean(a, maxN, maxLen) {
    return (a || []).slice(0, maxN).map(function (s) { return String(s).trim().substr(0, maxLen); }).filter(function (s) { return s; });
  }
  if (c.sites) cfgSet_('sites', JSON.stringify(clean(c.sites, 50, 40)));
  if (c.shifts) { var sh = clean(c.shifts, 8, 12); if (sh.length) cfgSet_('shifts', JSON.stringify(sh)); }
  audit_(sup.id, 'setConfig');
  return out_({ ok: true, cfg: publicCfg_() });
}

function purgeOld() {
  var days = Number(cfgGet_('retention_days')) || 180;
  var sh = ss_().getSheetByName('Results');
  var data = sh.getDataRange().getValues();
  var cutoff = Date.now() - days * 86400000;
  for (var i = data.length - 1; i >= 1; i--) {
    var t = new Date(data[i][0]).getTime();
    if (t && t < cutoff) sh.deleteRow(i + 1);
  }
}
