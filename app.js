const DATA=loadIPData();
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function initials(name){return (name||"?").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();}
function avatarHTML(p,cls="avatar"){return p.photo?`<div class="${cls}"><img src="${esc(p.photo)}" alt="Photo de ${esc(p.name)}" loading="lazy"></div>`:`<div class="${cls}">${esc(initials(p.name))}</div>`;}
function profileById(id){return DATA.profiles.find(p=>p.id===id);}
function showToast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2300);}
function emptyState(msg,cta){return `<div class="empty-state glass">${esc(msg)}${cta?` <a class="text-link" href="admin.html">${esc(cta)} →</a>`:""}</div>`;}

function renderStats(){
 $("#statProfiles").textContent=DATA.profiles.length;$("#statServices").textContent=DATA.services.length;$("#statGroups").textContent=DATA.groups.length;
 const p=DATA.profiles[0];
 const card=$("#heroAvatar").closest(".hero-card");
 if(!p){
   card.innerHTML = `<div class="hero-card-top"><span>PROFIL EN VEDETTE</span><span class="live-dot"></span></div><div class="avatar avatar-xl">?</div><h3>Aucun profil pour l'instant</h3><p>Soyez le premier à présenter votre profil et vos compétences.</p><a href="admin.html" class="text-link">Créer mon profil →</a>`;
   return;
 }
 $("#heroAvatar").outerHTML = avatarHTML(p,"avatar avatar-xl").replace('class="avatar avatar-xl"','id="heroAvatar" class="avatar avatar-xl"');
 $("#heroName").textContent=p.name;$("#heroRole").textContent=p.role;
 $("#heroSkills").innerHTML=(p.skills||[]).slice(0,3).map(s=>`<div class="skill-line"><div class="skill-meta"><span>${esc(s[0])}</span><span class="skill-number" data-value="${s[1]}">0%</span></div><div class="skill-track"><div class="skill-fill" data-width="${s[1]}%"></div></div></div>`).join("")||`<p class="muted" style="margin:0">Aucune compétence renseignée.</p>`;
}
function skillHTML(s){return `<div class="skill-line"><div class="skill-meta"><span>${esc(s[0])}</span><span class="skill-number" data-value="${s[1]}">0%</span></div><div class="skill-track"><div class="skill-fill" data-width="${s[1]}%"></div></div></div>`;}
function renderProfiles(){
 const q=($("#profileSearch")?.value||"").toLowerCase().trim(), active=document.querySelector(".chip.active")?.dataset.filter||"Tous";
 const list=DATA.profiles.filter(p=>(active==="Tous"||p.role.toLowerCase().includes(active.toLowerCase())||(p.skills||[]).some(s=>s[0].toLowerCase().includes(active.toLowerCase()))) && (!q||(p.name+" "+p.role+" "+p.bio+" "+(p.skills||[]).flat().join(" ")).toLowerCase().includes(q)));
 $("#profilesGrid").innerHTML=list.map(p=>`<article class="profile-card glass"><div class="profile-top">${avatarHTML(p)}<div><h3>${esc(p.name)}</h3><small>${esc(p.role)}</small></div><span class="availability" title="${esc(p.availability)}"></span></div><p class="profile-bio">${esc(p.bio)}</p><div class="card-skills">${(p.skills||[]).slice(0,4).map(skillHTML).join("")}</div><div class="profile-actions"><button class="btn btn-secondary profile-view" data-id="${p.id}">Voir le profil</button><a class="btn btn-primary" href="${p.whatsapp?`https://wa.me/${esc(p.whatsapp)}`:"#"}" ${p.whatsapp?'target="_blank" rel="noopener"':''}>Contacter</a></div></article>`).join("") || emptyState(DATA.profiles.length?"Aucun profil ne correspond à votre recherche.":"Aucun profil pour l'instant.",DATA.profiles.length?null:"Créer le premier profil");
 animateSkills($("#profilesGrid"));
 $$(".profile-view").forEach(b=>b.addEventListener("click",()=>openProfile(b.dataset.id)));
}
function setupFilters(){
 const roles=[...new Set(DATA.profiles.map(p=>(p.role||"").split(/[•,]/)[0].trim()).filter(Boolean))].slice(0,6);
 const terms=["Tous",...roles];
 $("#profileFilters").innerHTML=terms.map((x,i)=>`<button class="chip ${i===0?"active":""}" data-filter="${x}">${esc(x)}</button>`).join("");
 $$(".chip").forEach(c=>c.addEventListener("click",()=>{$$(".chip").forEach(x=>x.classList.remove("active"));c.classList.add("active");renderProfiles()}));
}
function renderServices(){
 $("#servicesGrid").innerHTML=DATA.services.map(s=>`<article class="service-card glass"><span class="service-tag">${esc(s.category)}</span><div class="service-icon">${s.image?`<img src="${esc(s.image)}" alt="" loading="lazy">`:esc(s.icon||"✦")}</div><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p><a href="#profils" class="text-link">Trouver un étudiant →</a></article>`).join("") || emptyState("Aucun service publié pour l'instant.","Ajouter un service");
}
function renderPosts(){
 $("#postsGrid").innerHTML=DATA.posts.slice().reverse().map(post=>{const p=profileById(post.authorId);return `<article class="post-card glass"><div class="post-cover">${post.image?`<img src="${esc(post.image)}" alt="" loading="lazy">`:"✦"}</div><div class="post-body"><span class="post-meta">${esc(post.category)}</span><h3>${esc(post.title)}</h3><p>${esc(post.content)}</p><span class="post-author">Par ${esc(p?p.name:"un membre")}</span></div></article>`}).join("") || emptyState("Aucune publication pour l'instant.","Publier une actualité");
}
function renderGroups(list=DATA.groups){
 $("#groupsGrid").innerHTML=list.map(g=>`<article class="group-card glass"><div class="group-icon">${g.image?`<img src="${esc(g.image)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:14px">`:esc(g.icon||"👥")}</div><h3>${esc(g.name)}</h3><span class="group-members">${g.members||0} membres</span><p>${esc(g.description)}</p><small class="post-author">${esc(g.theme)}</small><button class="btn btn-secondary join-group" data-id="${g.id}">${localStorage.getItem("ip_join_"+g.id)?"✓ Membre":"Rejoindre le groupe"}</button></article>`).join("") || emptyState("Aucun groupe pour l'instant.","Créer un groupe");
 $$(".join-group").forEach(b=>b.addEventListener("click",()=>{localStorage.setItem("ip_join_"+b.dataset.id,"1");b.textContent="✓ Membre";showToast("Vous avez rejoint ce groupe.");}));
}
function animateSkills(root=document){
 if(!root)return;
 root.querySelectorAll(".skill-fill").forEach(el=>{requestAnimationFrame(()=>el.style.width=el.dataset.width)});
 root.querySelectorAll(".skill-number").forEach(el=>{const target=+el.dataset.value;let start=0;const step=()=>{start=Math.min(target,start+Math.max(1,Math.ceil(target/28)));el.textContent=start+"%";if(start<target)requestAnimationFrame(step)};setTimeout(step,120)});
}
function openProfile(id){
 const p=profileById(id); if(!p)return;
 const overlay=document.createElement("div");overlay.className="profile-modal";
 overlay.innerHTML=`<div class="modal-backdrop"></div><div class="modal-card glass"><button class="modal-close">×</button>${avatarHTML(p,"avatar avatar-xl")}<span class="eyebrow">${esc(p.availability)}</span><h2>${esc(p.name)}</h2><p class="modal-role">${esc(p.role)}</p><p>${esc(p.bio)}</p><h4>COMPÉTENCES</h4><div class="modal-skills">${(p.skills||[]).map(skillHTML).join("")||'<p class="muted">Aucune compétence renseignée.</p>'}</div><h4>SERVICES & CONTACT</h4><div class="modal-actions"><a class="btn btn-primary" href="${p.whatsapp?`https://wa.me/${esc(p.whatsapp)}`:"#"}" ${p.whatsapp?'target="_blank" rel="noopener"':''}>Contacter ${esc(p.name)} →</a><button class="btn btn-secondary modal-close-btn">Fermer</button></div></div>`;
 document.body.appendChild(overlay);requestAnimationFrame(()=>overlay.classList.add("open"));animateSkills(overlay);
 const close=()=>{overlay.classList.remove("open");setTimeout(()=>overlay.remove(),250)};overlay.querySelector(".modal-close").onclick=close;overlay.querySelector(".modal-close-btn").onclick=close;overlay.querySelector(".modal-backdrop").onclick=close;
}
function setupReveal(){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.08});$$(".reveal").forEach(x=>io.observe(x))}
function setupScrollspy(){
 const links=[...$$('.desktop-nav a, .mobile-menu a[href^="#"]')];
 const sections=links.map(l=>document.querySelector(l.getAttribute("href"))).filter(Boolean);
 if(!sections.length)return;
 const spy=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
     if(!entry.isIntersecting)return;
     const id="#"+entry.target.id;
     links.forEach(l=>l.classList.toggle("active",l.getAttribute("href")===id));
   });
 },{rootMargin:"-45% 0px -50% 0px"});
 sections.forEach(s=>spy.observe(s));
}
function setupWhatsappFloat(){
 const withNumber=DATA.profiles.find(p=>p.whatsapp);
 const btn=$("#whatsappFloat");
 if(withNumber){btn.href=`https://wa.me/${withNumber.whatsapp}`;btn.classList.remove("hidden");}
 else btn.classList.add("hidden");
}
$("#menuBtn").onclick=()=>$("#mobileMenu").classList.toggle("open");$$(".mobile-menu a").forEach(a=>a.onclick=()=>$("#mobileMenu").classList.remove("open"));
document.addEventListener("click",e=>{const menu=$("#mobileMenu");if(menu.classList.contains("open")&&!menu.contains(e.target)&&e.target!==$("#menuBtn"))menu.classList.remove("open")});
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("#mobileMenu").classList.remove("open")});
$("#profileSearch").addEventListener("input",renderProfiles);$("#shuffleGroupsBtn").onclick=()=>renderGroups([...DATA.groups].sort(()=>Math.random()-.5).slice(0,4));
$("#randomPostBtn").onclick=()=>{const posts=[...DATA.posts];if(!posts.length){showToast("Aucune publication pour l'instant.");return;}const p=posts[Math.floor(Math.random()*posts.length)];showToast("À découvrir : "+p.title);document.querySelector("#publications").scrollIntoView({behavior:"smooth"})};
$("#year").textContent=new Date().getFullYear();
if(DATA.settings.tagline) $(".hero-text").textContent=DATA.settings.heroText||DATA.settings.tagline;
renderStats();setupFilters();renderProfiles();renderServices();renderPosts();renderGroups();setupReveal();setupScrollspy();setupWhatsappFloat();
const modalStyle=document.createElement("style");modalStyle.textContent=`.profile-modal{position:fixed;inset:0;z-index:200;display:grid;place-items:center;padding:18px;opacity:0;transition:.25s}.profile-modal.open{opacity:1}.modal-backdrop{position:absolute;inset:0;background:rgba(1,5,12,.78);backdrop-filter:blur(10px)}.modal-card{position:relative;width:min(600px,100%);max-height:90vh;overflow:auto;border-radius:28px;padding:27px;transform:translateY(15px);transition:.25s}.profile-modal.open .modal-card{transform:none}.modal-close{position:absolute;right:16px;top:14px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:white;border-radius:10px;width:34px;height:34px;font-size:22px}.modal-card h2{font-size:35px;margin:4px 0}.modal-role{color:#8fa0b7;font-size:12px}.modal-card h4{font-size:10px;letter-spacing:.17em;color:#71849d;margin:25px 0 12px}.modal-skills{display:grid;gap:13px}.modal-actions{display:flex;gap:8px}.modal-actions .btn{flex:1}`;document.head.appendChild(modalStyle);




(() => {
  const $ = (s,p=document) => p.querySelector(s);
  const $$ = (s,p=document) => [...p.querySelectorAll(s)];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
  });

  $$(".reveal, .reveal-left, .reveal-right, .reveal-scale").forEach(el => observer.observe(el));

  const topbar = $(".topbar");
  const handleScroll = () => {
    if(!topbar) return;
    topbar.classList.toggle("scrolled", window.scrollY > 18);
  };
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  const menuBtn = $("#menuBtn");
  const mobileMenu = $("#mobileMenu");
  if(menuBtn && mobileMenu){
    menuBtn.addEventListener("click", () => {
      menuBtn.classList.toggle("active");
      mobileMenu.classList.toggle("open");
    });
    mobileMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        menuBtn.classList.remove("active");
      });
    });
  }

  function animateCounter(el, target, duration = 1200){
    const startTime = performance.now();
    function tick(now){
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.floor(target * eased);
      if(progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counters = $$("[data-target]");
  if(counters.length){
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          animateCounter(entry.target, parseInt(entry.target.dataset.target || "0", 10));
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  const heroCard = $(".hero-card");
  if(heroCard && window.matchMedia("(pointer:fine)").matches){
    window.addEventListener("mousemove", (e) => {
      const rect = heroCard.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if(!inside){
        heroCard.style.transform = "";
        return;
      }

      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroCard.style.transform = `rotateX(${(-y * 5)}deg) rotateY(${(x * 6)}deg) translateY(-4px)`;
    });

    heroCard.addEventListener("mouseleave", () => {
      heroCard.style.transform = "";
    });
  }

  ["#profilesGrid","#servicesGrid","#groupsGrid","#postsGrid","#myPosts","#myServices","#myGroups","#skillsEditor","#profilesAdminList"].forEach(selector => {
    const container = $(selector);
    if(!container) return;

    const mo = new MutationObserver(() => {
      [...container.children].forEach((child, index) => {
        child.style.animation = "none";
        child.offsetHeight;
        child.style.animation = `fadeUp .7s cubic-bezier(.16,1,.3,1) forwards`;
        child.style.animationDelay = `${0.05 + index * 0.06}s`;
      });
    });
    mo.observe(container, { childList: true });
  });

  function rippleEffect(e){
    const btn = e.currentTarget;
    const old = btn.querySelector(".ripple");
    if(old) old.remove();

    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;
    const rect = btn.getBoundingClientRect();

    circle.className = "ripple";
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.style.position = "absolute";
    circle.style.borderRadius = "50%";
    circle.style.transform = "scale(0)";
    circle.style.background = "rgba(255,255,255,.22)";
    circle.style.pointerEvents = "none";
    circle.style.animation = "ripple .6s ease-out forwards";

    btn.appendChild(circle);
  }

  const style = document.createElement("style");
  style.textContent = `
    @keyframes ripple{
      to{
        transform:scale(2.8);
        opacity:0;
      }
    }
  `;
  document.head.appendChild(style);

  $$("button, .btn, .icon-btn, .viewer-btn, .chip").forEach(el => {
    el.addEventListener("click", rippleEffect);
  });
})();
