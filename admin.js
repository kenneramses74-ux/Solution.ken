let DATA=loadIPData();let currentId=localStorage.getItem("ip_admin_id");let current=null;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
let pendingServiceIcon="🌐", pendingGroupIcon="👥";
function initials(n){return(n||"?").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function save(){return saveIPData(DATA)}
function refresh(){DATA=loadIPData();current=DATA.profiles.find(p=>p.id===currentId)||DATA.profiles[0]}
function avatar(p){return p.photo?`<div class="avatar"><img src="${esc(p.photo)}" alt=""></div>`:`<div class="avatar">${esc(initials(p.name))}</div>`}
function toast(m){let x=$("#toast");if(!x){x=document.createElement("div");x.id="toast";x.className="toast";document.body.append(x)}x.textContent=m;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2200)}

$("#loginForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("#loginName").value.trim(),code=$("#loginCode").value;
  if(code!==DATA.settings.adminCode){toast("Code d'accès incorrect.");return}
  let p=DATA.profiles.find(x=>x.name.toLowerCase()===name.toLowerCase());
  if(!p){
    p={id:ipId("p"),name,role:"",bio:"",availability:"Disponible",whatsapp:"",photo:"",skills:[]};
    DATA.profiles.push(p);save();
  }
  currentId=p.id;localStorage.setItem("ip_admin_id",currentId);showApp();
});
$("#logoutBtn").addEventListener("click",()=>{localStorage.removeItem("ip_admin_id");location.reload()});

function showApp(){
  refresh();
  $("#adminLogin").classList.add("hidden");$("#adminApp").classList.remove("hidden");
  $("#sideAvatar").innerHTML=current.photo?`<img src="${esc(current.photo)}" alt="">`:esc(initials(current.name));
  $("#sideName").textContent=current.name;
  $("#today").textContent=new Date().toLocaleDateString("fr-FR",{weekday:"short",day:"2-digit",month:"short"});
  renderAll();
}

function tab(name){
  $$(".admin-sidebar nav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));
  $$(".admin-tab").forEach(x=>x.classList.remove("active"));
  $("#tab-"+name).classList.add("active");
  $("#adminTitle").textContent={dashboard:"Tableau de bord",profile:"Mon profil",skills:"Compétences",posts:"Publications",services:"Services",groups:"Groupes",settings:"Paramètres"}[name];
}
$$(".admin-sidebar nav button").forEach(b=>b.onclick=()=>tab(b.dataset.tab));
$$("[data-tab-link]").forEach(b=>b.onclick=()=>tab(b.dataset.tabLink));
$("#adminMenuBtn").onclick=()=>$(".admin-sidebar").classList.toggle("open");

function renderDashboard(){
  const counts=[DATA.profiles.length,DATA.posts.length,DATA.services.length,DATA.groups.length];
  ["dProfiles","dPosts","dServices","dGroups"].forEach((id,i)=>$("#"+id).textContent=counts[i]);
  $("#dashboardPreview").innerHTML=(current.name||current.bio)
    ? `<div class="preview-head">${avatar(current)}<div><h3>${esc(current.name||"Sans nom")}</h3><small>${esc(current.role||"Rôle non renseigné")}</small></div></div><p class="muted">${esc(current.bio||"Aucune présentation pour l'instant.")}</p>`
    : `<p class="muted">Votre profil est vide. Rendez-vous dans « Mon profil » pour le remplir.</p>`;
}

/* --- Profil : photo par upload --- */
function setImagePreview(el,value,placeholder){el.innerHTML=value?`<img src="${esc(value)}" alt="">`:esc(placeholder);}
function renderProfileForm(){
  $("#pName").value=current.name||"";$("#pRole").value=current.role||"";$("#pBio").value=current.bio||"";
  $("#pAvailability").value=current.availability||"Disponible";$("#pWhatsApp").value=current.whatsapp||"";
  setImagePreview($("#pPhotoPreview"),current.photo,initials(current.name||"?"));
}
$("#pPhotoFile").addEventListener("change",async e=>{
  const file=e.target.files[0];if(!file)return;
  try{ const dataUrl=await ipReadImageFile(file); current.photo=dataUrl; setImagePreview($("#pPhotoPreview"),dataUrl,"?"); }
  catch(err){ toast(err.message||"Image invalide."); }
  e.target.value="";
});
$("#pPhotoRemove").addEventListener("click",()=>{current.photo="";setImagePreview($("#pPhotoPreview"),"",initials(current.name||"?"));});
$("#profileForm").addEventListener("submit",e=>{
  e.preventDefault();
  Object.assign(current,{name:$("#pName").value.trim(),role:$("#pRole").value.trim(),bio:$("#pBio").value.trim(),availability:$("#pAvailability").value,whatsapp:$("#pWhatsApp").value.replace(/\D/g,"")});
  DATA.profiles=DATA.profiles.map(p=>p.id===current.id?current:p);
  if(save()){ showApp(); tab("profile"); toast("Profil enregistré."); }
  else toast("Échec de l'enregistrement (stockage plein ?).");
});

/* --- Compétences --- */
function renderSkills(){
  $("#skillsEditor").innerHTML=(current.skills||[]).map((s,i)=>`<div class="editor-row"><input data-si="${i}" class="skill-name" value="${esc(s[0])}" placeholder="Nom de la compétence"><input data-si="${i}" class="skill-value" type="number" min="0" max="100" value="${s[1]}"><button class="btn btn-secondary remove-skill" data-si="${i}">Supprimer</button></div>`).join("")||`<p class="muted">Aucune compétence. Cliquez sur « Ajouter ».</p>`;
}
$("#addSkillBtn").onclick=()=>{current.skills=current.skills||[];current.skills.push(["Nouvelle compétence",50]);save();renderSkills()}
$("#skillsEditor").addEventListener("click",e=>{if(!e.target.classList.contains("remove-skill"))return;current.skills.splice(+e.target.dataset.si,1);save();renderSkills()});
$("#skillsEditor").addEventListener("input",e=>{const i=+e.target.dataset.si;if(e.target.classList.contains("skill-name"))current.skills[i][0]=e.target.value;if(e.target.classList.contains("skill-value"))current.skills[i][1]=Math.max(0,Math.min(100,+e.target.value||0));save()});

/* --- Publications --- */
$("#postImageFile").addEventListener("change",async e=>{
  const file=e.target.files[0];if(!file)return;
  try{ const dataUrl=await ipReadImageFile(file,900); $("#postForm").dataset.image=dataUrl; setImagePreview($("#postImagePreview"),dataUrl,"✦"); }
  catch(err){ toast(err.message||"Image invalide."); }
  e.target.value="";
});
$("#postImageRemove").addEventListener("click",()=>{$("#postForm").dataset.image="";setImagePreview($("#postImagePreview"),"","✦");});
$("#postForm").addEventListener("submit",e=>{
  e.preventDefault();
  DATA.posts.push({id:ipId("post"),title:$("#postTitle").value.trim(),category:$("#postCategory").value.trim(),content:$("#postContent").value.trim(),image:$("#postForm").dataset.image||"",authorId:current.id});
  save();e.target.reset();$("#postCategory").value="Actualité";$("#postForm").dataset.image="";setImagePreview($("#postImagePreview"),"","✦");
  renderAll();tab("posts");toast("Publication ajoutée.");
});
function renderPosts(){
  const list=DATA.posts.filter(x=>x.authorId===current.id).slice().reverse();
  $("#myPosts").innerHTML=list.map(x=>`<div class="admin-item"><div><strong>${esc(x.title)}</strong><small>${esc(x.category)}</small></div><button class="btn btn-secondary del-post" data-id="${x.id}">Supprimer</button></div>`).join("")||`<p class="muted">Vous n'avez pas encore publié.</p>`;
}
$("#myPosts").addEventListener("click",e=>{if(!e.target.classList.contains("del-post"))return;if(confirm("Supprimer cette publication ?")){DATA.posts=DATA.posts.filter(x=>x.id!==e.target.dataset.id);save();renderAll();toast("Publication supprimée.")}});

/* --- Sélecteur d'icônes (services / groupes) --- */
function buildIconPicker(containerId,selected,onPick){
  const el=$("#"+containerId);
  el.innerHTML=IP_ICONS.map(icon=>`<button type="button" class="icon-option ${icon===selected?"active":""}" data-icon="${icon}">${icon}</button>`).join("");
  el.querySelectorAll(".icon-option").forEach(btn=>btn.addEventListener("click",()=>{
    el.querySelectorAll(".icon-option").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");onPick(btn.dataset.icon);
  }));
}
buildIconPicker("serviceIconPicker",pendingServiceIcon,icon=>pendingServiceIcon=icon);
buildIconPicker("groupIconPicker",pendingGroupIcon,icon=>pendingGroupIcon=icon);

/* --- Services --- */
$("#serviceForm").addEventListener("submit",e=>{
  e.preventDefault();
  DATA.services.push({id:ipId("s"),title:$("#serviceTitle").value.trim(),category:$("#serviceCategory").value.trim(),icon:pendingServiceIcon,description:$("#serviceDescription").value.trim(),ownerId:current.id});
  save();e.target.reset();$("#serviceCategory").value="Numérique";
  pendingServiceIcon="🌐";buildIconPicker("serviceIconPicker",pendingServiceIcon,icon=>pendingServiceIcon=icon);
  renderAll();toast("Service ajouté.");
});
function renderServices(){
  const list=DATA.services.filter(x=>x.ownerId===current.id);
  $("#myServices").innerHTML=list.map(x=>`<div class="admin-item"><div><strong>${x.icon||"✦"} ${esc(x.title)}</strong><small>${esc(x.category)}</small></div><button class="btn btn-secondary del-service" data-id="${x.id}">Supprimer</button></div>`).join("")||`<p class="muted">Aucun service personnel pour le moment.</p>`;
}
$("#myServices").addEventListener("click",e=>{if(!e.target.classList.contains("del-service"))return;DATA.services=DATA.services.filter(x=>x.id!==e.target.dataset.id);save();renderAll();toast("Service supprimé.")});

/* --- Groupes --- */
$("#groupForm").addEventListener("submit",e=>{
  e.preventDefault();
  DATA.groups.push({id:ipId("g"),name:$("#groupName").value.trim(),theme:$("#groupTheme").value.trim(),description:$("#groupDescription").value.trim(),members:1,ownerId:current.id,icon:pendingGroupIcon});
  save();e.target.reset();
  pendingGroupIcon="👥";buildIconPicker("groupIconPicker",pendingGroupIcon,icon=>pendingGroupIcon=icon);
  renderAll();toast("Groupe créé.");
});
function renderGroups(){
  const list=DATA.groups.filter(x=>x.ownerId===current.id);
  $("#myGroups").innerHTML=list.map(x=>`<div class="admin-item"><div><strong>${x.icon||"👥"} ${esc(x.name)}</strong><small>${esc(x.theme)} • ${x.members} membres</small></div><button class="btn btn-secondary del-group" data-id="${x.id}">Supprimer</button></div>`).join("")||`<p class="muted">Vous n'avez pas encore créé de groupe.</p>`;
}
$("#myGroups").addEventListener("click",e=>{if(!e.target.classList.contains("del-group"))return;DATA.groups=DATA.groups.filter(x=>x.id!==e.target.dataset.id);save();renderAll();toast("Groupe supprimé.")});

/* --- Paramètres --- */
function renderSettings(){
  $("#setSiteName").value=DATA.settings.siteName||"";
  $("#setAdminCode").value=DATA.settings.adminCode||"";
  $("#setTagline").value=DATA.settings.tagline||"";
}
$("#settingsForm").addEventListener("submit",e=>{
  e.preventDefault();
  DATA.settings.siteName=$("#setSiteName").value.trim()||"Informatique Pro";
  DATA.settings.adminCode=$("#setAdminCode").value.trim()||DATA.settings.adminCode;
  DATA.settings.tagline=$("#setTagline").value.trim();
  save();toast("Paramètres enregistrés.");
});
$("#exportDataBtn").addEventListener("click",()=>{ ipExportData(); toast("Sauvegarde téléchargée."); });
$("#importDataFile").addEventListener("change",async e=>{
  const file=e.target.files[0]; if(!file){return;}
  if(!confirm("Importer cette sauvegarde remplacera toutes les données actuelles (profils, services, publications, groupes, paramètres). Continuer ?")){ e.target.value=""; return; }
  try{
    const merged = await ipImportData(file);
    if(!merged.profiles.some(p=>p.id===currentId)){
      alert("Sauvegarde importée. Votre profil actuel n'y figure plus : reconnectez-vous.");
      localStorage.removeItem("ip_admin_id"); location.reload(); return;
    }
    toast("Sauvegarde importée."); refresh(); renderAll();
  }
  catch(err){ toast(err.message||"Import impossible."); }
  e.target.value="";
});

function renderAll(){refresh();renderDashboard();renderProfileForm();renderSkills();renderPosts();renderServices();renderGroups();renderSettings();}
if(currentId)showApp();


const videos = document.querySelectorAll(".publication-video");

const videoObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {

            const video = entry.target;

            if (entry.isIntersecting) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }

        });
    },
    {
        threshold: 0.6
    }
);

videos.forEach(video => {
    videoObserver.observe(video);
});




(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  /* =========================
     Apparition au scroll
     ========================= */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
  });

  $$(".reveal, .reveal-left, .reveal-right, .reveal-scale").forEach(el => {
    observer.observe(el);
  });

  /* =========================
     Topbar au scroll
     ========================= */
  const topbar = $(".topbar");
  const handleScroll = () => {
    if (!topbar) return;
    topbar.classList.toggle("scrolled", window.scrollY > 18);
  };
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  /* =========================
     Menu mobile
     ========================= */
  const menuBtn = $("#menuBtn");
  const mobileMenu = $("#mobileMenu");

  if (menuBtn && mobileMenu) {
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

  /* =========================
     Compteurs animés
     Ajoute data-target sur tes chiffres
     exemple : <strong data-target="12">0</strong>
     ========================= */
  function animateCounter(el, target, duration = 1200) {
    const start = 0;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const value = Math.floor(start + (target - start) * eased);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const counters = $$("[data-target]");
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target || "0", 10);
          animateCounter(el, target);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  /* =========================
     Effet léger sur la carte hero
     ========================= */
  const heroCard = $(".hero-card");
  if (heroCard && window.matchMedia("(pointer:fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      const rect = heroCard.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!inside) {
        heroCard.style.transform = "";
        return;
      }

      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      heroCard.style.transform = `
        rotateX(${(-y * 5)}deg)
        rotateY(${(x * 6)}deg)
        translateY(-4px)
      `;
    });

    heroCard.addEventListener("mouseleave", () => {
      heroCard.style.transform = "";
    });
  }

  /* =========================
     Animation des cartes quand elles changent
     ========================= */
  const grids = ["#profilesGrid", "#servicesGrid", "#groupsGrid", "#postsGrid", "#myPosts", "#myServices", "#myGroups", "#skillsEditor"];

  grids.forEach(selector => {
    const container = $(selector);
    if (!container) return;

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

  /* =========================
     Ripple sur les boutons
     ========================= */
  function rippleEffect(e) {
    const btn = e.currentTarget;
    const old = btn.querySelector(".ripple");
    if (old) old.remove();

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

  const rippleStyle = document.createElement("style");
  rippleStyle.textContent = `
    @keyframes ripple{
      to{
        transform:scale(2.8);
        opacity:0;
      }
    }
  `;
  document.head.appendChild(rippleStyle);

  $$("button, .btn, .icon-btn, .viewer-btn, .chip").forEach(el => {
    el.addEventListener("click", rippleEffect);
  });

  /* =========================
     Visionneuse / modal
     ========================= */
  const viewer = $("#fileViewer");
  if (viewer) {
    const openAnim = () => viewer.classList.add("open");
    const closeAnim = () => viewer.classList.remove("open");

    const openBtn = $("#viewerOpenNew");
    const closeBtn = $("#viewerClose");

    if (closeBtn) {
      closeBtn.addEventListener("click", closeAnim);
    }

    viewer.addEventListener("click", (e) => {
      if (e.target === viewer) closeAnim();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAnim();
    });

    // Si ta logique ouvre la modale via JS, appelle juste viewer.classList.add("open")
    // ou openAnim() si tu veux conserver la fonction.
    window.openFileViewerAnimation = openAnim;
    window.closeFileViewerAnimation = closeAnim;
  }

})();
