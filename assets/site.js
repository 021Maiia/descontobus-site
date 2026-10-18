(function(){
  var d=document.body.dataset, wa=d.wa||'', api=d.cotacao||'', bot=d.bot||wa;
  var viaNotes={"instagram":"Veio pelo link da bio do Instagram."}, via='';try{via=viaNotes[new URLSearchParams(location.search).get('via')]||''}catch(e){}
  function waText(f){var v=function(n){var e=f.elements[n];return e?String(e.value||'').trim():''};var t=['Olá! Quero uma cotação'+(v('service')?' de '+v('service').toLowerCase():' de passagem')+'.','De: '+v('origin'),'Para: '+v('destination'),'Ida: '+br(v('depart_date'))];if(v('return_date'))t.push('Volta: '+br(v('return_date')));t.push('Passageiros: '+(v('pax')||'1'));var ps=f.elements.period_key;if(ps&&ps.value)t.push('Horário: '+ps.options[ps.selectedIndex].text);t.push('Nome: '+v('name'));if(via)t.push(via);return t.join('\n')}
  function br(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);return m?m[3]+'/'+m[2]+'/'+m[1]:s}
  function toWa(f){ping('wa');if(wa)location.href='https://wa.me/55'+wa+'?text='+encodeURIComponent(waText(f))}
  function show(f,cls,txt){var m=f.querySelector('.msg');if(m){m.className='msg '+cls;m.textContent=txt}}
  // v1.41 (D-117): contagem de acessos sem cookie e sem dado de quem visita (página, domínio de origem, celular ou computador)
  // v1.49 (D-128): a rede do link clicado (a mesma regra de networkOf, em parceiros.mjs)
  function net(u){var h='';try{h=new URL(u,location.href).hostname.toLowerCase()}catch(e){return 'outro'}if(/(^|\.)stay22\.com$/.test(h))return 'stay22';if(/(^|\.)(anrdoezrs\.net|jdoqocy\.com|tkqlhce\.com|dpbolvw\.net|kqzyfj\.com|emjcd\.com|apmebf\.com|ftjcfx\.com|lduhtrp\.net|qksrv\.net|tqlkg\.com|afcyhf\.com)$/.test(h))return 'cj';if(/lomadee|(^|\.)lmd\./.test(h))return 'lomadee';if(/(^|\.)(tp\.media|tpo\.\w+)$|travelpayouts/.test(h))return 'travelpayouts';if(/(^|\.)(meli\.la|mercadolivre\.com\.br|mercadolibre\.com)$/.test(h))return 'mercadolivre';if(/(^|\.)(shopee\.com\.br|shope\.ee|s\.shopee\.com\.br)$/.test(h))return 'shopee';if(/(^|\.)(amazon\.com\.br|amazon\.com|amzn\.to)$/.test(h))return 'amazon';return 'outro'}
  function ping(t,a){try{if(!api||!navigator.sendBeacon)return;var r='';try{var h=document.referrer?new URL(document.referrer).hostname:'';if(h&&h!==location.hostname)r=h}catch(e){}var v='';try{v=new URLSearchParams(location.search).get('via')||''}catch(e){}navigator.sendBeacon(api+'/api/visita',new Blob([JSON.stringify({t:t,p:location.pathname,r:r,d:matchMedia('(max-width:768px)').matches?'m':'d',v:v,a:a||''})],{type:'text/plain'}))}catch(e){}}
  ping('pv');
  if(document.addEventListener)document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;var u=a.getAttribute('href')||'';if(u.indexOf('https://wa.me/')===0)ping('wa');else if(/sponsored/.test(a.getAttribute('rel')||''))ping('aff',net(u));else if(a.closest('.prod'))ping('shop',net(u))},true);
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
          if(x.ok&&x.j.link){ping('quote');show(f,'ok','Pedido recebido! Abrindo a sua página da cotação...');location.href=api+x.j.link;return}
          if(x.status===404||x.status===403||x.status===429){toWa(f);return}
          show(f,'err',(x.j&&x.j.error)||'Não deu para enviar agora. Tente de novo ou fale pelo WhatsApp.');
          if(b){b.disabled=false;b.textContent=b.dataset.label}
        })
        .catch(function(){toWa(f)});
    });
  });
})();
