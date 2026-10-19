(function(){
var DQ=String.fromCharCode(34),NL=String.fromCharCode(10);
function Q(s){return String(s).split('`').join(DQ)}
function esc(s){return String(s).split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;').split(DQ).join('&quot;').split('`').join('&#96;')}
var mem={cfg:null,queue:[]};
function ld(){try{var r=localStorage.getItem('bss3');if(r){var o=JSON.parse(r);for(var k in o)mem[k]=o[k]}}catch(e){}}
function sv(){try{localStorage.setItem('bss3',JSON.stringify(mem))}catch(e){}}
ld();if(!mem.queue)mem.queue=[];
var cfg={logo:'',c1:'#9e1b21',c2:'#f2b632',sites:[],shifts:['A','B','C'],consent:{}};
function mergeCfg(o){if(!o)return;['logo','c1','c2'].forEach(function(k){if(typeof o[k]==='string')cfg[k]=o[k]});if(o.sites&&o.sites.length!==undefined)cfg.sites=o.sites;if(o.shifts&&o.shifts.length)cfg.shifts=o.shifts;if(o.consent)cfg.consent=o.consent}
mergeCfg(mem.cfg);
var main=document.getElementById('main'),prog=document.getElementById('prog'),hud=document.getElementById('hud'),logo=document.getElementById('logo');
var L='en',IND='CB',P={name:'',shift:'',site:'',consent:0},list,idx,tr,stc,miss,unsafe,tmr,locked,CUR='';
var API='PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE',KEY='CHANGE_ME_SUBMIT_KEY';
var CONS={
en:'I agree that my name or ID may be saved with my result so my supervisor can arrange training support. Results are used for training and safety learning, not for discipline. Leave this unticked to play anonymously.',
hi:'मैं सहमत हूँ कि मेरा नाम या आईडी मेरे नतीजे के साथ सेव हो ताकि सुपरवाइज़र ट्रेनिंग में मदद कर सके। नतीजे सिर्फ़ ट्रेनिंग और सुरक्षा सीख के लिए हैं, अनुशासनात्मक कार्रवाई के लिए नहीं। टिक न करें तो आप गुमनाम खेल सकते हैं।',
ta:'என் முடிவுடன் என் பெயர் அல்லது எண் சேமிக்கப்படுவதற்கு நான் சம்மதிக்கிறேன்; இதனால் மேற்பார்வையாளர் பயிற்சி உதவி ஏற்பாடு செய்ய முடியும். முடிவுகள் பயிற்சிக்கும் பாதுகாப்புக் கற்றலுக்கும் மட்டுமே, ஒழுங்கு நடவடிக்கைக்கு அல்ல. டிக் செய்யாவிட்டால் பெயர் குறிப்பிடாமல் விளையாடலாம்.'};
function theme(){document.documentElement.style.setProperty('--brand',cfg.c1);document.documentElement.style.setProperty('--gold',cfg.c2);
 logo.innerHTML=Q((cfg.logo?'<img src=`'+esc(cfg.logo)+'` alt=`logo`>':'<span class=`wm`>bru</span>')+'<span class=`sub`>Shift Safe</span>')}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*i),t=a[i];a[i]=a[j];a[j]=t}return a}
function el(h){CUR='';main.innerHTML=Q(h);window.scrollTo(0,0)}
function readP(){var a=document.getElementById('pn'),b=document.getElementById('ps'),c=document.getElementById('pt'),d=document.getElementById('cs');if(a){P.name=a.value;P.shift=b.value;P.site=c.value;P.consent=d&&d.checked?1:0}}
function home(){
 clearInterval(tmr);theme();prog.style.width='0';hud.textContent='';var u=UI[L];
 if(!P.shift)P.shift=cfg.shifts[0];
 var h='<div class=`card`><h1>'+u.sub+'</h1><div>'+u.tag+'</div></div>';
 h+='<div class=`card`><b>'+u.lang+'</b><div><button class=`sm'+(L==='en'?' on':'')+'` data-l=`en`>English</button><button class=`sm'+(L==='hi'?' on':'')+'` data-l=`hi`>हिन्दी</button><button class=`sm'+(L==='ta'?' on':'')+'` data-l=`ta`>தமிழ்</button></div></div>';
 h+='<div class=`card`><b>'+u.ind+'</b>';
 ['CB','LG','AU','MX'].forEach(function(k){var ic={CB:'🏭',LG:'🚜',AU:'🤖',MX:'🔀'}[k];h+='<button class=`chip'+(IND===k?' on':'')+'` data-i=`'+k+'`>'+ic+' '+u.I[k]+'</button>'});
 h+='</div><div class=`card`><input id=`pn` placeholder=`'+esc(u.name)+'` value=`'+esc(P.name)+'`><select id=`ps`>';
 cfg.shifts.forEach(function(s){h+='<option value=`'+esc(s)+'`>'+u.shift+' '+esc(s)+'</option>'});
 h+='</select><input id=`pt` list=`sl` placeholder=`'+esc(u.site)+'` value=`'+esc(P.site)+'`><datalist id=`sl`>';
 cfg.sites.forEach(function(s){h+='<option value=`'+esc(s)+'`></option>'});
 var ct=(cfg.consent&&cfg.consent[L])||CONS[L];
 h+='</datalist><label style=`font-size:14px;display:block;margin-top:8px`><input type=`checkbox` id=`cs`'+(P.consent?' checked':'')+'> '+esc(ct)+'</label></div>';
 h+='<button class=`big` id=`go`>'+u.start+'</button><button class=`big alt` id=`sp`>'+u.sup+'</button><p><small>'+u.note+'</small></p>';
 el(h);CUR='home';document.getElementById('ps').value=P.shift;
 var b=main.querySelectorAll('[data-l]');for(var i=0;i<b.length;i++)b[i].onclick=function(){readP();L=this.getAttribute('data-l');home()};
 b=main.querySelectorAll('[data-i]');for(i=0;i<b.length;i++)b[i].onclick=function(){readP();IND=this.getAttribute('data-i');home()};
 document.getElementById('go').onclick=function(){readP();start()};
 document.getElementById('sp').onclick=function(){readP();pinScreen()};
}
function start(){
 if(IND==='MX'){list=[];['CB','LG','AU'].forEach(function(k){list=list.concat(shuffle(SC.filter(function(s){return s.i===k})).slice(0,3))});list=shuffle(list)}
 else list=shuffle(SC.filter(function(s){return s.i===IND}));
 idx=0;unsafe=0;tr={};stc={RU:0,FR:0,FA:0,CO:0};miss=[];nextQ()}
function nextQ(){
 if(idx>=list.length)return result();
 var s=list[idx],u=UI[L],t=s.t[L];locked=false;
 prog.style.width=(idx/list.length*100)+'%';hud.textContent=(idx+1)+'/'+list.length;
 var ord=shuffle([0,1,2]);
 var h='<div class=`scene`>'+s.e+'</div><span class=`tag`>'+STN[L][s.st]+'</span><span class=`tag b`>'+CEN[L][s.ce]+'</span><h2>'+t[0]+'</h2>';
 if(s.tm)h+='<div class=`timer`><i id=`tb`></i></div><small>'+u.quick+'</small>';
 ord.forEach(function(o,n){h+='<button class=`opt` data-n=`'+n+'`><span class=`ic`>'+s.ic[o]+'</span><span>'+t[o+1]+'</span></button>'});
 h+='<div id=`fb`></div>';el(h);
 var b=main.querySelectorAll('.opt');
 for(var k=0;k<b.length;k++)(function(k){b[k].onclick=function(){answer(s,ord,k,b)}})(k);
 clearInterval(tmr);
 if(s.tm){var st=Date.now();tmr=setInterval(function(){var p=Math.max(0,1-(Date.now()-st)/10000),tb=document.getElementById('tb');if(tb)tb.style.width=(p*100)+'%';if(p<=0){clearInterval(tmr);answer(s,ord,-1,b)}},100)}
}
function answer(s,ord,k,b){
 if(locked)return;locked=true;clearInterval(tmr);var u=UI[L],pts=0,msg=u.tu+' ',t=s.t[L];
 if(k>=0){pts=s.s[ord[k]];msg=''}
 msg+=t[4];
 if(!tr[s.tr])tr[s.tr]=[0,0];tr[s.tr][0]+=pts;tr[s.tr][1]+=2;
 if(pts===0){unsafe++;stc[s.st]++;miss.push(s.id)}
 for(var i=0;i<b.length;i++){b[i].disabled=true;if(s.s[ord[i]]===2)b[i].className='opt good';else if(i===k)b[i].className='opt bad'}
 document.getElementById('fb').innerHTML=Q('<div class=`fb`>'+msg+'</div><button class=`big` id=`nx`>'+(idx===list.length-1?u.see:u.next)+'</button>');
 document.getElementById('nx').onclick=function(){idx++;nextQ()};
}
function pc(a){return a&&a[1]?Math.round(a[0]/a[1]*100):0}
function code(){var c='BRU-',a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';for(var i=0;i<6;i++)c+=a.charAt(Math.floor(Math.random()*a.length));return c}
function level(p){return p>=85?0:p>=65?1:p>=45?2:3}
function result(){
 var u=UI[L],tot=0,mx=0,k;prog.style.width='100%';hud.textContent='';
 for(k in tr){tot+=tr[k][0];mx+=tr[k][1]}
 var p=mx?Math.round(tot/mx*100):0,lv=level(p),low=null,lp=101;
 submit({ts:new Date().toISOString(),wid:wid(),n:P.consent?P.name:'',consent:P.consent?1:0,shift:P.shift,site:P.site,ind:IND,lang:L,pct:p,tr:tr,st:stc,miss:miss});
 var h='<div class=`scene`>'+['🏅','👍','📚','⚠️'][lv]+'</div><h1>'+u.lv[lv]+'</h1><div class=`card`><b>'+u.score+': '+p+'%</b><br><small>'+u.uns+': '+unsafe+' / '+list.length+'</small></div>';
 h+='<div class=`card`><b>'+u.prof+'</b>';
 TR.forEach(function(k){if(!tr[k])return;var q=pc(tr[k]);if(q<lp){lp=q;low=k}
  h+='<div class=`trait`><div class=`l`><span>'+TN[L][k]+'</span><span>'+q+'%</span></div><div class=`t`><i style=`width:'+q+'%`></i></div></div>'});
 h+='</div>';
 h+='<div class=`card`><b>'+u.sst+'</b>';
 ['RU','FR','FA','CO'].forEach(function(k){h+='<div class=`trait`><div class=`l`><span>'+STN[L][k]+'</span><span>'+stc[k]+'</span></div></div>'});
 h+='</div>';
 if(low)h+='<div class=`card`><b>'+u.foc+':</b> '+TN[L][low]+'<br><small>'+TIP[L][low]+'</small></div>';
 if(p>=45)h+='<div class=`card`><b>'+u.rew+'</b><br><small>'+u.rewt+'</small><div class=`code`>'+code()+'</div></div>';
 else h+='<div class=`card`>'+u.norew+'</div>';
 h+='<button class=`big` id=`ag`>'+u.again+'</button><button class=`big alt` id=`hm`>'+u.home+'</button>';
 el(h);document.getElementById('ag').onclick=start;document.getElementById('hm').onclick=home;
}
function configured(){return API.indexOf('http')===0}
function post(o){return fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(o)}).then(function(r){return r.json()})}
function wid(){var k='';try{k=localStorage.getItem('bss_wid')||''}catch(e){}
 if(!k){var a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';k='W-';for(var i=0;i<8;i++)k+=a.charAt(Math.floor(Math.random()*a.length));try{localStorage.setItem('bss_wid',k)}catch(e){}}return k}
var busy=false;
function flush(){
 if(!configured()||busy||!mem.queue.length)return;busy=true;
 post({a:'submit',key:KEY,rec:mem.queue[0]}).then(function(r){busy=false;if(r&&r.ok){mem.queue.shift();sv();flush()}}).catch(function(){busy=false});
}
function submit(rec){mem.queue.push(rec);sv();flush()}
window.addEventListener('online',flush);
function loadCfg(){
 if(!configured())return;
 post({a:'config'}).then(function(r){if(r&&r.ok){mergeCfg(r.cfg);mem.cfg=cfg;sv();theme();if(CUR==='home'){readP();home()}}}).catch(function(){});
}
var SUP=null;
function pinScreen(){
 var h='<div class=`card`><h3>Supervisor sign-in</h3><small>Enter your supervisor ID and registered email. A 6-digit code is sent to that email.</small>'+
 '<input id=`su` placeholder=`Supervisor ID (SUP-XXXXXX)` autocapitalize=`characters`><input id=`sm` type=`email` placeholder=`Registered email`>'+
 '<button class=`big` id=`so`>Send code</button><div id=`s2`></div><div id=`er` style=`color:#c0392b;margin-top:8px`></div></div><button class=`big alt` id=`bk`>Back</button>';
 el(h);document.getElementById('bk').onclick=home;
 function er(t){document.getElementById('er').textContent=t||''}
 if(!configured()){er('Backend not configured. Set the Apps Script URL in app.js.');return}
 document.getElementById('so').onclick=function(){
  var u=document.getElementById('su').value.trim().toUpperCase(),m=document.getElementById('sm').value.trim().toLowerCase();er('');
  post({a:'otpStart',uid:u,email:m}).then(function(r){
   if(!r.ok){er(r.error||'Could not send code');return}
   document.getElementById('s2').innerHTML=Q('<small>If the details match, a code was sent. Check spam too.</small><input id=`sc` inputmode=`numeric` maxlength=`8` placeholder=`6-digit code`><button class=`big` id=`sv`>Verify and open</button>');
   document.getElementById('sv').onclick=function(){
    er('');post({a:'otpCheck',uid:u,email:m,code:document.getElementById('sc').value.trim()}).then(function(r2){
     if(!r2.ok){er(r2.error||'Invalid code');return}
     SUP=r2;loadReport()}).catch(function(){er('Network error')})};
  }).catch(function(){er('Network error')})};
}
function loadReport(){
 el('<div class=`card`>Loading results...</div>');
 post({a:'report',token:SUP.token}).then(function(r){
  if(!r.ok){SUP=null;pinScreen();return}
  dash(r.rows)}).catch(function(){el('<div class=`card`>Network error</div><button class=`big alt` id=`bk`>Back</button>');document.getElementById('bk').onclick=home});
}
function avg(arr){return arr.length?Math.round(arr.reduce(function(a,b){return a+b},0)/arr.length):0}
function saveCfg(obj,S){
 post({a:'setConfig',token:SUP.token,cfg:obj}).then(function(r){
  if(r&&r.ok){mergeCfg(r.cfg);mem.cfg=cfg;sv();theme();dash(S)}else alert((r&&r.error)||'Not saved')}).catch(function(){alert('Network error')});
}
function resizeLogo(file,cb){
 var rd=new FileReader();rd.onload=function(){var im=new Image();im.onload=function(){
  var w=im.width,h=im.height,m=Math.min(1,320/w,100/h),c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*m));c.height=Math.max(1,Math.round(h*m));
  c.getContext('2d').drawImage(im,0,0,c.width,c.height);var d=c.toDataURL('image/png');if(d.length>45000)d=c.toDataURL('image/jpeg',0.8);
  cb(d.length>45000?'':d)};im.src=rd.result};rd.readAsDataURL(file);
}
function dash(S){
 var admin=SUP.site==='ALL';
 var h='<h3>Supervisor dashboard</h3><small>'+esc(SUP.name||'')+' ('+esc(SUP.id||'')+'), scope: '+esc(SUP.site||'')+'</small>';
 h+='<div class=`fb`>Use these results for training and support. Do not use them for discipline or ranking individuals. Groups under 5 plays are hidden.</div><br>';
 h+='<div class=`kpi`><div><b>'+S.length+'</b>plays</div><div><b>'+avg(S.map(function(x){return x.pct}))+'%</b>avg score</div><div><b>'+S.filter(function(x){return x.pct<45}).length+'</b>high risk</div></div><br>';
 var T={};S.forEach(function(x){for(var k in x.tr){if(!T[k])T[k]=[0,0];T[k][0]+=x.tr[k][0];T[k][1]+=x.tr[k][1]}});
 h+='<div class=`card`><b>Trait scores</b>';
 TR.forEach(function(k){var q=pc(T[k]);h+='<div class=`trait`><div class=`l`><span>'+TN.en[k]+'</span><span>'+(T[k]?q+'%':'-')+'</span></div><div class=`t`><i style=`width:'+q+'%`></i></div></div>'});
 h+='</div>';
 var St={RU:0,FR:0,FA:0,CO:0};S.forEach(function(x){for(var k in x.st)St[k]+=x.st[k]});
 h+='<div class=`card`><b>SafeStart states behind unsafe choices</b><table>';
 for(var k in St)h+='<tr><td>'+STN.en[k]+'</td><td>'+St[k]+'</td></tr>';
 h+='</table></div>';
 function grp(key,lab){var g={};S.forEach(function(x){var v=x[key]||'-';(g[v]=g[v]||[]).push(x.pct)});var r='<div class=`card`><b>'+lab+'</b><table><tr><th></th><th>Plays</th><th>Avg</th></tr>';for(var v in g){var ok=g[v].length>=5;r+='<tr><td>'+esc(key==='ind'?(UI.en.I[v]||v):v)+'</td><td>'+g[v].length+'</td><td>'+(ok?avg(g[v])+'%':'hidden (&lt;5)')+'</td></tr>'}return r+'</table></div>'}
 h+=grp('shift','By shift')+grp('ind','By area')+grp('site','By site');
 var M={};S.forEach(function(x){(x.miss||[]).forEach(function(id){M[id]=(M[id]||0)+1})});
 var mk=Object.keys(M).sort(function(a,b){return M[b]-M[a]}).slice(0,5);
 h+='<div class=`card`><b>Most missed scenarios</b><table>';
 mk.forEach(function(id){var s=SC.filter(function(z){return z.id===id})[0];if(s)h+='<tr><td>'+id+'</td><td>'+esc(s.t.en[0].substr(0,70))+'...</td><td>'+M[id]+'</td></tr>'});
 if(!mk.length)h+='<tr><td>No data yet</td></tr>';
 h+='</table></div>';
 if(admin){
  h+='<div class=`card`><b>Settings for all users</b><br><small>Changes apply to every worker on their next visit.</small><br><br><b>Logo</b><input type=`file` id=`lg` accept=`image/*`><button class=`sm` id=`rl`>Use default logo</button><br><br>'+
  '<label>Primary colour <input type=`color` id=`c1` value=`'+esc(cfg.c1)+'`></label><label>Accent colour <input type=`color` id=`c2` value=`'+esc(cfg.c2)+'`></label><br><br>'+
  '<b>Sites / plants (one per line)</b><textarea id=`ss` rows=`4`>'+esc(cfg.sites.join(NL))+'</textarea>'+
  '<b>Shifts (one per line)</b><textarea id=`sh` rows=`3`>'+esc(cfg.shifts.join(NL))+'</textarea>'+
  '<button class=`big` id=`sc2`>Save settings</button></div>';
 }else h+='<div class=`card`><small>Only supervisors with access to all sites can change logo, colours, sites and shifts.</small></div>';
 h+='<button class=`big` id=`rf`>Refresh</button><button class=`big` id=`ex`>Download CSV</button><button class=`big alt` id=`lo`>Sign out</button>';
 el(h);
 document.getElementById('rf').onclick=loadReport;
 document.getElementById('lo').onclick=function(){post({a:'logout',token:SUP.token});SUP=null;home()};
 if(admin){
  document.getElementById('lg').onchange=function(e){var f=e.target.files[0];if(!f)return;resizeLogo(f,function(d){if(!d){alert('Logo too large. Use a smaller image.');return}saveCfg({logo:d},S)})};
  document.getElementById('rl').onclick=function(){saveCfg({logo:''},S)};
  document.getElementById('sc2').onclick=function(){
   function lines(id){return document.getElementById(id).value.split(NL).map(function(x){return x.trim()}).filter(function(x){return x})}
   saveCfg({c1:document.getElementById('c1').value,c2:document.getElementById('c2').value,sites:lines('ss'),shifts:lines('sh')},S)};
 }
 document.getElementById('ex').onclick=function(){
  function q(v){v=String(v==null?'':v);if(v.length&&'=+-@'.indexOf(v.charAt(0))>=0)v=String.fromCharCode(39)+v;return DQ+v.split(DQ).join(DQ+DQ)+DQ}
  var rows=['time,worker_id,name,shift,site,area,language,score,missed'];
  S.forEach(function(x){rows.push([q(x.ts),q(x.wid),q(x.n),q(x.shift),q(x.site),q(x.ind),q(x.lang),x.pct,q((x.miss||[]).join(' '))].join(','))});
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.join(NL)],{type:'text/csv'}));a.download='safe_shift_results.csv';a.click()};
}
flush();
home();
loadCfg();
})();
