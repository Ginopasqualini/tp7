// fixtures.js - maneja almacenamiento en localStorage y renderizado
(function(){
  const STORAGE_KEY = 'fixtures_v1';

  function loadFixtures(){
    try{
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }catch(e){
      console.error('Error parsing fixtures', e);
      return [];
    }
  }

  function saveFixtures(fixtures){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fixtures));
  }

  function renderIndexNext(){
    const el = document.getElementById('next-matches');
    if(!el) return;
    const fixtures = loadFixtures().slice().sort((a,b)=>new Date(a.datetime)-new Date(b.datetime));
    if(fixtures.length===0){ el.textContent = 'No hay encuentros programados.'; return }
    const next = fixtures.slice(0,3);
    el.innerHTML = '';
    next.forEach(f=>{
      const d = new Date(f.datetime);
      const item = document.createElement('div');
      item.className = 'next-item';
      item.innerHTML = `<strong>${f.local}</strong> vs <strong>${f.visitor}</strong> — ${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      el.appendChild(item);
    });
  }

  function renderFixtureTable(){
    const tbody = document.getElementById('fixture-body');
    if(!tbody) return;
    const fixtures = loadFixtures().slice().sort((a,b)=>new Date(a.datetime)-new Date(b.datetime));
    tbody.innerHTML = '';
    if(fixtures.length===0){
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="7">No hay encuentros registrados.</td>';
      tbody.appendChild(tr);
      return;
    }
    fixtures.forEach((f,idx)=>{
      const d = new Date(f.datetime);
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${d.toLocaleDateString()}</td>
                      <td>${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                      <td>${escapeHtml(f.local)}</td>
                      <td>${escapeHtml(f.visitor)}</td>
                      <td>${escapeHtml(f.venue)}</td>
                      <td>${escapeHtml(f.phase)}</td>
                      <td><button data-i="${idx}" class="actions-btn delete">Eliminar</button></td>`;
      tbody.appendChild(tr);
    });

    // attach delete handlers
    tbody.querySelectorAll('.delete').forEach(btn=>{
      btn.addEventListener('click', e=>{
        const i = Number(e.currentTarget.dataset.i);
        const arr = loadFixtures();
        arr.splice(i,1);
        saveFixtures(arr);
        renderFixtureTable();
        renderIndexNext();
      })
    });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function initForm(){
    const form = document.getElementById('fixture-form');
    if(!form) return;
    const msg = document.getElementById('message');
    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      if(!form.reportValidity()) return;
      const local = form.local.value.trim();
      const visitor = form.visitor.value.trim();
      const date = form.date.value;
      const time = form.time.value;
      const venue = form.venue.value.trim();
      const phase = Array.from(form.phase).find(r=>r.checked)?.value || '';
      const datetime = new Date(date + 'T' + time).toISOString();
      const fixtures = loadFixtures();
      fixtures.push({local,visitor,venue,phase,datetime,createdAt:new Date().toISOString()});
      saveFixtures(fixtures);
      if(msg) msg.textContent = 'Encuentro registrado correctamente.';
      // redirigir a ver-fixture
      setTimeout(()=>{ location.href = '/ver-fixture.html' },700);
    });
  }

  // Initialize depending on page
  document.addEventListener('DOMContentLoaded', ()=>{
    renderIndexNext();
    renderFixtureTable();
    initForm();
  });

})();
