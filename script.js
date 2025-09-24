// script.js - main site behavior for MKstream v14
const $ = s=>document.querySelector(s);
const $$ = s=>Array.from(document.querySelectorAll(s));

// Storage keys
const KEYS = {
  cats: 'mk_cats_v14', servers: 'mk_servers_v14', videos: 'mk_videos_v14', admin:'mk_admin_v14'
};

function loadJSON(key, def){ try{ const v=localStorage.getItem(key); return v?JSON.parse(v):def; }catch(e){return def;} }
function saveJSON(key,val){ localStorage.setItem(key,JSON.stringify(val)); }

// Initialize defaults (preserve existing if present)
function ensureDefaults(){
  if(!loadJSON(KEYS.cats,null)){
    const defaultCats = {
      "Anime": [], "Donghua": [], "Cartoon": [], "Drama": [], "Serial": [], "Web Series": []
    };
    saveJSON(KEYS.cats, defaultCats);
  }
  if(!loadJSON(KEYS.servers,null)){
    saveJSON(KEYS.servers, [{name:'Server 1',url:'videos/sample1-720p.mp4'}]);
  }
  if(!loadJSON(KEYS.videos,null)){
    const vids = [
      {id:1,title:'Sample Anime 1',thumb:'thumbnails/sample1.jpg',category:'Anime',subcategory:'',episodes:120,sources:[{label:'720p',url:'videos/sample1-720p.mp4'}],subs:[],views:0,uploaded:Date.now()},
      {id:2,title:'Sample Cartoon 1',thumb:'thumbnails/sample2.jpg',category:'Cartoon',subcategory:'',episodes:24,sources:[{label:'720p',url:'videos/sample2-720p.mp4'}],subs:[],views:0,uploaded:Date.now()}
    ];
    saveJSON(KEYS.videos, vids);
  }
  if(!loadJSON(KEYS.admin,null)){
    saveJSON(KEYS.admin, {pass:'admin123'});
  }
}
ensureDefaults();

// Menu & Categories render
function renderTopCategories(){
  const cats = loadJSON(KEYS.cats,{});
  const top = $('#topCategories');
  const menu = $('#menuLinks');
  if(top) top.innerHTML = '';
  if(menu) menu.innerHTML = '';
  Object.keys(cats).forEach(cat=>{
    const a = document.createElement('a');
    a.href = `categories/${cat.toLowerCase().replace(/\s+/g,'')}.html`;
    a.textContent = cat;
    if(top) top.appendChild(a);
    const ma = document.createElement('a');
    ma.href = a.href; ma.textContent = cat;
    ma.addEventListener('click', ()=> closeMenu());
    if(menu) menu.appendChild(ma);
  });
}

function openMenu(){ const s = $('#siteMenu'); if(s){ s.classList.add('open'); s.classList.remove('hidden'); s.style.left='0'; s.setAttribute('aria-hidden','false'); } }
function closeMenu(){ const s = $('#siteMenu'); if(s){ s.classList.remove('open'); s.style.left='-340px'; s.setAttribute('aria-hidden','true'); setTimeout(()=>s.classList.add('hidden'),300);} }

document.addEventListener('DOMContentLoaded', ()=>{
  // UI elements
  const menuBtn = $('#menuBtn'), closeMenuBtn = $('#closeMenu');
  if(menuBtn) menuBtn.addEventListener('click', openMenu);
  if(closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
  // mobile menu links close on click
  $('#siteMenu')?.addEventListener('click', (e)=>{ if(e.target.tagName==='A') closeMenu(); });
  // search toggle
  $('#searchBtn')?.addEventListener('click', ()=>{ $('#searchInput').classList.toggle('hidden'); if(!$('#searchInput').classList.contains('hidden')) $('#searchInput').focus(); });
  // render categories
  renderTopCategories();
  // render grid
  renderGrid(1,false);
  // load more
  $('#loadMoreBtn')?.addEventListener('click', ()=>{ currentPage++; renderGrid(currentPage,true); });
  window.addEventListener('resize', ()=> renderGrid(1,false));
});

// Grid, pagination, load more
let currentPage = 1;
function itemsPerPage(){
  const w = window.innerWidth;
  if(w<=640) return 2*8; // 16
  if(w<=1024) return 3*6; // 18
  return 5*5; //25
}
function renderGrid(page=1, append=false){
  const vids = loadJSON(KEYS.videos,[]);
  const per = itemsPerPage();
  const start = (page-1)*per;
  const slice = vids.slice(start, start+per);
  const grid = $('#videoGrid'); if(!grid) return;
  if(!append) grid.innerHTML='';
  slice.forEach(v=>{
    const d = document.createElement('div'); d.className='video-card';
    d.innerHTML = `<a href="player.html?id=${v.id}"><img src="${v.thumb}" alt="${v.title}"><div class="meta"><h3>${v.title}</h3></div></a>`;
    grid.appendChild(d);
  });
  renderPagination(vids.length, per);
}
function renderPagination(total, per){
  const pages = Math.max(1, Math.ceil(total/per));
  const el = $('#pagination'); if(!el) return; el.innerHTML='';
  for(let i=1;i<=pages;i++){
    const a = document.createElement('a'); a.href='#'; a.textContent = i;
    a.addEventListener('click',(e)=>{ e.preventDefault(); currentPage = i; renderGrid(i,false); });
    if(i===currentPage) a.style.background='rgba(255,255,255,0.04)';
    el.appendChild(a);
  }
}
