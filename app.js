(() => {
const cfg = window.MAXPLUS_CONFIG || {};
const configured = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
  !cfg.SUPABASE_URL.includes("COLE_AQUI") && !cfg.SUPABASE_ANON_KEY.includes("COLE_AQUI");
const sb = configured && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
const defaults = {
  title:"Filmes, séries e futebol ao vivo em um só lugar",
  subtitle:"Milhares de opções de entretenimento para assistir nos seus dispositivos favoritos.",
  whatsapp:cfg.WHATSAPP || "5511940802230",
  cards:[
    {type:"filmes",tag:"Lançamento",title:"Filme em destaque 1",desc:"Lançamento 2026 · Ação",image:""},
    {type:"filmes",tag:"Em alta",title:"Filme em destaque 2",desc:"Sucesso 2026 · Aventura",image:""},
    {type:"filmes",tag:"Novo",title:"Filme em destaque 3",desc:"Estreia · Ficção",image:""},
    {type:"series",tag:"Nova temporada",title:"Série em destaque 1",desc:"Nova temporada · Drama",image:""},
    {type:"series",tag:"Maratone",title:"Série em destaque 2",desc:"Todos os episódios · Suspense",image:""},
    {type:"series",tag:"Estreia",title:"Série em destaque 3",desc:"Estreia · Ação",image:""},
    {type:"jogos",tag:"Ao vivo hoje",title:"Time A x Time B",desc:"Hoje · 21h30 · Campeonato",image:""},
    {type:"jogos",tag:"Hoje",title:"Time C x Time D",desc:"Hoje · 19h00 · Campeonato",image:""}
  ],
  plans:[
    {name:"Mensal",price:"35,00",period:"1 mês de acesso",featured:false},
    {name:"Trimestral",price:"95,00",period:"3 meses de acesso",featured:false},
    {name:"Semestral",price:"180,00",period:"6 meses de acesso",featured:true},
    {name:"Anual",price:"295,00",period:"12 meses de acesso",featured:false}
  ]
};
let data = structuredClone(defaults), user = null, editorTab = "conteudo";
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3200)}
function wa(text){return `https://wa.me/${String(data.whatsapp||defaults.whatsapp).replace(/\D/g,"")}?text=${encodeURIComponent(text)}`}
function renderCards(type="filmes"){
 const cards=data.cards.filter(c=>c.type===type);
 $("poster-grid").innerHTML=cards.map(c=>`<article class="poster">${c.image?`<img src="${esc(c.image)}" alt="">`:`<div class="poster-img-placeholder"></div>`}<div class="poster-info"><small>${esc(c.tag)}</small><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p></div></article>`).join("") || '<p class="hint">Nenhum destaque cadastrado.</p>';
}
function renderPlans(){
 $("plan-grid").innerHTML=data.plans.map(p=>`<article class="plan ${p.featured?"featured":""}">${p.featured?'<span class="tag">MELHOR CUSTO</span>':''}<h3>${esc(p.name)}</h3><div class="price">R$ ${esc(p.price)}</div><ul><li>${esc(p.period)}</li><li>Consulte os detalhes</li><li>Suporte pelo WhatsApp</li></ul><a class="btn" href="${wa(`Olá! Quero informações sobre o plano ${p.name} do Max Plus (R$ ${p.price}).`)}" target="_blank" rel="noopener">Assinar</a></article>`).join("");
}
function renderPublic(){ $("hero-title").textContent=data.title; $("hero-subtitle").textContent=data.subtitle; renderCards();renderPlans(); }
function ensureHeroIds(){const h=document.querySelector(".hero h1"),p=document.querySelector(".hero-copy>p");h.id="hero-title";p.id="hero-subtitle";}
function setEditorTab(tab){editorTab=tab;$("editor-content").classList.toggle("hidden",tab!=="conteudo");$("editor-plans").classList.toggle("hidden",tab!=="planos");document.querySelectorAll("[data-editor-tab]").forEach(b=>b.classList.toggle("active",b.dataset.editorTab===tab));}
function renderEditor(){
 $("edit-title").value=data.title;$("edit-subtitle").value=data.subtitle;$("edit-whatsapp").value=data.whatsapp;
 $("edit-cards").innerHTML=data.cards.map((c,i)=>`<div class="edit-card"><img id="preview-${i}" src="${esc(c.image||"")}" alt=""><div class="edit-fields"><label>Título<input data-card="${i}" data-field="title" value="${esc(c.title)}"></label><label>Descrição<input data-card="${i}" data-field="desc" value="${esc(c.desc)}"></label><label>Etiqueta<input data-card="${i}" data-field="tag" value="${esc(c.tag)}"></label><div><button type="button" class="file-label" data-choose="${i}">Escolher imagem</button><input class="file-input" id="file-${i}" type="file" accept="image/*" data-file="${i}"><button type="button" class="tab" data-remove="${i}">Remover imagem</button></div></div></div>`).join("");
 $("edit-plans").innerHTML=data.plans.map((p,i)=>`<div class="edit-card"><div class="edit-fields" style="grid-column:1/-1"><label>Nome do plano<input data-plan="${i}" data-field="name" value="${esc(p.name)}"></label><label>Preço (ex.: 35,00)<input data-plan="${i}" data-field="price" value="${esc(p.price)}"></label><label>Período<input data-plan="${i}" data-field="period" value="${esc(p.period)}"></label><label><input type="checkbox" data-plan-featured="${i}" ${p.featured?"checked":""}> Destacar como melhor custo</label></div></div>`).join("");
}
async function loadData(){
 if(!sb)return;
 const {data:row,error}=await sb.from("site_content").select("content").eq("id",1).maybeSingle();
 if(!error && row?.content){data={...defaults,...row.content,cards:Array.isArray(row.content.cards)&&row.content.cards.length?row.content.cards:defaults.cards,plans:Array.isArray(row.content.plans)&&row.content.plans.length?row.content.plans:defaults.plans};renderPublic();}
}
async function uploadImage(file,index){
 if(!sb){toast("Configure o Supabase antes de enviar imagens.");return}
 if(!file.type.startsWith("image/")){toast("Selecione um arquivo de imagem.");return}
 if(file.size>8*1024*1024){toast("A imagem deve ter até 8 MB.");return}
 const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"");
 const path=`destaques/${Date.now()}-${index}.${ext}`;
 const {error}=await sb.storage.from("maxplus-images").upload(path,file,{upsert:true,contentType:file.type});
 if(error){toast("Falha no upload: "+error.message);return}
 const {data:pub}=sb.storage.from("maxplus-images").getPublicUrl(path);
 data.cards[index].image=pub.publicUrl;
 const img=$(`preview-${index}`);if(img)img.src=pub.publicUrl;
 toast("Imagem carregada. Clique em Salvar e publicar.");
}
async function save(){
 if(!sb){toast("Configure o Supabase em config.js antes de publicar.");return}
 data.title=$("edit-title").value.trim();data.subtitle=$("edit-subtitle").value.trim();data.whatsapp=$("edit-whatsapp").value.replace(/\D/g,"");
 document.querySelectorAll("[data-card]").forEach(el=>{data.cards[+el.dataset.card][el.dataset.field]=el.value});
 document.querySelectorAll("[data-plan]").forEach(el=>{data.plans[+el.dataset.plan][el.dataset.field]=el.value});
 document.querySelectorAll("[data-plan-featured]").forEach(el=>{data.plans[+el.dataset.plan].featured=el.checked});
 $("save-status").textContent="Publicando…";
 const {error}=await sb.from("site_content").upsert({id:1,content:data,updated_at:new Date().toISOString()});
 $("save-status").textContent=error?"Falha ao publicar":"Publicado com sucesso";
 if(error)toast("Erro ao publicar: "+error.message);else{renderPublic();toast("Página atualizada para os clientes!")}
}
ensureHeroIds();$("year").textContent=new Date().getFullYear();renderPublic();
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));renderCards(b.dataset.tab)}));
$("trial-form").addEventListener("submit",e=>{e.preventDefault();const name=$("trial-name").value.trim(),phone=$("trial-phone").value.trim();window.open(wa(`Olá! Quero solicitar um teste grátis do Max Plus. Nome: ${name}. Meu WhatsApp: ${phone}.`),"_blank","noopener")});
$("admin-open").addEventListener("click",()=>{$("admin-modal").classList.remove("hidden");$("auth-view").classList.remove("hidden");$("editor-view").classList.add("hidden")});
$("admin-close").addEventListener("click",()=>$("admin-modal").classList.add("hidden"));
$("admin-modal").addEventListener("click",e=>{if(e.target===$("admin-modal"))$("admin-modal").classList.add("hidden")});
$("login-form").addEventListener("submit",async e=>{e.preventDefault();if(!sb){$("login-message").textContent="Supabase ainda não configurado. Siga o README.";return}
 const {data:res,error}=await sb.auth.signInWithPassword({email:$("login-email").value,password:$("login-password").value});
 if(error){$("login-message").textContent=error.message;return}
 user=res.user;
 const {data:allowed,error:ae}=await sb.from("admin_users").select("user_id").eq("user_id",user.id).maybeSingle();
 if(ae||!allowed){await sb.auth.signOut();user=null;$("login-message").textContent="Esta conta não está autorizada como administradora.";return}
 await loadData();renderEditor();$("auth-view").classList.add("hidden");$("editor-view").classList.remove("hidden");
});
$("logout").addEventListener("click",async()=>{if(sb)await sb.auth.signOut();user=null;$("editor-view").classList.add("hidden");$("auth-view").classList.remove("hidden")});
document.querySelectorAll("[data-editor-tab]").forEach(b=>b.addEventListener("click",()=>setEditorTab(b.dataset.editorTab)));
$("edit-cards").addEventListener("change",e=>{const i=e.target.dataset.file;if(i!==undefined&&e.target.files?.[0])uploadImage(e.target.files[0],+i)});
$("edit-cards").addEventListener("click",e=>{const choose=e.target.dataset.choose;if(choose!==undefined){const input=$(`file-${choose}`);if(input)input.click();return}const i=e.target.dataset.remove;if(i!==undefined){data.cards[+i].image="";const img=$(`preview-${i}`);if(img)img.removeAttribute("src");toast("Imagem removida. Publique para confirmar.")}});
$("publish").addEventListener("click",save);
if(configured)loadData();
})();