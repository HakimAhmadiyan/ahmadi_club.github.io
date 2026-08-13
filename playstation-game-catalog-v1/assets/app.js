const DATA_URL = "data/games.json";
let games = [];
let platform = "all";

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function cover(g, cls="") {
  const fallback = `<div class="cover-fallback"><strong>${esc(g.name)}</strong></div>`;
  return `<div class="${cls || 'cover'}">${g.cover ? `<img loading="lazy" src="${esc(g.cover)}" alt="${esc(g.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">` : ""}${fallback}</div>`;
}
function platformTags(g) {
  return (g.platforms || []).map(p => `<span class="tag">${esc(p)}</span>`).join("");
}
function card(g) {
  return `<article class="game-card">
    <a href="details.html?id=${encodeURIComponent(g.id)}">
      <div class="cover">${g.cover ? `<img loading="lazy" src="${esc(g.cover)}" alt="${esc(g.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">` : ""}<div class="cover-fallback"><strong>${esc(g.name)}</strong></div><div class="platforms">${platformTags(g)}</div></div>
      <div class="card-body">
        <div class="card-title">${esc(g.name)}</div>
        <div class="meta"><span>${esc(g.genre?.[0] || "—")}</span><span>${esc(g.size || "حجم نامشخص")}</span><span>${esc(g.release || "—")}</span></div>
        <span class="card-link">مشاهده جزئیات ←</span>
      </div>
    </a>
  </article>`;
}
function initFilters() {
  const genres = [...new Set(games.flatMap(g => g.genre || []))].sort((a,b)=>a.localeCompare(b));
  $("#genre").innerHTML = `<option value="all">همه ژانرها</option>` + genres.map(g=>`<option>${esc(g)}</option>`).join("");
  document.querySelectorAll(".filter").forEach(btn => btn.onclick = () => {
    document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active"); platform = btn.dataset.platform; render();
  });
  $("#search").oninput = render; $("#genre").onchange = render; $("#sort").onchange = render;
}
function render() {
  if (!$("#gamesGrid")) return;
  const q = ($("#search")?.value || "").trim().toLowerCase();
  const genre = $("#genre")?.value || "all";
  const sort = $("#sort")?.value || "newest";
  let list = games.filter(g => {
    const matchQ = !q || [g.name,g.developer,g.publisher,...(g.genre||[])].join(" ").toLowerCase().includes(q);
    const matchP = platform==="all" || (g.platforms||[]).includes(platform);
    const matchG = genre==="all" || (g.genre||[]).includes(genre);
    return matchQ && matchP && matchG;
  });
  list.sort((a,b)=>{
    if(sort==="az") return a.name.localeCompare(b.name);
    if(sort==="za") return b.name.localeCompare(a.name);
    return sort==="oldest" ? a.release.localeCompare(b.release) : b.release.localeCompare(a.release);
  });
  $("#gamesGrid").innerHTML = list.map(card).join("");
  $("#empty").hidden = list.length !== 0;
  $("#count").textContent = `${list.length} بازی`;
}
function renderDetail() {
  const root = $("#detail"); if(!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const g = games.find(x => x.id === id);
  if(!g){ root.innerHTML = `<div class="empty">بازی پیدا نشد.<br><a class="card-link" href="./">بازگشت</a></div>`; return; }
  const heroCover = g.cover ? `<img src="${esc(g.cover)}" alt="${esc(g.name)}">` : `<div class="cover-fallback"><strong>${esc(g.name)}</strong></div>`;
  root.innerHTML = `<section class="detail-hero">
    <div class="detail-cover">${heroCover}</div>
    <div>
      <span class="eyebrow">${(g.platforms||[]).join(" • ")}</span>
      <h1>${esc(g.name)}</h1>
      <p class="detail-desc">${esc(g.description || "توضیحات این بازی هنوز ثبت نشده است.")}</p>
      <div class="facts">
        <div class="fact"><span>حجم</span><strong>${esc(g.size || "نامشخص")}</strong></div>
        <div class="fact"><span>تاریخ انتشار</span><strong>${esc(g.release || "نامشخص")}</strong></div>
        <div class="fact"><span>سازنده</span><strong>${esc(g.developer || "نامشخص")}</strong></div>
        <div class="fact"><span>ناشر</span><strong>${esc(g.publisher || "نامشخص")}</strong></div>
      </div>
      <div class="meta">${(g.genre||[]).map(x=>`<span>${esc(x)}</span>`).join("")}</div>
      ${g.source ? `<a class="source-btn" href="${esc(g.source)}" target="_blank" rel="noopener">مشاهده در PlayStation Store ↗</a>` : ""}
    </div>
  </section>
  <section class="gallery">
    <h2>اسکرین‌شات‌ها و تریلر</h2>
    <div class="shots">${(g.screenshots||[]).map(s=>`<div class="shot"><img loading="lazy" src="${esc(s)}" alt="${esc(g.name)} screenshot"></div>`).join("") || `<div class="empty">اسکرین‌شات ثبت نشده است.</div>`}</div>
    ${g.trailer ? `<p><a class="source-btn" href="${esc(g.trailer)}" target="_blank" rel="noopener">🎬 مشاهده تریلر</a></p>` : ""}
  </section>`;
}
async function boot(){
  try{
    const r = await fetch(DATA_URL,{cache:"no-store"}); games = await r.json();
    initFilters(); render(); renderDetail();
    if($("#lastUpdate")) $("#lastUpdate").textContent = games[0]?.catalogUpdated || "—";
  }catch(e){ console.error(e); if($("#gamesGrid")) $("#gamesGrid").innerHTML=`<div class="empty">خطا در خواندن کاتالوگ.</div>`; }
  $("#updateBtn")?.addEventListener("click",()=>{
    const url = "https://github.com/YOUR-USERNAME/YOUR-REPOSITORY/actions/workflows/update-catalog.yml";
    alert("برای اجرای بروزرسانی خودکار، لینک Workflow را در assets/app.js با آدرس Repository خودت جایگزین کن.");
    window.open(url,"_blank","noopener");
  });
}
boot();
