/* ===== ELEVYN — shared behavior ===== */

/* Mobile nav toggle */
(function(){
  const burger = document.querySelector('.burger');
  const panel = document.querySelector('.mobile-panel');
  if(!burger || !panel) return;
  burger.addEventListener('click', ()=>{
    panel.classList.toggle('open');
  });
  panel.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=> panel.classList.remove('open'));
  });
})();

/* Scroll reveal */
(function(){
  const els = document.querySelectorAll('.reveal');
  if(!els.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
  }, {threshold:0.15});
  els.forEach(el=>io.observe(el));
})();

/* Smooth in-page anchor scrolling */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',(e)=>{
    const target = document.querySelector(a.getAttribute('href'));
    if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth'}); }
  });
});

/* =========================================================
   BOOKING ENGINE
   Any element with class="booking" and data-* config is
   turned into a working date/time reservation form.
   Bookings are stored in localStorage under "elevynBookings"
   so the My Bookings page can list them across visits.
   ========================================================= */
(function(){
  const roots = document.querySelectorAll('.booking');
  if(!roots.length) return;

  const STORAGE_KEY = 'elevynBookings';

  function loadBookings(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch(e){ return []; }
  }
  function saveBookings(list){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch(e){ /* storage unavailable — booking still confirms for this session */ }
  }

  function fmtDate(d){
    return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
  }
  function dow(d){ return d.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase(); }
  function dnum(d){ return d.getDate(); }

  roots.forEach(root=>{
    const amenity   = root.dataset.amenity || 'Reservation';
    const hours     = (root.dataset.hours || '9:00,10:00,11:00').split(',').map(s=>s.trim());
    const durations = root.dataset.durations ? root.dataset.durations.split(',').map(s=>s.trim()) : null;
    const resources = root.dataset.resources ? root.dataset.resources.split(',').map(s=>s.trim()) : null;
    const resourceLabel = root.dataset.resourceLabel || 'Preference';
    const daysAhead = parseInt(root.dataset.days || '10', 10);

    const state = { date:null, time:null, duration: durations ? durations[0] : null, resource: resources ? resources[0] : null };

    /* Build date chips */
    const dateRow = root.querySelector('[data-slot="dates"]');
    const today = new Date();
    for(let i=0; i<daysAhead; i++){
      const d = new Date(today);
      d.setDate(today.getDate()+i);
      const chip = document.createElement('button');
      chip.type='button';
      chip.className='chip date';
      chip.innerHTML = `<span class="dow">${dow(d)}</span><span class="dnum">${dnum(d)}</span>`;
      chip.addEventListener('click', ()=>{
        dateRow.querySelectorAll('.chip').forEach(c=>c.classList.remove('sel'));
        chip.classList.add('sel');
        state.date = fmtDate(d);
      });
      dateRow.appendChild(chip);
    }

    /* Build time chips */
    const timeRow = root.querySelector('[data-slot="times"]');
    hours.forEach(h=>{
      const chip = document.createElement('button');
      chip.type='button';
      chip.className='chip';
      chip.textContent = h;
      chip.addEventListener('click', ()=>{
        timeRow.querySelectorAll('.chip').forEach(c=>c.classList.remove('sel'));
        chip.classList.add('sel');
        state.time = h;
      });
      timeRow.appendChild(chip);
    });

    /* Build duration chips (optional) */
    const durRow = root.querySelector('[data-slot="durations"]');
    if(durRow){
      if(durations){
        durations.forEach((d,i)=>{
          const chip = document.createElement('button');
          chip.type='button';
          chip.className='chip' + (i===0 ? ' sel' : '');
          chip.textContent = d + ' min';
          chip.addEventListener('click', ()=>{
            durRow.querySelectorAll('.chip').forEach(c=>c.classList.remove('sel'));
            chip.classList.add('sel');
            state.duration = d;
          });
          durRow.appendChild(chip);
        });
      } else {
        durRow.closest('.bk-step').style.display='none';
      }
    }

    /* Build resource chips (optional — court #, trainer, instructor) */
    const resRow = root.querySelector('[data-slot="resources"]');
    if(resRow){
      if(resources){
        resources.forEach((r,i)=>{
          const chip = document.createElement('button');
          chip.type='button';
          chip.className='chip' + (i===0 ? ' sel' : '');
          chip.textContent = r;
          chip.addEventListener('click', ()=>{
            resRow.querySelectorAll('.chip').forEach(c=>c.classList.remove('sel'));
            chip.classList.add('sel');
            state.resource = r;
          });
          resRow.appendChild(chip);
        });
        const lbl = root.querySelector('[data-slot="resourceLabel"]');
        if(lbl) lbl.textContent = resourceLabel;
      } else {
        resRow.closest('.bk-step').style.display='none';
      }
    }

    /* Submit */
    const form = root.querySelector('form');
    const errorEl = root.querySelector('.bk-error');
    const confirmEl = root.querySelector('.confirm');
    const formWrap = root.querySelector('.bk-form-wrap');

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();

      if(!state.date || !state.time || !name || !email){
        errorEl.textContent = 'Please choose a date and time, and enter your name and email.';
        errorEl.classList.add('show');
        return;
      }
      errorEl.classList.remove('show');

      const booking = {
        id: 'bk_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
        amenity, name, email,
        date: state.date, time: state.time,
        duration: state.duration, resource: state.resource,
        notes: (form.querySelector('[name="notes"]') || {}).value || '',
        createdAt: new Date().toISOString()
      };
      const list = loadBookings();
      list.push(booking);
      saveBookings(list);

      formWrap.style.display='none';
      confirmEl.classList.add('show');
      const d = confirmEl.querySelector('.details');
      d.innerHTML = `
        <div><b>Booking</b> — ${amenity}</div>
        <div><b>Date</b> — ${booking.date}</div>
        <div><b>Time</b> — ${booking.time}</div>
        ${booking.duration ? `<div><b>Duration</b> — ${booking.duration} min</div>` : ''}
        ${booking.resource ? `<div><b>${resourceLabel}</b> — ${booking.resource}</div>` : ''}
        <div><b>Name</b> — ${booking.name}</div>
      `;
    });
  });
})();

/* =========================================================
   MY BOOKINGS PAGE
   Renders and manages the list stored in localStorage.
   ========================================================= */
(function(){
  const list = document.querySelector('[data-bookings-list]');
  if(!list) return;

  function render(){
    let items = [];
    try{ items = JSON.parse(localStorage.getItem('elevynBookings') || '[]'); }
    catch(e){ items = []; }

    const empty = document.querySelector('[data-bookings-empty]');
    if(!items.length){
      list.innerHTML='';
      if(empty) empty.style.display='block';
      return;
    }
    if(empty) empty.style.display='none';

    items.sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt));

    list.innerHTML = items.map(b => `
      <div class="info-row" data-id="${b.id}">
        <div class="k">${b.amenity}</div>
        <div class="v">
          ${b.date} · ${b.time}${b.duration ? ' · '+b.duration+' min' : ''}${b.resource ? ' · '+b.resource : ''}<br>
          <span style="color:var(--off);font-size:13px;">${b.name} — ${b.email}</span>
          <div style="margin-top:12px;">
            <button class="btn btn-ghost" data-cancel="${b.id}" style="padding:9px 20px;font-size:10px;">Cancel Booking</button>
          </div>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('[data-cancel]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.cancel;
        const remaining = items.filter(b=>b.id!==id);
        localStorage.setItem('elevynBookings', JSON.stringify(remaining));
        render();
      });
    });
  }
  render();
})();

/* =========================================================
   SHOP / CART ENGINE (shop.html)
   Simple client-side cart stored in localStorage.
   ========================================================= */
(function(){
  const grid = document.querySelector('[data-shop-grid]');
  if(!grid) return;

  const CART_KEY = 'elevynCart';
  function loadCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch(e){ return []; } }
  function saveCart(items){ try{ localStorage.setItem(CART_KEY, JSON.stringify(items)); }catch(e){} }

  function updateCartBadge(){
    const items = loadCart();
    const count = items.reduce((n,i)=>n+i.qty,0);
    document.querySelectorAll('[data-cart-count]').forEach(el=>{
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }

  // Size selection per product card
  document.querySelectorAll('.product-card').forEach(card=>{
    const sizeRow = card.querySelector('[data-sizes]');
    let selectedSize = null;
    if(sizeRow){
      const sizes = sizeRow.dataset.sizes.split(',');
      sizes.forEach((s,i)=>{
        const chip = document.createElement('button');
        chip.type='button';
        chip.className='chip' + (i===0?' sel':'');
        chip.textContent = s;
        chip.addEventListener('click', ()=>{
          sizeRow.querySelectorAll('.chip').forEach(c=>c.classList.remove('sel'));
          chip.classList.add('sel');
          selectedSize = s;
        });
        sizeRow.appendChild(chip);
      });
      selectedSize = sizes[0];
    }

    const addBtn = card.querySelector('[data-add-to-bag]');
    if(addBtn){
      addBtn.addEventListener('click', ()=>{
        const items = loadCart();
        const name = card.dataset.name;
        const price = parseFloat(card.dataset.price);
        const img = card.dataset.img;
        const key = name + '|' + (selectedSize || '');
        const existing = items.find(i=>i.key===key);
        if(existing){ existing.qty += 1; }
        else{ items.push({ key, name, price, size: selectedSize, img, qty:1 }); }
        saveCart(items);
        updateCartBadge();
        addBtn.textContent = 'Added \u2713';
        setTimeout(()=>{ addBtn.textContent = 'Add to Bag'; }, 1400);
      });
    }
  });

  updateCartBadge();

  // Cart drawer
  const drawer = document.querySelector('[data-cart-drawer]');
  const openBtns = document.querySelectorAll('[data-cart-open]');
  const closeBtn = document.querySelector('[data-cart-close]');
  const listEl = document.querySelector('[data-cart-list]');
  const totalEl = document.querySelector('[data-cart-total]');
  const emptyEl = document.querySelector('[data-cart-empty]');

  function renderCart(){
    const items = loadCart();
    if(!items.length){
      listEl.innerHTML = '';
      if(emptyEl) emptyEl.style.display = 'block';
      if(totalEl) totalEl.textContent = '$0.00';
      return;
    }
    if(emptyEl) emptyEl.style.display = 'none';
    let total = 0;
    listEl.innerHTML = items.map(i=>{
      total += i.price * i.qty;
      return `
        <div class="cart-row">
          <img src="${i.img}" alt="${i.name}">
          <div class="cart-row-info">
            <div class="cart-row-name">${i.name}</div>
            <div class="cart-row-meta">${i.size ? 'Size ' + i.size + ' · ' : ''}Qty ${i.qty}</div>
            <div class="cart-row-price">$${(i.price * i.qty).toFixed(2)}</div>
          </div>
          <button class="cart-remove" data-remove="${i.key}" aria-label="Remove">&times;</button>
        </div>`;
    }).join('');
    if(totalEl) totalEl.textContent = '$' + total.toFixed(2);

    listEl.querySelectorAll('[data-remove]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const remaining = loadCart().filter(i=>i.key !== btn.dataset.remove);
        saveCart(remaining);
        renderCart();
        updateCartBadge();
      });
    });
  }

  openBtns.forEach(btn=> btn.addEventListener('click', ()=>{
    renderCart();
    drawer.classList.add('open');
  }));
  if(closeBtn) closeBtn.addEventListener('click', ()=> drawer.classList.remove('open'));

  const checkoutBtn = document.querySelector('[data-checkout]');
  if(checkoutBtn){
    checkoutBtn.addEventListener('click', ()=>{
      if(!loadCart().length) return;
      saveCart([]);
      updateCartBadge();
      renderCart();
      const msg = document.querySelector('[data-checkout-msg]');
      if(msg){ msg.classList.add('show'); setTimeout(()=>msg.classList.remove('show'), 3200); }
    });
  }
})();


/* Booking tab switcher */
(function(){
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  if(!tabs.length) return;
  tabs.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      tabs.forEach(b=>b.classList.remove('active'));
      panels.forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.querySelector(`[data-panel="${btn.dataset.tab}"]`);
      if(panel) panel.classList.add('active');
    });
  });
})();
