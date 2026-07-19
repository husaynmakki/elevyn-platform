/* ===== ELEVYN STUDIOS — apparel site behavior ===== */
(function(){
  const burger = document.querySelector('.burger');
  const panel = document.querySelector('.mobile-panel');
  if(burger && panel){
    burger.addEventListener('click', ()=> panel.classList.toggle('open'));
    panel.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> panel.classList.remove('open')));
  }
})();

(function(){
  const els = document.querySelectorAll('.reveal');
  if(!els.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
  },{threshold:0.12});
  els.forEach(el=>io.observe(el));
})();

document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',(e)=>{
    const target = document.querySelector(a.getAttribute('href'));
    if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth'}); }
  });
});

/* Collection tabs */
(function(){
  const tabs = document.querySelectorAll('.ctab');
  const panels = document.querySelectorAll('[data-collection]');
  if(!tabs.length) return;
  tabs.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      tabs.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.dataset.tab;
      panels.forEach(p=>{
        p.style.display = (key === 'all' || p.dataset.collection === key) ? '' : 'none';
      });
    });
  });
})();

/* Cart engine (mirrors the gym site's shop cart) */
(function(){
  const CART_KEY = 'elevynStudiosCart';
  function loadCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }catch(e){ return []; } }
  function saveCart(items){ try{ localStorage.setItem(CART_KEY, JSON.stringify(items)); }catch(e){} }

  function updateBadge(){
    const items = loadCart();
    const count = items.reduce((n,i)=>n+i.qty,0);
    document.querySelectorAll('[data-cart-count]').forEach(el=>{
      el.textContent = count;
      el.style.display = count>0 ? 'inline-flex' : 'none';
    });
  }

  document.querySelectorAll('.pcard').forEach(card=>{
    const sizeRow = card.querySelector('[data-sizes]');
    let selectedSize = null;
    if(sizeRow){
      const sizes = sizeRow.dataset.sizes.split(',');
      sizes.forEach((s,i)=>{
        const chip = document.createElement('button');
        chip.type='button';
        chip.className='chip'+(i===0?' sel':'');
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
        const img = card.dataset.img || '';
        const key = name+'|'+(selectedSize||'');
        const existing = items.find(i=>i.key===key);
        if(existing){ existing.qty += 1; } else { items.push({key,name,price,size:selectedSize,img,qty:1}); }
        saveCart(items);
        updateBadge();
        addBtn.textContent = 'Added ✓';
        setTimeout(()=>{ addBtn.textContent = 'Add to Bag'; }, 1400);
      });
    }
  });

  updateBadge();

  const drawer = document.querySelector('[data-cart-drawer]');
  const listEl = document.querySelector('[data-cart-list]');
  const totalEl = document.querySelector('[data-cart-total]');
  const emptyEl = document.querySelector('[data-cart-empty]');

  function renderCart(){
    const items = loadCart();
    if(!items.length){
      listEl.innerHTML=''; if(emptyEl) emptyEl.style.display='block'; if(totalEl) totalEl.textContent='$0.00';
      return;
    }
    if(emptyEl) emptyEl.style.display='none';
    let total=0;
    listEl.innerHTML = items.map(i=>{
      total += i.price*i.qty;
      return `<div class="cart-row">
        ${i.img ? `<img src="${i.img}" alt="${i.name}">` : ''}
        <div class="cart-row-info">
          <div class="cart-row-name">${i.name}</div>
          <div class="cart-row-meta">${i.size ? 'Size '+i.size+' · ' : ''}Qty ${i.qty}</div>
          <div class="cart-row-price">$${(i.price*i.qty).toFixed(2)}</div>
        </div>
        <button class="cart-remove" data-remove="${i.key}" aria-label="Remove">&times;</button>
      </div>`;
    }).join('');
    if(totalEl) totalEl.textContent = '$'+total.toFixed(2);
    listEl.querySelectorAll('[data-remove]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const remaining = loadCart().filter(i=>i.key!==btn.dataset.remove);
        saveCart(remaining); renderCart(); updateBadge();
      });
    });
  }

  document.querySelectorAll('[data-cart-open]').forEach(btn=> btn.addEventListener('click', ()=>{ renderCart(); drawer.classList.add('open'); }));
  document.querySelectorAll('[data-cart-close]').forEach(btn=> btn.addEventListener('click', ()=> drawer.classList.remove('open')));

  const checkoutBtn = document.querySelector('[data-checkout]');
  if(checkoutBtn){
    checkoutBtn.addEventListener('click', ()=>{
      if(!loadCart().length) return;
      saveCart([]); updateBadge(); renderCart();
      const msg = document.querySelector('[data-checkout-msg]');
      if(msg){ msg.classList.add('show'); setTimeout(()=>msg.classList.remove('show'), 3200); }
    });
  }
})();
