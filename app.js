
(() => {
  const cfg = window.MAXPLUS_CONFIG || {};

  const configured = Boolean(
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("COLE_AQUI") &&
    !cfg.SUPABASE_ANON_KEY.includes("COLE_AQUI")
  );

  let sb = null;

  try {
    if (configured && window.supabase) {
      sb = window.supabase.createClient(
        cfg.SUPABASE_URL,
        cfg.SUPABASE_ANON_KEY
      );
    }
  } catch (error) {
    console.error("Erro ao conectar Supabase:", error);
  }

  const defaults = {
    title: "Filmes, séries e futebol ao vivo em um só lugar",
    subtitle: "Milhares de opções de entretenimento para assistir nos seus dispositivos favoritos.",
    whatsapp: cfg.WHATSAPP || "5511940802230",
    cards: [
      {type:"filmes",tag:"Lançamento",title:"Filme em destaque 1",desc:"Lançamento 2026 · Ação",image:""},
      {type:"filmes",tag:"Em alta",title:"Filme em destaque 2",desc:"Sucesso 2026 · Aventura",image:""},
      {type:"filmes",tag:"Novo",title:"Filme em destaque 3",desc:"Estreia · Ficção",image:""},
      {type:"series",tag:"Nova temporada",title:"Série em destaque 1",desc:"Nova temporada · Drama",image:""},
      {type:"series",tag:"Maratone",title:"Série em destaque 2",desc:"Todos os episódios · Suspense",image:""},
      {type:"series",tag:"Estreia",title:"Série em destaque 3",desc:"Estreia · Ação",image:""},
      {type:"jogos",tag:"Ao vivo hoje",title:"Time A x Time B",desc:"Hoje · 21h30 · Campeonato",image:""},
      {type:"jogos",tag:"Hoje",title:"Time C x Time D",desc:"Hoje · 19h00 · Campeonato",image:""}
    ],
    plans: [
      {name:"Mensal",price:"35,00",period:"1 mês de acesso",featured:false},
      {name:"Trimestral",price:"95,00",period:"3 meses de acesso",featured:false},
      {name:"Semestral",price:"180,00",period:"6 meses de acesso",featured:true},
      {name:"Anual",price:"295,00",period:"12 meses de acesso",featured:false}
    ]
  };

  const clone = obj => JSON.parse(JSON.stringify(obj));

  let data = clone(defaults);
  let user = null;
  let editorTab = "conteudo";
  let saving = false;

  const $ = id => document.getElementById(id);

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[c]));

  function toast(msg) {
    const t = $("toast");
    if (!t) {
      alert(msg);
      return;
    }

    t.textContent = msg;
    t.classList.add("show");

    setTimeout(() => {
      t.classList.remove("show");
    }, 4000);
  }

  function setStatus(msg) {
    const el = $("save-status");
    if (el) el.textContent = msg;
  }

  function wa(text) {
    return `https://wa.me/${String(data.whatsapp || defaults.whatsapp).replace(/\D/g,"")}?text=${encodeURIComponent(text)}`;
  }

  function renderCards(type = "filmes") {
    const grid = $("poster-grid");
    if (!grid) return;

    const cards = data.cards.filter(c => c.type === type);

    grid.innerHTML = cards.map(c => `
      <article class="poster">
        ${c.image
          ? `<img src="${esc(c.image)}" alt="">`
          : `<div class="poster-img-placeholder"></div>`
        }
        <div class="poster-info">
          <small>${esc(c.tag)}</small>
          <h3>${esc(c.title)}</h3>
          <p>${esc(c.desc)}</p>
        </div>
      </article>
    `).join("") || '<p class="hint">Nenhum destaque cadastrado.</p>';
  }

  function renderPlans() {
    const grid = $("plan-grid");
    if (!grid) return;

    grid.innerHTML = data.plans.map(p => `
      <article class="plan ${p.featured ? "featured" : ""}">
        ${p.featured ? '<span class="tag">MELHOR CUSTO</span>' : ""}
        <h3>${esc(p.name)}</h3>
        <div class="price">R$ ${esc(p.price)}</div>
        <ul>
          <li>${esc(p.period)}</li>
          <li>Consulte os detalhes</li>
          <li>Suporte pelo WhatsApp</li>
        </ul>
        <a class="btn" href="${wa(`Olá! Quero informações sobre o plano ${p.name} do Max Plus (R$ ${p.price}).`)}" target="_blank" rel="noopener">Assinar</a>
      </article>
    `).join("");
  }

  function renderPublic() {
    const title = $("hero-title");
    const subtitle = $("hero-subtitle");

    if (title) title.textContent = data.title;
    if (subtitle) subtitle.textContent = data.subtitle;

    renderCards();
    renderPlans();
  }

  function ensureHeroIds() {
    const h = document.querySelector(".hero h1");
    const p = document.querySelector(".hero-copy>p");

    if (h) h.id = "hero-title";
    if (p) p.id = "hero-subtitle";
  }

  function setEditorTab(tab) {
    editorTab = tab;

    $("editor-content")?.classList.toggle("hidden", tab !== "conteudo");
    $("editor-plans")?.classList.toggle("hidden", tab !== "planos");

    document.querySelectorAll("[data-editor-tab]").forEach(b => {
      b.classList.toggle("active", b.dataset.editorTab === tab);
    });
  }

  function renderEditor() {
    if ($("edit-title")) $("edit-title").value = data.title;
    if ($("edit-subtitle")) $("edit-subtitle").value = data.subtitle;
    if ($("edit-whatsapp")) $("edit-whatsapp").value = data.whatsapp;

    $("edit-cards").innerHTML = data.cards.map((c, i) => `
      <div class="edit-card">
        <img id="preview-${i}" src="${esc(c.image || "")}" alt="">
        <div class="edit-fields">
          <label>Título
            <input data-card="${i}" data-field="title" value="${esc(c.title)}">
          </label>
          <label>Descrição
            <input data-card="${i}" data-field="desc" value="${esc(c.desc)}">
          </label>
          <label>Etiqueta
            <input data-card="${i}" data-field="tag" value="${esc(c.tag)}">
          </label>
          <div>
            <button type="button" class="file-label" data-choose="${i}">Escolher imagem</button>
            <input class="file-input" id="file-${i}" type="file" accept="image/*" data-file="${i}">
            <button type="button" class="tab" data-remove="${i}">Remover imagem</button>
          </div>
        </div>
      </div>
    `).join("");

    $("edit-plans").innerHTML = data.plans.map((p, i) => `
      <div class="edit-card">
        <div class="edit-fields" style="grid-column:1/-1">
          <label>Nome do plano
            <input data-plan="${i}" data-field="name" value="${esc(p.name)}">
          </label>
          <label>Preço (ex.: 35,00)
            <input data-plan="${i}" data-field="price" value="${esc(p.price)}">
          </label>
          <label>Período
            <input data-plan="${i}" data-field="period" value="${esc(p.period)}">
          </label>
          <label>
            <input type="checkbox" data-plan-featured="${i}" ${p.featured ? "checked" : ""}>
            Destacar como melhor custo
          </label>
        </div>
      </div>
    `).join("");
  }

  async function loadData() {
    if (!sb) {
      toast("Supabase não está conectado. Confira o config.js.");
      return;
    }

    try {
      const { data: row, error } = await sb
        .from("site_content")
        .select("content")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;

      if (row?.content) {
        data = {
          ...defaults,
          ...row.content,
          cards: Array.isArray(row.content.cards)
            ? row.content.cards
            : clone(defaults.cards),
          plans: Array.isArray(row.content.plans)
            ? row.content.plans
            : clone(defaults.plans)
        };

        renderPublic();
      }
    } catch (error) {
      console.error("Erro ao carregar conteúdo:", error);
      toast("Erro ao carregar dados: " + (error.message || "Falha de conexão"));
    }
  }

  async function uploadImage(file, index) {
    if (!sb) {
      toast("Supabase não está conectado.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast("Selecione um arquivo de imagem.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast("A imagem deve ter até 8 MB.");
      return;
    }

    try {
      toast("Enviando imagem...");

      const ext = (file.name.split(".").pop() || "jpg")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      const path = `destaques/${Date.now()}-${index}.${ext}`;

      const { error } = await sb.storage
        .from("maxplus-images")
        .upload(path, file, {
          upsert: true,
          contentType: file.type
        });

      if (error) throw error;

      const { data: pub } = sb.storage
        .from("maxplus-images")
        .getPublicUrl(path);

      data.cards[index].image = pub.publicUrl;

      const img = $(`preview-${index}`);
      if (img) img.src = pub.publicUrl;

      toast("Imagem carregada. Clique em Salvar e publicar.");
    } catch (error) {
      console.error("Erro no upload:", error);
      toast("Falha no upload: " + (error.message || "Erro desconhecido"));
    }
  }

  async function save() {
    if (saving) return;

    if (!sb) {
      toast("Supabase não conectado. Confira o config.js.");
      return;
    }

    if (!user) {
      toast("Faça login novamente como administrador.");
      return;
    }

    saving = true;

    const publishButton = $("publish");

    if (publishButton) {
      publishButton.disabled = true;
      publishButton.textContent = "Publicando...";
    }

    setStatus("Verificando acesso...");

    try {
      const { data: sessionData, error: sessionError } =
        await sb.auth.getSession();

      if (sessionError) throw sessionError;

      if (!sessionData?.session) {
        throw new Error("Sua sessão expirou. Entre novamente.");
      }

      data.title = $("edit-title").value.trim();
      data.subtitle = $("edit-subtitle").value.trim();
      data.whatsapp = $("edit-whatsapp").value.replace(/\D/g, "");

      document.querySelectorAll("[data-card]").forEach(el => {
        const i = Number(el.dataset.card);
        const field = el.dataset.field;

        if (data.cards[i] && field) {
          data.cards[i][field] = el.value;
        }
      });

      document.querySelectorAll("[data-plan]").forEach(el => {
        const i = Number(el.dataset.plan);
        const field = el.dataset.field;

        if (data.plans[i] && field) {
          data.plans[i][field] = el.value;
        }
      });

      document.querySelectorAll("[data-plan-featured]").forEach(el => {
        const i = Number(el.dataset.planFeatured);

        if (data.plans[i]) {
          data.plans[i].featured = el.checked;
        }
      });

      setStatus("Gravando no Supabase...");

      const { error } = await sb
        .from("site_content")
        .upsert({
          id: 1,
          content: data,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      renderPublic();

      setStatus("Publicado com sucesso!");
      toast("Página atualizada para os clientes!");

    } catch (error) {
      console.error("Erro ao publicar:", error);

      const message = error?.message || "Erro desconhecido";

      setStatus("Falha ao publicar: " + message);
      toast("Não foi possível publicar: " + message);

    } finally {
      saving = false;

      if (publishButton) {
        publishButton.disabled = false;
        publishButton.textContent = "Salvar e publicar";
      }
    }
  }

  // Inicialização da página
  ensureHeroIds();

  if ($("year")) {
    $("year").textContent = new Date().getFullYear();
  }

  renderPublic();

  document.querySelectorAll("[data-tab]").forEach(b => {
    b.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach(x => {
        x.classList.toggle("active", x === b);
      });

      renderCards(b.dataset.tab);
    });
  });

  $("trial-form")?.addEventListener("submit", e => {
    e.preventDefault();

    const name = $("trial-name").value.trim();
    const phone = $("trial-phone").value.trim();

    window.open(
      wa(`Olá! Quero solicitar um teste grátis do Max Plus. Nome: ${name}. Meu WhatsApp: ${phone}.`),
      "_blank",
      "noopener"
    );
  });

  $("admin-open")?.addEventListener("click", () => {
    $("admin-modal").classList.remove("hidden");
    $("auth-view").classList.remove("hidden");
    $("editor-view").classList.add("hidden");
  });

  $("admin-close")?.addEventListener("click", () => {
    $("admin-modal").classList.add("hidden");
  });

  $("admin-modal")?.addEventListener("click", e => {
    if (e.target === $("admin-modal")) {
      $("admin-modal").classList.add("hidden");
    }
  });

  $("login-form")?.addEventListener("submit", async e => {
    e.preventDefault();

    if (!sb) {
      $("login-message").textContent = "Supabase não configurado. Confira o config.js.";
      return;
    }

    try {
      const { data: res, error } = await sb.auth.signInWithPassword({
        email: $("login-email").value,
        password: $("login-password").value
      });

      if (error) throw error;

      user = res.user;

      const { data: allowed, error: ae } = await sb
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (ae) throw ae;

      if (!allowed) {
        await sb.auth.signOut();
        user = null;
        throw new Error("Esta conta não está autorizada como administradora.");
      }

      await loadData();
      renderEditor();

      $("auth-view").classList.add("hidden");
      $("editor-view").classList.remove("hidden");

    } catch (error) {
      console.error("Erro no login:", error);
      $("login-message").textContent = error.message || "Falha ao entrar.";
    }
  });

  $("logout")?.addEventListener("click", async () => {
    if (sb) await sb.auth.signOut();

    user = null;
    $("editor-view").classList.add("hidden");
    $("auth-view").classList.remove("hidden");
  });

  document.querySelectorAll("[data-editor-tab]").forEach(b => {
    b.addEventListener("click", () => setEditorTab(b.dataset.editorTab));
  });

  $("edit-cards")?.addEventListener("change", e => {
    const i = e.target.dataset.file;

    if (i !== undefined && e.target.files?.[0]) {
      uploadImage(e.target.files[0], Number(i));
    }
  });

  $("edit-cards")?.addEventListener("click", e => {
    const choose = e.target.dataset.choose;

    if (choose !== undefined) {
      const input = $(`file-${choose}`);
      if (input) input.click();
      return;
    }

    const i = e.target.dataset.remove;

    if (i !== undefined) {
      data.cards[Number(i)].image = "";

      const img = $(`preview-${i}`);
      if (img) img.removeAttribute("src");

      toast("Imagem removida. Publique para confirmar.");
    }
  });

  // Evento de publicação
  const publishButton = $("publish");

  if (publishButton) {
    publishButton.type = "button";

    publishButton.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      save();
    }, true);
  } else {
    console.error('Botão com id="publish" não encontrado no HTML.');
  }

  if (configured && sb) {
    loadData();
  } else {
    console.error("Configuração do Supabase ausente ou biblioteca não carregada.");
  }

})();
