(function(){
  var d=document.body.dataset, wa=d.wa||'', api=d.cotacao||'', bot=d.bot||wa;
  // v1.102 (D-192): origem de todas as redes (?via= ou utm_source, com apelidos); guardada só nesta aba, para o pedido feito em outra página também levar
  var viaNotes={"instagram":"Veio pelo Instagram.","tiktok":"Veio pelo TikTok.","facebook":"Veio pelo Facebook.","threads":"Veio pelo Threads.","youtube":"Veio pelo YouTube.","linkedin":"Veio pelo LinkedIn.","gbp":"Veio pelo Google Perfil da Empresa.","whatsapp":"Veio pelo WhatsApp.","x":"Veio pelo X (Twitter)."}, viaAlias={"ig":"instagram","insta":"instagram","fb":"facebook","tt":"tiktok","yt":"youtube","li":"linkedin","gmb":"gbp","perfil":"gbp","google-perfil":"gbp","wpp":"whatsapp","wa":"whatsapp","zap":"whatsapp","twitter":"x"}, via='';try{var vq=new URLSearchParams(location.search),vk=String(vq.get('via')||vq.get('utm_source')||'').toLowerCase().trim(),vs=null;try{vs=window.sessionStorage}catch(e){}if(!vk&&vs)vk=vs.getItem('dbx-via')||'';var own=function(o,x){return Object.prototype.hasOwnProperty.call(o,x)?o[x]:''};vk=own(viaAlias,vk)||vk;if(!own(viaNotes,vk)){vk=vk.split(/[-_]/)[0];vk=own(viaAlias,vk)||vk}via=own(viaNotes,vk)||'';if(via&&vs)vs.setItem('dbx-via',vk)}catch(e){}
  // v1.60 (D-140) A11: origem da visita (utm_source, ?via= ou o site de onde veio), guardada só nesta aba (sem cookie)
  var src='';try{var qs=new URLSearchParams(location.search),rh=document.referrer?new URL(document.referrer).hostname:'';src=String(qs.get('utm_source')||qs.get('via')||(rh&&rh!==location.hostname?rh.replace(/^www\./,''):'')||'').toLowerCase().replace(/[^a-z0-9_.-]/g,'').slice(0,30);var ss=window.sessionStorage;if(ss){if(src)ss.setItem('dbx-src',src);else src=ss.getItem('dbx-src')||''}}catch(e){}
  function waText(f){var v=function(n){var e=f.elements[n];return e?String(e.value||'').trim():''};var t=['Olá! Quero uma cotação'+(v('service')?' de '+v('service').toLowerCase():' de passagem')+'.','De: '+v('origin'),'Para: '+v('destination'),'Ida: '+br(v('depart_date'))];if(v('return_date'))t.push('Volta: '+br(v('return_date')));if(/encomend/i.test(v('service'))){t[3]='Envio: '+br(v('depart_date'));t.push('O que vai: '+v('parcel_item'));t.push('Tamanho ou peso: '+v('parcel_size'))}else t.push('Passageiros: '+(v('pax')||'1'));var ps=f.elements.period_key;if(ps&&ps.value&&!ps.disabled)t.push('Horário: '+ps.options[ps.selectedIndex].text);pkv(f).forEach(function(x){t.push(x[0]+': '+x[1])});t.push('Nome: '+v('name'));if(via)t.push(via);return t.join('\n')}
  // v1.123 (D-216): perguntas do pacote e da hospedagem, criadas só quando o serviço pede
  var PK=[{"k":"transport","l":"Como vai viajar","o":["Ônibus","Carro próprio","Avião","Ainda não sei"],"y":"pacote"},{"k":"lodging","l":"Tipo de hospedagem","o":["Pousada","Hotel","Resort","Tanto faz"]},{"k":"meals","l":"Refeições","o":["Só café da manhã","Meia pensão","Pensão completa","Tudo incluído","Tanto faz"]},{"k":"budget","l":"Valor por pessoa","o":["Até R$ 500","R$ 500 a R$ 1.000","R$ 1.000 a R$ 2.000","Acima de R$ 2.000","Prefiro ver opções"]},{"k":"flex","l":"Datas flexíveis?","o":["Sim","Não"]},{"k":"near","l":"Perto da praia ou do centro faz diferença?","o":["Sim","Não"],"x":1},{"k":"occasion","l":"Ocasião especial","o":["Aniversário","Lua de mel","Férias em família","Outra"],"x":1,"y":"pacote"},{"k":"kids","l":"Crianças (quantas e idades)","t":60,"x":1}],PKD=["Recebemos o seu pedido.","Até o próximo dia útil, mandamos até 3 opções no seu WhatsApp.","Cada opção vem com o preço e a taxa de serviço separada.","Atendimento: de segunda a sexta, das 8h às 19h, e sábado, das 8h às 13h."];
  function pks(f){var e=f.elements.service,v=e?String(e.value||''):'';return /pacote/i.test(v)?'pacote':/hosped|hotel/i.test(v)?'hospedagem':''}
  function pkv(f){var o=[];if(!pks(f))return o;PK.forEach(function(q){var e=f.elements['pk_'+q.k];if(e&&!e.disabled&&String(e.value||'').trim())o.push([q.l.replace(/[?]$/,''),String(e.value).trim(),q.k])});return o}
  function pkSet(f){var s=pks(f),box=f.querySelector('.qf-pk'),pe=f.elements.period_key;
    if(pe&&pe.parentNode){pe.disabled=!!s||f.classList.contains('is-parcel');pe.parentNode.style.display=s?'none':''}
    if(box&&box.getAttribute('data-s')!==s){box.parentNode.removeChild(box);box=null}
    if(!s||box)return s;
    var h='';PK.forEach(function(q){if(q.y&&q.y!==s)return;h+='<label>'+q.l+(q.x?' <small>(opcional)</small>':'')+(q.t?'<input name="pk_'+q.k+'" maxlength="'+q.t+'" placeholder="Ex.: 2, de 4 e 7 anos">':'<select name="pk_'+q.k+'"'+(q.x?'':' required')+'><option value="">'+(q.x?'Se quiser, escolha':'Escolha')+'</option>'+q.o.map(function(o){return '<option>'+o+'</option>'}).join('')+'</select>')+'</label>'});
    box=document.createElement('div');box.className='g qf-pk';box.setAttribute('data-s',s);box.innerHTML=h;f.insertBefore(box,f.querySelector('.hp'));return s}
  function pkDone(f){var b=document.createElement('div');b.className='msg ok';b.setAttribute('role','status');b.innerHTML=PKD.join('<br>');f.innerHTML='<b class="t" style="font-size:1.7rem;color:var(--navy)">Pedido enviado</b>';f.appendChild(b);if(f.scrollIntoView)f.scrollIntoView({block:'start'})}
  function br(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);return m?m[3]+'/'+m[2]+'/'+m[1]:s}
  function toWa(f){ping('quote','wa');if(wa)location.href='https://wa.me/55'+wa+'?text='+encodeURIComponent(waText(f))}
  function show(f,cls,txt){var m=f.querySelector('.msg');if(m){m.className='msg '+cls;m.textContent=txt}}
  // v1.41 (D-117): contagem de acessos sem cookie e sem dado de quem visita (página, domínio de origem, celular ou computador)
  // v1.49 (D-128): a rede do link clicado (a mesma regra de networkOf, em parceiros.mjs)
  function net(u){var h='';try{h=new URL(u,location.href).hostname.toLowerCase()}catch(e){return 'outro'}if(/(^|\.)stay22\.com$/.test(h))return 'stay22';if(/(^|\.)(anrdoezrs\.net|jdoqocy\.com|tkqlhce\.com|dpbolvw\.net|kqzyfj\.com|emjcd\.com|apmebf\.com|ftjcfx\.com|lduhtrp\.net|qksrv\.net|tqlkg\.com|afcyhf\.com)$/.test(h))return 'cj';if(/lomadee|(^|\.)lmd\./.test(h))return 'lomadee';if(/(^|\.)(tp\.media|tpo\.\w+)$|travelpayouts/.test(h))return 'travelpayouts';if(/(^|\.)(meli\.la|mercadolivre\.com\.br|mercadolibre\.com)$/.test(h))return 'mercadolivre';if(/(^|\.)(shopee\.com\.br|shope\.ee|s\.shopee\.com\.br)$/.test(h))return 'shopee';if(/(^|\.)(amazon\.com\.br|amazon\.com|amzn\.to)$/.test(h))return 'amazon';return 'outro'}
  // v1.53 (D-133): conversões no Google (só o tipo do clique; nenhum dado do pedido vai para o Google)
  var gcv={};try{gcv=JSON.parse(document.body.getAttribute('data-gconv')||'{}')}catch(e){}
  var GEV={quote:'pedido_cotacao',wa:'clique_whatsapp',buy:'comprar_passagem'};
  // v1.60 (D-140) A11: o clique no WhatsApp separa o Descontão (assistente) do agente (uma pessoa), com a página e a origem
  function gt(t,a){try{if(typeof window.gtag!=='function'||!GEV[t])return;var n=t==='wa'?(a==='bot'?'clique_whatsapp_descontao':'clique_whatsapp_agente'):GEV[t];window.gtag('event',n,{page_path:location.pathname,origem:src||'direto',transport_type:'beacon'});if(gcv[t])window.gtag('event','conversion',{send_to:gcv[t],transport_type:'beacon'})}catch(e){}}
  function waKind(u){var m=/wa\.me\/55(\d+)/.exec(u),n=m?m[1]:'';if(n&&n===bot&&n!==wa)return 'bot';if(n&&n===wa&&n!==bot)return 'agent';var t='';try{t=decodeURIComponent((u.split('text=')[1]||'').replace(/\+/g,' '))}catch(e){}return /Descont[aã]o|comprar uma passagem pelo WhatsApp/i.test(t)?'bot':'agent'}
  function ping(t,a){gt(t,a);try{if(!api||!navigator.sendBeacon)return;var r='';try{var h=document.referrer?new URL(document.referrer).hostname:'';if(h&&h!==location.hostname)r=h}catch(e){}var v=src;navigator.sendBeacon(api+'/api/visita',new Blob([JSON.stringify({t:t,p:location.pathname,r:r,d:matchMedia('(max-width:768px)').matches?'m':'d',v:v,a:a||''})],{type:'text/plain'}))}catch(e){}}
  ping('pv');
  // v1.69.0 (D-151) C7: cada preço sai com o último dia em que vale (data-pv); passado esse dia (horário de Brasília), vira "Consulte"
  try{var hoje=new Date(Date.now()-108e5).toISOString().slice(0,10);Array.prototype.forEach.call(document.querySelectorAll('[data-pv]'),function(e){if(hoje>String(e.getAttribute('data-pv')||''))e.outerHTML=e.getAttribute('data-pvx')||''})}catch(e){}
  // v1.67.0 (D-148): toque na busca da Buson. Ao clicar dentro da moldura, a janela perde o foco e o foco vai para ela;
  // conta uma vez por página, sem nenhum dado de quem toca (o que acontece dentro da moldura o site não vê)
  // v1.67.1 (D-149): a moldura cresce quando o cliente usa (calendário) e volta ao tamanho da busca quando sai; nada de ler a moldura
  // v1.67.2: só abre com clique ou toque dentro dela (a janela perde o foco para a moldura), nunca ao passar o mouse; fecha com
  // clique, toque ou foco fora, Esc ou a página de volta em foco; ao abrir, rola só o necessário para o fundo ficar à vista
  // v1.87 (D-174): o widget da Buson (pesado, com os rastreadores dela) entra quando a pessoa mexe na página (v1.87.1: ou 12 s depois;
  // com 3,5 s ele ainda entrava na medição do PageSpeed)
  // de a página abrir. Antes ele carregava junto e atrasava o site inteiro no celular.
  (function(){var done=false,ev=['pointerdown','touchstart','keydown','scroll','mousemove','focusin'];function go(){if(done)return;done=true;ev.forEach(function(e){window.removeEventListener(e,go,true)});Array.prototype.forEach.call(document.querySelectorAll('iframe.buson-frame[data-src]'),function(f){var w=f.parentNode;f.addEventListener('load',function(){if(w&&w.classList)w.classList.remove('bz-wait')});f.src=f.getAttribute('data-src');f.removeAttribute('data-src');setTimeout(function(){if(w&&w.classList)w.classList.remove('bz-wait')},8000)})}if(!document.querySelector)return;Array.prototype.forEach.call(document.querySelectorAll('.bz-wait>iframe.buson-frame[src]'),function(f){setTimeout(function(){f.parentNode.classList.remove('bz-wait')},8000)});if(!document.querySelector('iframe.buson-frame[data-src]'))return;ev.forEach(function(e){window.addEventListener(e,go,{capture:true,passive:true})});var t=function(){setTimeout(go,12000)};if(document.readyState==='complete')t();else window.addEventListener('load',t)})();
  Array.prototype.forEach.call(document.querySelectorAll('.bz-wrap'),function(w){var f=w.querySelector('.buson-frame');if(!f||!w.classList)return;var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;var cl=function(){w.classList.remove('is-open')};var op=function(){if(w.classList.contains('is-open'))return;w.classList.add('is-open');if(rm)return;setTimeout(function(){var r=w.getBoundingClientRect();if(r.bottom>(window.innerHeight||document.documentElement.clientHeight)&&w.scrollIntoView)w.scrollIntoView({block:'nearest',behavior:'smooth'})},270)};window.addEventListener('blur',function(){setTimeout(function(){if(document.activeElement===f)op()},0)});window.addEventListener('focus',cl);document.addEventListener('click',function(e){if(!w.contains(e.target))cl()});document.addEventListener('focusin',function(e){if(!w.contains(e.target))cl()});document.addEventListener('keydown',function(e){if(e.key==='Escape'||e.key==='Esc')cl()})});
  var bf=document.querySelector&&document.querySelector('.buson-frame');if(bf&&window.addEventListener){var bt=false;window.addEventListener('blur',function(){setTimeout(function(){if(!bt&&document.activeElement===bf){bt=true;ping('buy','buson')}},0)})}
  // v1.50: o menu de serviços fecha ao clicar fora ou num link (antes do contador de cliques)
  if(document.querySelectorAll&&document.addEventListener)document.addEventListener('click',function(e){Array.prototype.forEach.call(document.querySelectorAll('details.dd[open]'),function(d){if(!d.contains(e.target)||(e.target.closest&&e.target.closest('.ddm a')))d.removeAttribute('open')})});
  if(document.addEventListener)document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;var u=a.getAttribute('href')||'';if(u.indexOf('https://wa.me/')===0)ping('wa',waKind(u));else if(/sponsored/.test(a.getAttribute('rel')||''))ping('aff',net(u));else if(a.closest('.prod'))ping('shop',net(u))},true);
  // v1.65.0 (D-146): destaques do topo (desliza sozinho a cada 7 s; para com o mouse, o foco ou o toque; nada sozinho para quem pediu menos movimento)
  Array.prototype.forEach.call(document.querySelectorAll('.hcar'),function(c){var t=c.querySelector('.hc-track'),ds=c.querySelectorAll('.hc-dots button'),n=ds.length,i=0,paused=false;if(!t||!n)return;var go=function(k){i=(k+n)%n;t.scrollTo({left:i*t.clientWidth,behavior:'smooth'})};t.addEventListener('scroll',function(){i=Math.round(t.scrollLeft/(t.clientWidth||1));Array.prototype.forEach.call(ds,function(d,j){d.className=j===i?'on':''})});Array.prototype.forEach.call(ds,function(d,j){d.addEventListener('click',function(){paused=true;go(j)})});var rm=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;if(!rm&&n>1){['mouseenter','focusin','touchstart'].forEach(function(e){c.addEventListener(e,function(){paused=true},{passive:true})});c.addEventListener('mouseleave',function(){paused=false});setInterval(function(){if(!paused&&!document.hidden)go(i+1)},7000)}});
  // v1.65.0 (D-146): abas da página (montadas das seções com data-tab), barra fixa de compra e galeria com contador
  Array.prototype.forEach.call(document.querySelectorAll('nav.ptabs'),function(nav){var secs=document.querySelectorAll('[data-tab][id]');if(secs.length<2){nav.parentNode.removeChild(nav);return}var f=nav.getAttribute('data-first'),h='';if(f&&document.querySelector(f))h+='<a href="'+f+'">'+nav.getAttribute('data-label')+'</a>';Array.prototype.forEach.call(secs,function(x){h+='<a href="#'+x.id+'">'+x.getAttribute('data-tab')+'</a>'});nav.innerHTML='<div class="wrap">'+h+'</div>';var hd=document.querySelector('.hd');if(hd)nav.style.top=hd.offsetHeight+'px';if(typeof IntersectionObserver!=='undefined'){var links=nav.querySelectorAll('a'),io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;Array.prototype.forEach.call(links,function(a){a.className=a.getAttribute('href')==='#'+e.target.id?'on':''})})},{rootMargin:'-40% 0px -55% 0px'});Array.prototype.forEach.call(secs,function(x){io.observe(x)})}});
  var bb=document.querySelector?document.querySelector('.buybar'):null;if(bb&&typeof IntersectionObserver!=='undefined'){document.body.className+=' has-bb';var top=document.querySelector('main > section');if(top){new IntersectionObserver(function(es){bb.className='buybar'+(es[0].isIntersecting?'':' on')}).observe(top)}}
  Array.prototype.forEach.call(document.querySelectorAll('.gal-ctl'),function(c){var sec=c.closest?c.closest('section'):null,g=sec&&sec.querySelector('.gal'),n=c.querySelector('.gal-n');if(!g)return;var items=g.children,tot=items.length,pad=function(x){return(x<10?'0':'')+x};var cur=function(){var w=items[0].getBoundingClientRect().width||1;return Math.min(tot-1,Math.round(g.scrollLeft/w))};g.addEventListener('scroll',function(){if(n)n.textContent=pad(cur()+1)+' / '+pad(tot)});Array.prototype.forEach.call(c.querySelectorAll('.gal-b'),function(b){b.addEventListener('click',function(){var i=Math.max(0,Math.min(tot-1,cur()+Number(b.getAttribute('data-dir'))));g.scrollTo({left:items[i].offsetLeft-g.offsetLeft,behavior:'smooth'})})})});
  // v1.64.0 (D-145): vídeo do YouTube só ao tocar (modo de privacidade reforçada)
  Array.prototype.forEach.call(document.querySelectorAll('a[data-yt]'),function(a){a.addEventListener('click',function(ev){if(!document.createElement)return;ev.preventDefault();var f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+a.getAttribute('data-yt')+'?autoplay=1&rel=0';f.title='Vídeo da Descontobus';f.setAttribute('allow','autoplay; encrypted-media; picture-in-picture');f.setAttribute('allowfullscreen','');a.innerHTML='';a.appendChild(f);a.removeAttribute('href')})});
  // v1.64.0 (D-145): mapa de hotéis só ao tocar; filtro de assuntos do blog
  Array.prototype.forEach.call(document.querySelectorAll('a[data-map]'),function(a){a.addEventListener('click',function(ev){var box=a.parentNode;if(!box||!document.createElement)return;ev.preventDefault();var f=document.createElement('iframe');f.src=a.getAttribute('data-map');f.title='Mapa de hotéis em '+(a.getAttribute('data-place')||'');f.loading='lazy';f.setAttribute('allowfullscreen','');f.setAttribute('referrerpolicy','strict-origin-when-cross-origin');box.style.backgroundImage='none';box.innerHTML='';box.appendChild(f)})});
  Array.prototype.forEach.call(document.querySelectorAll('.bcats button'),function(b){b.addEventListener('click',function(){var c=b.getAttribute('data-cat');Array.prototype.forEach.call(document.querySelectorAll('.bcats button'),function(x){x.className=x===b?'on':''});Array.prototype.forEach.call(document.querySelectorAll('.bgrid [data-cat]'),function(x){x.hidden=!!c&&x.getAttribute('data-cat')!==c})})});
  // v1.62.0 (D-143): no celular, as seções do rodapé começam fechadas
  try{if(window.matchMedia&&matchMedia('(max-width:640px)').matches)Array.prototype.forEach.call(document.querySelectorAll('details.fc'),function(d){d.removeAttribute('open')})}catch(e){}
  // v1.61.0 (D-142): botão "Menu" do celular
  var hd=document.querySelector?document.querySelector('.hd'):null,tg=hd&&hd.querySelector('.mtog');
  if(tg&&hd.classList){document.body.className+=' js-nav';
    var setNav=function(o){hd.classList.toggle('open',o);tg.setAttribute('aria-expanded',o?'true':'false');tg.setAttribute('aria-label',o?'Fechar o menu':'Abrir o menu');var t=tg.querySelector('span');if(t)t.textContent=o?'Fechar':'Menu'};
    tg.addEventListener('click',function(){setNav(!hd.classList.contains('open'))});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&hd.classList.contains('open')){setNav(false);tg.focus()}});
    document.addEventListener('click',function(e){if(!hd.classList.contains('open'))return;var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!hd.contains(e.target)||(a&&hd.contains(a)))setNav(false)});
  }
  // v1.36: trocar origem e destino; atalhos Hoje e Amanhã
  Array.prototype.forEach.call(document.querySelectorAll('form.sc'),function(s){
    var sw=s.querySelector('.swap');if(sw)sw.addEventListener('click',function(){var a=s.elements.origin,b=s.elements.destination,t=a.value;a.value=b.value;b.value=t});
    Array.prototype.forEach.call(s.querySelectorAll('[data-d]'),function(b){b.addEventListener('click',function(ev){ev.preventDefault();var d=new Date();d.setDate(d.getDate()+Number(b.getAttribute('data-d')));var z=function(n){return(n<10?'0':'')+n};s.elements.depart_date.value=d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())})});
  });
  // v1.35: "Comprar passagem" abre o WhatsApp do Descontão (assistente) com a rota, a data e os passageiros
  Array.prototype.forEach.call(document.querySelectorAll('form.sb'),function(s){
    s.addEventListener('submit',function(ev){
      ev.preventDefault();if(!s.reportValidity())return;ping('buy');
      if(!bot){var q=document.querySelector('#cotar form.qf');if(!q)return;['origin','destination','depart_date','pax'].forEach(function(n){var a=s.elements[n],b=q.elements[n];if(a&&b&&a.value)b.value=a.value});document.getElementById('cotar').scrollIntoView({behavior:'smooth'});return}
      var v=function(n){var e=s.elements[n];return e?String(e.value||'').trim():''};var p=Number(v('pax')||1);
      var t='Olá, Descontão! Quero comprar passagem de '+v('origin')+' para '+v('destination')+', ida em '+br(v('depart_date'))+(v('return_date')?', volta em '+br(v('return_date')):'')+', '+p+(p>1?' passageiros':' passageiro')+'.';
      if(via)t+='\n'+via;
      location.href='https://wa.me/55'+bot+'?text='+encodeURIComponent(t);
    });
  });
  // v1.46 (D-123): página de trechos · busca pelo nome da cidade e "Comprar" abre o WhatsApp com o trecho
  var trq=document.querySelector?document.querySelector('.trq'):null;
  if(trq){var nk=function(x){return String(x||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim()};
    var run=function(){var q=nk(trq.value),fu=document.querySelector('.trf-uf'),fc=document.querySelector('.trf-co'),uf=fu?fu.value:'',co=fc?nk(fc.value):'',any=false,cnt=0;
      Array.prototype.forEach.call(document.querySelectorAll('.trh'),function(h){var hv=false;
        Array.prototype.forEach.call(h.querySelectorAll('.tru'),function(g){var n=0;Array.prototype.forEach.call(g.querySelectorAll('li'),function(li){var ok=(!q||li.getAttribute('data-q').indexOf(q)>=0||nk(g.getAttribute('data-uf')).indexOf(q)>=0)&&(!uf||g.getAttribute('data-code')===uf)&&(!co||('|'+(li.getAttribute('data-co')||'')+'|').indexOf('|'+co+'|')>=0);li.hidden=!ok;if(ok){n++;cnt++}});g.hidden=!n;g.open=!!((q||uf||co)&&n);if(n)hv=true});
        h.hidden=!hv;if(hv)any=true});
      var no=document.querySelector('.trno');if(no)no.className='trno'+(any?'':' on');var tn=document.querySelector('.trf-n');if(tn)tn.textContent=(q||uf||co)?cnt+(cnt===1?' trecho':' trechos'):''};
    trq.addEventListener('input',run);Array.prototype.forEach.call(document.querySelectorAll('.trf select'),function(x){x.addEventListener('change',run)})}
  Array.prototype.forEach.call(document.querySelectorAll('a[data-tr-o]'),function(a){a.addEventListener('click',function(ev){if(!bot)return;ev.preventDefault();ping('buy');var t='Olá, Descontão! Quero comprar passagem de '+a.getAttribute('data-tr-o')+' para '+a.getAttribute('data-tr-d')+'.';if(via)t+='\n'+via;location.href='https://wa.me/55'+bot+'?text='+encodeURIComponent(t)})});
  // v1.50 (D-130): cartões entram suavemente ao aparecer na tela; o menu de serviços fecha ao clicar fora ou num link
  if(document.querySelectorAll&&typeof IntersectionObserver!=='undefined'&&!(typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches)){var rvs=document.querySelectorAll('.rv');if(rvs.length){document.body.className+=' js-rv';var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.className+=' on';io.unobserve(x.target)}})},{rootMargin:'0px 0px -40px 0px'});Array.prototype.forEach.call(rvs,function(el){io.observe(el)})}}
  // v1.122.0 (D-215): Origem e Destino da cotação sugerem cidades: primeiro as das rotas que já vendemos (no próprio formulário),
  // depois as do Brasil com UF (assets/cidades.json, baixado uma vez, só quando o cliente toca no campo). Digitar livre continua valendo.
  Array.prototype.forEach.call(document.querySelectorAll('form.qf[data-rc]'),function(f){
    var rc=[];try{rc=JSON.parse(f.getAttribute('data-rc')||'[]')}catch(e){}
    var fd=function(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase()};
    var url=f.getAttribute('data-cities'),all=null,allF=null,ld=null;
    var load=function(){if(ld||!url||typeof fetch!=='function')return ld||Promise.resolve();ld=fetch(url).then(function(r){return r.ok?r.json():[]}).then(function(l){all=Array.isArray(l)?l:[];allF=all.map(fd)}).catch(function(){all=[];allF=[]});return ld};
    var match=function(q){var k=fd(q),out=[],seen={},max=8;
      rc.forEach(function(c){var x=fd(c);if(out.length<max&&!seen[x]&&(!k||x.indexOf(k)===0||x.indexOf(' '+k)>=0)){seen[x]=1;out.push(c)}});
      if(k.length<2||!all)return out;var p=[],s2=[];
      for(var i=0;i<all.length&&out.length+p.length<max;i++){var x=allF[i];if(seen[x]||seen[x.split(' - ')[0]])continue;if(x.indexOf(k)===0)p.push(all[i]);else if(s2.length<max&&x.indexOf(' '+k)>=0)s2.push(all[i])}
      return out.concat(p,s2).slice(0,max)};
    var small=function(){return window.matchMedia&&matchMedia('(max-width:640px)').matches};
    ['origin','destination'].forEach(function(n){var t=f.elements[n],ul=t&&document.getElementById(t.getAttribute('aria-controls')||'');if(!ul)return;
      var hide=function(){ul.hidden=true;t.setAttribute('aria-expanded','false');t.removeAttribute('aria-activedescendant')};
      var show=function(){if(document.activeElement!==t)return;var it=match(t.value);ul.innerHTML='';it.forEach(function(c,i){var li=document.createElement('li');li.setAttribute('role','option');li.id=ul.id+'-'+i;li.setAttribute('aria-selected','false');li.setAttribute('data-v',c);li.textContent=c;ul.appendChild(li)});if(!it.length||(it.length===1&&fd(it[0])===fd(t.value)))return hide();ul.hidden=false;t.setAttribute('aria-expanded','true')};
      var pick=function(v){t.value=v;hide()};
      t.addEventListener('focus',function(){show();load().then(show);if(small()&&t.scrollIntoView)setTimeout(function(){if(document.activeElement===t)t.scrollIntoView({block:'start'})},300)});
      t.addEventListener('input',function(){show();if(!all)load().then(show)});
      t.addEventListener('blur',function(){setTimeout(function(){if(document.activeElement!==t)hide()},150)});
      t.addEventListener('keydown',function(e){var o=ul.hidden?[]:ul.querySelectorAll('li');if(!o.length)return;var i=-1;Array.prototype.forEach.call(o,function(x,j){if(x.className==='on')i=j});
        if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();i=e.key==='ArrowDown'?(i+1)%o.length:(i<=0?o.length-1:i-1);Array.prototype.forEach.call(o,function(x,j){x.className=j===i?'on':'';x.setAttribute('aria-selected',j===i?'true':'false')});t.setAttribute('aria-activedescendant',o[i].id);if(o[i].scrollIntoView)o[i].scrollIntoView({block:'nearest'})}
        else if(e.key==='Enter'&&i>=0){e.preventDefault();pick(o[i].getAttribute('data-v'))}
        else if(e.key==='Escape'||e.key==='Esc'){e.preventDefault();hide()}});
      ul.addEventListener('mousedown',function(e){e.preventDefault()});
      ul.addEventListener('click',function(e){e.preventDefault();var li=e.target&&e.target.closest&&e.target.closest('li[data-v]');if(li)pick(li.getAttribute('data-v'))})});
  });
  Array.prototype.forEach.call(document.querySelectorAll('form.qf'),function(f){
    // v1.101 (D-191): encomenda tem campos próprios; trocar o serviço troca os campos (e o que é obrigatório)
    var sel=f.elements&&f.elements.service;
    function parcel(){var p=!!(sel&&/encomend/i.test(sel.value||''));if(f.classList)f.classList.toggle('is-parcel',p);['parcel_item','parcel_size'].forEach(function(n){var e=f.elements[n];if(e)e.disabled=!p});['return_date','pax','period_key'].forEach(function(n){var e=f.elements[n];if(e)e.disabled=p});return p}
    if(sel&&sel.tagName==='SELECT'&&sel.addEventListener)sel.addEventListener('change',function(){parcel();pkSet(f)});
    pkSet(f);
    f.addEventListener('submit',function(ev){
      ev.preventDefault();
      if(!f.reportValidity())return;
      var get=function(n){var e=f.elements[n];return e?String(e.value||'').trim():''};
      var per={manha:'manha',tarde:'tarde',noite:'noite',madrugada:'madrugada'}[get('period_key')];
      var pc=parcel(),pk=pkSet(f),pkl=pkv(f);
      var body={name:get('name'),phone:get('phone'),origin:get('origin'),destination:get('destination'),depart_date:get('depart_date'),return_date:pc?null:(get('return_date')||null),pax:pc?1:Number(get('pax')||1),periods:pc||pk||!per?[]:[per],site:get('website')};if(pk){body.pkg={};pkl.forEach(function(x){body.pkg[x[2]]=x[1]})}
      if(get('service'))body.service=get('service');if(location.pathname)body.page=location.pathname;if(pc)body.parcel={item:get('parcel_item'),size:get('parcel_size')};
      var obs=[get('service')?'Serviço: '+get('service'):'',pc?'Encomenda: '+[get('parcel_item'),get('parcel_size')].filter(Boolean).join(', '):'',pk&&pkl.length?'Pacote: '+pkl.map(function(x){return x[1]}).join(', '):'',via].filter(Boolean).join(' · ');if(obs)body.obs=obs.slice(0,300);
      if(!api){toWa(f);return}
      var b=f.querySelector('button[type=submit]');if(b){b.disabled=true;b.textContent='Enviando...'}
      fetch(api+'/api/solicitar',{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(body)})
        .then(function(r){return r.json().then(function(j){return {ok:r.ok,status:r.status,j:j}})})
        .then(function(x){
          if(x.ok&&x.j.link&&pk){ping('quote','site');pkDone(f);return}
          if(x.ok&&x.j.link){ping('quote','site');show(f,'ok','Pedido recebido! Abrindo a sua página da cotação...');location.href=api+x.j.link;return}
          if(x.status===404||x.status===403||x.status===429){toWa(f);return}
          show(f,'err',(x.j&&x.j.error)||'Não deu para enviar agora. Tente de novo ou fale pelo WhatsApp.');
          if(b){b.disabled=false;b.textContent=b.dataset.label}
        })
        .catch(function(){toWa(f)});
    });
  });
})();
