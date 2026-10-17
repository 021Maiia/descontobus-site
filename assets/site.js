(function(){
  var d=document.body.dataset, wa=d.wa||'', api=d.cotacao||'', bot=d.bot||wa;
  var viaNotes={"instagram":"Veio pelo link da bio do Instagram."}, via='';try{via=viaNotes[new URLSearchParams(location.search).get('via')]||''}catch(e){}
  function waText(f){var v=function(n){var e=f.elements[n];return e?String(e.value||'').trim():''};var t=['Olá! Quero uma cotação'+(v('service')?' de '+v('service').toLowerCase():' de passagem')+'.','De: '+v('origin'),'Para: '+v('destination'),'Ida: '+br(v('depart_date'))];if(v('return_date'))t.push('Volta: '+br(v('return_date')));t.push('Passageiros: '+(v('pax')||'1'));var ps=f.elements.period_key;if(ps&&ps.value)t.push('Horário: '+ps.options[ps.selectedIndex].text);t.push('Nome: '+v('name'));if(via)t.push(via);return t.join('\n')}
  function br(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);return m?m[3]+'/'+m[2]+'/'+m[1]:s}
  function toWa(f){if(wa)location.href='https://wa.me/55'+wa+'?text='+encodeURIComponent(waText(f))}
  function show(f,cls,txt){var m=f.querySelector('.msg');if(m){m.className='msg '+cls;m.textContent=txt}}
  // v1.36: trocar origem e destino; atalhos Hoje e Amanhã
  Array.prototype.forEach.call(document.querySelectorAll('form.sc'),function(s){
    var sw=s.querySelector('.swap');if(sw)sw.addEventListener('click',function(){var a=s.elements.origin,b=s.elements.destination,t=a.value;a.value=b.value;b.value=t});
    Array.prototype.forEach.call(s.querySelectorAll('[data-d]'),function(b){b.addEventListener('click',function(ev){ev.preventDefault();var d=new Date();d.setDate(d.getDate()+Number(b.getAttribute('data-d')));var z=function(n){return(n<10?'0':'')+n};s.elements.depart_date.value=d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())})});
  });
  // v1.35: "Comprar passagem" abre o WhatsApp do Descontão (assistente) com a rota, a data e os passageiros
  Array.prototype.forEach.call(document.querySelectorAll('form.sb'),function(s){
    s.addEventListener('submit',function(ev){
      ev.preventDefault();if(!s.reportValidity())return;
      if(!bot){var q=document.querySelector('#cotar form.qf');if(!q)return;['origin','destination','depart_date','pax'].forEach(function(n){var a=s.elements[n],b=q.elements[n];if(a&&b&&a.value)b.value=a.value});document.getElementById('cotar').scrollIntoView({behavior:'smooth'});return}
      var v=function(n){var e=s.elements[n];return e?String(e.value||'').trim():''};var p=Number(v('pax')||1);
      var t='Olá, Descontão! Quero comprar passagem de '+v('origin')+' para '+v('destination')+', ida em '+br(v('depart_date'))+(v('return_date')?', volta em '+br(v('return_date')):'')+', '+p+(p>1?' passageiros':' passageiro')+'.';
      if(via)t+='\n'+via;
      location.href='https://wa.me/55'+bot+'?text='+encodeURIComponent(t);
    });
  });
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
          if(x.ok&&x.j.link){show(f,'ok','Pedido recebido! Abrindo a sua página da cotação...');location.href=api+x.j.link;return}
          if(x.status===404||x.status===403||x.status===429){toWa(f);return}
          show(f,'err',(x.j&&x.j.error)||'Não deu para enviar agora. Tente de novo ou fale pelo WhatsApp.');
          if(b){b.disabled=false;b.textContent=b.dataset.label}
        })
        .catch(function(){toWa(f)});
    });
  });
})();
