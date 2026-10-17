(function(){
  var d=document.body.dataset, wa=d.wa||'', api=d.cotacao||'';
  var viaNotes={"instagram":"Veio pelo link da bio do Instagram."}, via='';try{via=viaNotes[new URLSearchParams(location.search).get('via')]||''}catch(e){}
  function waText(f){var v=function(n){var e=f.elements[n];return e?String(e.value||'').trim():''};var t=['Olá! Quero uma cotação de passagem.','De: '+v('origin'),'Para: '+v('destination'),'Ida: '+br(v('depart_date'))];if(v('return_date'))t.push('Volta: '+br(v('return_date')));t.push('Passageiros: '+(v('pax')||'1'));var ps=f.elements.period_key;if(ps&&ps.value)t.push('Horário: '+ps.options[ps.selectedIndex].text);t.push('Nome: '+v('name'));if(via)t.push(via);return t.join('\n')}
  function br(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);return m?m[3]+'/'+m[2]+'/'+m[1]:s}
  function toWa(f){if(wa)location.href='https://wa.me/55'+wa+'?text='+encodeURIComponent(waText(f))}
  function show(f,cls,txt){var m=f.querySelector('.msg');if(m){m.className='msg '+cls;m.textContent=txt}}
  // v1.34: a busca do topo leva origem, destino, data e passageiros para o pedido de cotação
  Array.prototype.forEach.call(document.querySelectorAll('form.sb'),function(s){
    s.addEventListener('submit',function(ev){
      var q=document.querySelector('#cotar form.qf');if(!q)return;
      ev.preventDefault();if(!s.reportValidity())return;
      ['origin','destination','depart_date','pax'].forEach(function(n){var a=s.elements[n],b=q.elements[n];if(a&&b&&a.value)b.value=a.value});
      document.getElementById('cotar').scrollIntoView({behavior:'smooth'});
      var nm=q.elements.name;if(nm)setTimeout(function(){nm.focus({preventScroll:true})},400);
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('form.qf'),function(f){
    f.addEventListener('submit',function(ev){
      ev.preventDefault();
      if(!f.reportValidity())return;
      if(!f.elements.consent.checked){show(f,'err','Marque que concorda com o uso dos dados para a cotação.');return}
      var get=function(n){var e=f.elements[n];return e?String(e.value||'').trim():''};
      var per={manha:'manha',tarde:'tarde',noite:'noite',madrugada:'madrugada'}[get('period_key')];
      var body={name:get('name'),phone:get('phone'),origin:get('origin'),destination:get('destination'),depart_date:get('depart_date'),return_date:get('return_date')||null,pax:Number(get('pax')||1),periods:per?[per]:[],consent:true,site:get('website')};if(via)body.obs=via;
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
