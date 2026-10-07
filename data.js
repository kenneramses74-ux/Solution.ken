/* Informatique Pro — couche de données (localStorage, sans backend).
   Aucun profil, compétence, service, publication ou groupe n'est écrit ici :
   tout est créé et rempli par l'utilisateur/administrateur depuis admin.html. */

const IP_DEFAULT = {
  settings: {
    adminCode: "INFO-PRO-2026",
    siteName: "Informatique Pro",
    tagline: "Boostez votre activité. Montrez ce que vous savez faire.",
    heroText: "Informatique Pro réunit des étudiants, leurs compétences, leurs services, leurs projets et leurs groupes dans une interface moderne."
  },
  profiles: [],
  services: [],
  posts: [],
  groups: []
};

/* Icônes disponibles pour services et groupes (choisies dans l'admin, pas codées en dur par profil). */
const IP_ICONS = ["🌐","🎨","🤖","🎬","📄","🚀","💻","👥","📈","🛠️","📚","✨","🎯","📷","🎵","🧠","🕹️","🧩","🔒","🧪"];

function loadIPData(){
  const saved = localStorage.getItem("informatiqueProData");
  if(!saved){ localStorage.setItem("informatiqueProData",JSON.stringify(IP_DEFAULT)); return structuredClone(IP_DEFAULT); }
  try{
    const data=JSON.parse(saved);
    return {...structuredClone(IP_DEFAULT),...data,settings:{...IP_DEFAULT.settings,...(data.settings||{})}};
  }catch(e){ localStorage.setItem("informatiqueProData",JSON.stringify(IP_DEFAULT)); return structuredClone(IP_DEFAULT); }
}
function saveIPData(data){
  try{
    localStorage.setItem("informatiqueProData",JSON.stringify(data));
    return true;
  }catch(e){
    console.error("Espace de stockage insuffisant :",e);
    return false;
  }
}
function ipId(prefix="id"){ return prefix+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7); }

/* Sauvegarde/restauration : le site ne vit que dans le localStorage du navigateur,
   donc l'export/import en JSON est la seule façon de ne pas perdre les données. */
function ipExportData(){
  const data = localStorage.getItem("informatiqueProData") || JSON.stringify(IP_DEFAULT);
  const blob = new Blob([data], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0,10);
  a.href = url; a.download = `informatique-pro-sauvegarde-${date}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function ipImportData(file){
  return new Promise((resolve,reject)=>{
    if(!file) return reject(new Error("Aucun fichier choisi."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.onload = () => {
      let parsed;
      try{ parsed = JSON.parse(reader.result); }
      catch(e){ return reject(new Error("Ce fichier n'est pas un JSON valide.")); }
      const requiredKeys = ["settings","profiles","services","posts","groups"];
      if(!requiredKeys.every(k=>k in parsed)) return reject(new Error("Ce fichier ne ressemble pas à une sauvegarde Informatique Pro."));
      const merged = {...structuredClone(IP_DEFAULT),...parsed,settings:{...IP_DEFAULT.settings,...(parsed.settings||{})}};
      if(!saveIPData(merged)) return reject(new Error("Échec de l'enregistrement (fichier trop volumineux pour le stockage local)."));
      resolve(merged);
    };
    reader.readAsText(file);
  });
}

/* Compresse/redimensionne une image choisie par l'utilisateur avant de la stocker en base64,
   pour garder localStorage utilisable (limite ~5 Mo selon les navigateurs). */
function ipReadImageFile(file, maxSize=640, quality=0.82){
  return new Promise((resolve,reject)=>{
    if(!file) return reject(new Error("Aucun fichier."));
    if(!file.type.startsWith("image/")) return reject(new Error("Le fichier choisi n'est pas une image."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image illisible."));
      img.onload = () => {
        let {width,height} = img;
        if(width>maxSize || height>maxSize){
          if(width>height){ height=Math.round(height*maxSize/width); width=maxSize; }
          else { width=Math.round(width*maxSize/height); height=maxSize; }
        }
        const canvas = document.createElement("canvas");
        canvas.width=width; canvas.height=height;
        canvas.getContext("2d").drawImage(img,0,0,width,height);
        resolve(canvas.toDataURL("image/jpeg",quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
