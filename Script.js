// ----------------- INIT DATA -----------------
let categories = JSON.parse(localStorage.getItem("categories")) || ["Tous"];
let likes = JSON.parse(localStorage.getItem("likes")) || {};
let storedPhotos = JSON.parse(localStorage.getItem("photos")) || [];
let photos = storedPhotos.map(p => ({
  src: p.src,
  alt: p.alt || "",
  desc: p.desc || "",
  category: p.category || "Tous",
  id: p.id || (Date.now() + "_" + Math.floor(Math.random()*100000)),
  views: p.views || 0
}));
let currentCategoryFilter = "Tous";
let userLikes = JSON.parse(localStorage.getItem("userLikes")) || [];

// ----------------- DOM -----------------
const galleryContainer = document.getElementById("gallery-container");
const categoryButtonsDiv = document.getElementById("category-buttons");
const adminBtn = document.getElementById("admin-btn");
const adminPanel = document.getElementById("admin-panel");
const adminPassInput = document.getElementById("admin-pass");
const loginAdminBtn = document.getElementById("login-admin");
const adminTools = document.getElementById("admin-tools");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");
const siteMessageModal = document.getElementById("site-message-modal");
const siteMessageContent = document.getElementById("site-message-content");
const siteMessageClose = document.getElementById("site-message-close");
const siteMessageOk = document.getElementById("site-message-ok");

// ----------------- SITE MESSAGE -----------------
function showSiteMessage(msg){
  siteMessageContent.textContent = msg;
  siteMessageModal.style.display="flex";
}
siteMessageClose.addEventListener("click",()=>{siteMessageModal.style.display="none";});
siteMessageOk.addEventListener("click",()=>{siteMessageModal.style.display="none";});

// ----------------- SAVE -----------------
function saveData(){
  localStorage.setItem("photos",JSON.stringify(photos));
  localStorage.setItem("categories",JSON.stringify(categories));
  localStorage.setItem("likes",JSON.stringify(likes));
  localStorage.setItem("userLikes",JSON.stringify(userLikes));
}

// ----------------- ADMIN -----------------
adminBtn.addEventListener("click",()=>{adminPanel.style.display=adminPanel.style.display==="block"?"none":"block";});
const ADMIN_CODE="admin123";
if(loginAdminBtn) loginAdminBtn.addEventListener("click",()=>{
  const pass=adminPassInput.value.trim();
  if(pass===ADMIN_CODE){adminTools.style.display="block"; showSiteMessage("✅ Admin connecté"); updateAdminLists();}
  else showSiteMessage("❌ Code admin incorrect");
});

// ----------------- CATEGORY -----------------
function addCategory(){
  const input=document.getElementById("new-category");
  const name=input.value.trim();
  if(!name) return showSiteMessage("Nom vide !");
  if(categories.includes(name)) return showSiteMessage("Catégorie existe déjà !");
  categories.push(name); currentCategoryFilter="Tous";
  saveData(); updateAdminLists(); renderCategoryButtons(); renderGallery();
  input.value="";
}
function deleteCategory(){
  const select=document.getElementById("delete-category");
  const cat=select.value
  if(!cat) return;
  categories = categories.filter(c => c !== cat);
  photos = photos.map(p => ({ ...p, category: p.category === cat ? "Tous" : p.category }));
  if(currentCategoryFilter === cat) currentCategoryFilter = "Tous";
  saveData(); updateAdminLists(); renderCategoryButtons(); renderGallery();
}

// ----------------- PHOTO -----------------
function addPhotoByUrl(){
  const urlInput=document.getElementById("photo-url");
  const altInput=document.getElementById("photo-alt");
  const descInput=document.getElementById("photo-description");
  const catSelect=document.getElementById("photo-category");
  const src=urlInput.value.trim();
  if(!src) return showSiteMessage("Lien image vide !");
  const alt=altInput.value.trim()||"Photo";
  const desc=descInput.value.trim()||"";
  const category=catSelect.value||"Tous";
  const id=Date.now()+"_"+Math.floor(Math.random()*100000);
  photos.push({src, alt, desc, category, id, views:0});
  currentCategoryFilter="Tous";
  saveData(); updateAdminLists(); renderCategoryButtons(); renderGallery();
  urlInput.value=""; altInput.value=""; descInput.value="";
}

function deletePhoto(){
  const select=document.getElementById("delete-photo");
  const idx=parseInt(select.value);
  if(idx<0 || idx>=photos.length) return;
  photos.splice(idx,1);
  saveData(); updateAdminLists(); renderGallery(); updateStats();
}

// ----------------- CATEGORY BUTTONS -----------------
function renderCategoryButtons(){
  categoryButtonsDiv.innerHTML="";
  const allBtn=document.createElement("button");
  allBtn.textContent="TOUT";
  allBtn.className="category-btn"+(currentCategoryFilter==="Tous"?" active":"");
  allBtn.onclick=()=>{currentCategoryFilter="Tous"; renderGallery(); renderCategoryButtons();};
  categoryButtonsDiv.appendChild(allBtn);
  categories.filter(c=>c!=="Tous").forEach(cat=>{
    const btn=document.createElement("button");
    btn.textContent=cat;
    btn.className="category-btn"+(currentCategoryFilter===cat?" active":"");
    btn.onclick=()=>{currentCategoryFilter=cat; renderGallery(); renderCategoryButtons();};
    categoryButtonsDiv.appendChild(btn);
  });
}

// ----------------- GALLERY -----------------
function renderGallery(){
  galleryContainer.innerHTML="";
  const displayPhotos=currentCategoryFilter==="Tous"?photos:photos.filter(p=>p.category===currentCategoryFilter);
  const section=document.createElement("div"); section.className="category-section";
  const title=document.createElement("h2"); title.textContent=currentCategoryFilter; section.appendChild(title);
  const grid=document.createElement("div"); grid.className="photo-grid";

  displayPhotos.forEach(p=>{
    const div=document.createElement("div"); div.className="photo-item";

    // Image click → lightbox
    const img=document.createElement("img");
    img.src=p.src; img.alt=p.alt; img.style.cursor="pointer";
    img.addEventListener("click",()=>openLightbox(photos.indexOf(p)));
    div.appendChild(img);

    // Caption
    const caption=document.createElement("div"); caption.style.marginTop="6px";
    caption.innerHTML=`<b>${p.alt}</b><div style="font-size:0.85rem;color:#ddd">${p.category}</div>`;
    div.appendChild(caption);

    // Like button
    const actions=document.createElement("div"); actions.className="photo-actions";
    const liked=userLikes.includes(p.id);
    const likeBtn=document.createElement("button");
    likeBtn.textContent=`❤️ ${liked?'Unlike':'J\'aime'} (${likes[p.id]||0})`;
    likeBtn.style.cursor="pointer";
    likeBtn.addEventListener("click",e=>{e.stopPropagation(); toggleLike(p.id);});
    actions.appendChild(likeBtn);
    div.appendChild(actions);

    grid.appendChild(div);
  });

  if(displayPhotos.length===0){
    const empty=document.createElement("p"); empty.textContent="Aucune photo pour l'instant.";
    section.appendChild(empty);
  }else section.appendChild(grid);

  galleryContainer.appendChild(section);
  updateAdminLists(); updateStats();
}

// ----------------- LIGHTBOX -----------------
function openLightbox(idx){
  if(idx<0 || idx>=photos.length) return;
  const p=photos[idx]; p.views++;
  saveData(); updateStats();
  lightboxImg.src=p.src;
  lightboxCaption.textContent=`${p.alt} — ${p.desc||""}`;
  lightbox.style.display="flex";
}
lightboxClose.addEventListener("click",()=>{lightbox.style.display="none";});
lightbox.addEventListener("click",e=>{if(e.target===lightbox) lightbox.style.display="none";});

// ----------------- LIKES -----------------
function toggleLike(photoId){
  const p=photos.find(ph=>ph.id===photoId);
  if(!p) return;
  if(userLikes.includes(p.id)){
    userLikes=userLikes.filter(id=>id!==p.id);
    likes[p.id]=Math.max((likes[p.id]||1)-1,0);
  }else{
    userLikes.push(p.id);
    likes[p.id]=(likes[p.id]||0)+1;
  }
  saveData(); renderGallery(); updateStats();
}

// ----------------- RESET -----------------
function resetGallery(){
  photos=photos.map(p=>({...p, views:0}));
  likes={}; userLikes=[]; currentCategoryFilter="Tous";
  saveData(); renderCategoryButtons(); renderGallery(); updateStats();
  showSiteMessage("✅ Galerie réinitialisée ! Tous les likes et vues sont remis à zéro.");
}

// ----------------- ADMIN LISTS -----------------
function updateAdminLists(){
  const photoSelect=document.getElementById("delete-photo");
  if(photoSelect){photoSelect.innerHTML=""; photos.forEach((p,i)=>{const opt=document.createElement("option"); opt.value=i; opt.textContent=`${p.alt} (${p.category})`; photoSelect.appendChild(opt);});}
  const catDel=document.getElementById("delete-category");
  if(catDel){catDel.innerHTML=""; categories.forEach(c=>{if(c!=="Tous"){const opt=document.createElement("option"); opt.value=c; opt.textContent=c; catDel.appendChild(opt);}});}
  const catAdd=document.getElementById("photo-category");
  if(catAdd){catAdd.innerHTML=""; categories.forEach(c=>{const opt=document.createElement("option"); opt.value=c; opt.textContent=c; catAdd.appendChild(opt);});}
}

// ----------------- STATS -----------------
function updateStats(){
  const totalPhotos=photos.length;
  const totalViews=photos.reduce((acc,p)=>acc+(p.views||0),0);
  const totalLikes=Object.values(likes).reduce((acc,n)=>acc+n,0);
  document.getElementById("stat-photos")?.textContent=`Photos: ${totalPhotos}`;
  document.getElementById("stat-views")?.textContent=`Vues: ${totalViews}`;
  document.getElementById("stat-likes")?.textContent=`Likes: ${totalLikes}`;
}

// ----------------- INIT -----------------
renderCategoryButtons(); renderGallery(); updateStats(); updateAdminLists();

// ----------------- RESET BUTTON -----------------
const resetBtn=document.getElementById("reset-gallery");
if(resetBtn) resetBtn.addEventListener("click", resetGallery);
