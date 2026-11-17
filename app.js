function syncEditorToData() {
  if ($("edit-title")) data.title = $("edit-title").value.trim();
  if ($("edit-subtitle")) data.subtitle = $("edit-subtitle").value.trim();
  if ($("edit-whatsapp")) data.whatsapp = $("edit-whatsapp").value.replace(/\D/g, "");

  document.querySelectorAll("[data-card]").forEach(el => {
    const i = Number(el.dataset.card), f = el.dataset.field;
    if (data.cards[i] && f) data.cards[i][f] = el.value;
  });
  document.querySelectorAll("[data-plan]").forEach(el => {
    const i = Number(el.dataset.plan), f = el.dataset.field;
    if (data.plans[i] && f) data.plans[i][f] = el.value;
  });
  document.querySelectorAll("[data-plan-featured]").forEach(el => {
    const i = Number(el.dataset.planFeatured);
    if (data.plans[i]) data.plans[i].featured = el.checked;
  });
}

function addCard(type) {
  syncEditorToData();
  const presets = {
    filmes: {tag:"Novo", title:"Novo filme", desc:"Ano · Gênero"},
    series: {tag:"Nova temporada", title:"Nova série", desc:"Temporada · Gênero"},
    jogos:  {tag:"Hoje", title:"Time A x Time B", desc:"Hoje · 21h00 · Campeonato"}
  };
  data.cards.push({ type, image:"", ...presets[type] });
  renderEditor();
  renderCards(publicTab);
  const last = document.querySelector("#edit-cards .edit-card:last-child");
  if (last) last.scrollIntoView({ behavior:"smooth", block:"center" });
  toast("Item adicionado. Edite e clique em Salvar e publicar.");
}

function removeCard(i) {
  if (!confirm("Remover este item do catálogo?")) return;
  syncEditorToData();
  data.cards.splice(i, 1);
  renderEditor();
  renderCards(publicTab);
}

function clearGames() {
  if (!confirm("Remover TODOS os jogos do dia?")) return;
  syncEditorToData();
  data.cards = data.cards.filter(c => c.type !== "jogos");
  renderEditor();
  renderCards(publicTab);
}

function addPlan() {
  syncEditorToData();
  data.plans.push({ name:"Novo plano", price:"0,00", period:"1 mês de acesso", featured:false });
  renderEditor();
  renderPlans();
}

function removePlan(i) {
  if (!confirm("Remover este plano?")) return;
  syncEditorToData();
  data.plans.splice(i, 1);
  renderEditor();
  renderPlans();
}
