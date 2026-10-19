(function(){
  var d=document.body.dataset, wa=d.wa||'', api=d.cotacao||'', bot=d.bot||wa;
  var viaNotes={"instagram":"Veio pelo link da bio do Instagram."}, via='';try{via=viaNotes[new URLSearchParams(location.search).get('via')]||''}catch(e){}
  // v1.60 (D-140) A11: origem da visita (utm_source, ?via= ou o site de onde veio), guardada só nesta aba (sem cookie)
  var src='';try{var qs=new URLSearchParams(location.search),rh=document.referrer?new URL(document.referrer).hostname:'';src=String(qs.get('utm_source')||qs.get('via')||(rh&&rh!==location.hostname?rh.replace(/^www\./,''):'')||'').toLowerCase().replace(/[^a-z0-9_.-]/g,'').slice(0,30);var ss=window.sessionStorage;if(ss){if(src)ss.setItem('dbx-src',src);else src=ss.getItem('dbx-src')||''}}catch(e){}
  function waText(f){var v=function(n){var e=f.elements[n];return e?String(e.value||'').trim():''};var t=['Olá! Quero uma cotação'+(v('service')?' de '+v('service').toLowerCase():' de passagem')+'.','De: '+v('origin'),'Para: '+v('destination'),'Ida: '+br(v('depart_date'))];if(v('return_date'))t.push('Volta: '+br(v('return_date')));t.push('Passageiros: '+(v('pax')||'1'));var ps=f.elements.period_key;if(ps&&ps.value)t.push('Horário: '+ps.options[ps.selectedIndex].text);t.push('Nome: '+v('name'));if(via)t.push(via);return t.join('\n')}
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
  // v1.50: o menu de serviços fecha ao clicar fora ou num link (antes do contador de cliques)
  if(document.querySelectorAll&&document.addEventListener)document.addEventListener('click',function(e){Array.prototype.forEach.call(document.querySelectorAll('details.dd[open]'),function(d){if(!d.contains(e.target)||(e.target.closest&&e.target.closest('.ddm a')))d.removeAttribute('open')})});
  if(document.addEventListener)document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;var u=a.getAttribute('href')||'';if(u.indexOf('https://wa.me/')===0)ping('wa',waKind(u));else if(/sponsored/.test(a.getAttribute('rel')||''))ping('aff',net(u));else if(a.closest('.prod'))ping('shop',net(u))},true);
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
    trq.addEventListener('input',function(){var q=nk(trq.value),any=false;
      Array.prototype.forEach.call(document.querySelectorAll('.trh'),function(h){var hv=false;
        Array.prototype.forEach.call(h.querySelectorAll('.tru'),function(g){var n=0;Array.prototype.forEach.call(g.querySelectorAll('li'),function(li){var ok=!q||li.getAttribute('data-q').indexOf(q)>=0||nk(g.getAttribute('data-uf')).indexOf(q)>=0;li.hidden=!ok;if(ok)n++});g.hidden=!n;g.open=!!(q&&n);if(n)hv=true});
        h.hidden=!hv;if(hv)any=true});
      var no=document.querySelector('.trno');if(no)no.className='trno'+(any?'':' on')})}
  Array.prototype.forEach.call(document.querySelectorAll('a[data-tr-o]'),function(a){a.addEventListener('click',function(ev){if(!bot)return;ev.preventDefault();ping('buy');var t='Olá, Descontão! Quero comprar passagem de '+a.getAttribute('data-tr-o')+' para '+a.getAttribute('data-tr-d')+'.';if(via)t+='\n'+via;location.href='https://wa.me/55'+bot+'?text='+encodeURIComponent(t)})});
  // v1.50 (D-130): cartões entram suavemente ao aparecer na tela; o menu de serviços fecha ao clicar fora ou num link
  if(document.querySelectorAll&&typeof IntersectionObserver!=='undefined'&&!(typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches)){var rvs=document.querySelectorAll('.rv');if(rvs.length){document.body.className+=' js-rv';var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.className+=' on';io.unobserve(x.target)}})},{rootMargin:'0px 0px -40px 0px'});Array.prototype.forEach.call(rvs,function(el){io.observe(el)})}}
  Array.prototype.forEach.call(document.querySelectorAll('form.qf'),function(f){
    f.addEventListener('submit',function(ev){
      ev.preventDefault();
      if(!f.reportValidity())return;
      if(!f.elements.consent.checked){show(f,'err','Marque que concorda com o uso dos dados para a cotação.');return}
      var get=function(n){var e=f.elements[n];return e?String(e.value||'').trim():''};
      var per={manha:'manha',tarde:'tarde',noite:'noite',madrugada:'madrugada'}[get('period_key')];
      var body={name:get('name'),phone:get('phone'),origin:get('origin'),destination:get('destination'),depart_date:get('depart_date'),return_date:get('return_date')||null,pax:Number(get('pax')||1),periods:per?[per]:[],consent:true,site:get('website')};var obs=[get('service')?'Serviço: '+get('service'):'',via].filter(Boolean).join(' · ');if(obs)body.obs=obs;
      if(!api){toWa(f);return}
      var b=f.querySelector('button[type=submit]');if(b){b.disabled=true;b.textContent='Enviando...'}
      fetch(api+'/api/solicitar',{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(body)})
        .then(function(r){return r.json().then(function(j){return {ok:r.ok,status:r.status,j:j}})})
        .then(function(x){
          if(x.ok&&x.j.link){ping('quote','site');show(f,'ok','Pedido recebido! Abrindo a sua página da cotação...');location.href=api+x.j.link;return}
          if(x.status===404||x.status===403||x.status===429){toWa(f);return}
          show(f,'err',(x.j&&x.j.error)||'Não deu para enviar agora. Tente de novo ou fale pelo WhatsApp.');
          if(b){b.disabled=false;b.textContent=b.dataset.label}
        })
        .catch(function(){toWa(f)});
    });
  });
})();
