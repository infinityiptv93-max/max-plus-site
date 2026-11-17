
(() => {
  "use strict";

  // ==========================================
  // 1. CONFIGURAÇÃO E CONEXÃO COM SUPABASE
  // ==========================================

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
    console.error("Erro ao iniciar Supabase:", error);
  }

  // ==========================================
  // 2. CONTEÚDO PADRÃO
  // ==========================================

  const defaults = {
    title: "Filmes, séries e futebol ao vivo em um só lugar",

    subtitle:
      "Milhares de opções de entretenimento para assistir nos seus dispositivos favoritos.",

    whatsapp: cfg.WHATSAPP || "5511940802230",

    cards: [
      {
        type: "filmes",
        tag: "Lançamento",
        title: "Filme em destaque 1",
        desc: "Lançamento 2026 · Ação",
        image: ""
      },
      {
        type: "filmes",
        tag: "Em alta",
        title: "Filme em destaque 2",
        desc: "Sucesso 2026 · Aventura",
        image: ""
      },
      {
        type: "filmes",
        tag: "Novo",
        title: "Filme em destaque 3",
        desc: "Estreia · Ficção",
        image: ""
      },
      {
        type: "series",
        tag: "Nova temporada",
        title: "Série em destaque 1",
        desc: "Nova temporada · Drama",
        image: ""
      },
      {
        type: "series",
        tag: "Maratone",
        title: "Série em destaque 2",
        desc: "Todos os episódios · Suspense",
        image: ""
      },
      {
        type: "series",
        tag: "Estreia",
        title: "Série em destaque 3",
        desc: "Estreia · Ação",
        image: ""
      },
      {
        type: "jogos",
        tag: "Ao vivo hoje",
        title: "Time A x Time B",
        desc: "Hoje · 21h30 · Campeonato",
        image: ""
      },
      {
        type: "jogos",
        tag: "Hoje",
        title: "Time C x Time D",
        desc: "Hoje · 19h00 · Campeonato",
        image: ""
      }
    ],

    plans: [
      {
        name: "Mensal",
        price: "35,00",
        period: "1 mês de acesso",
        featured: false
      },
      {
        name: "Trimestral",
        price: "95,00",
        period: "3 meses de acesso",
        featured: false
      },
      {
        name: "Semestral",
        price: "180,00",
        period: "6 meses de acesso",
        featured: true
      },
      {
        name: "Anual",
        price: "295,00",
        period: "12 meses de acesso",
        featured: false
      }
    ]
  };

  const clone = obj => JSON.parse(JSON.stringify(obj));

  let data = clone(defaults);
  let user = null;
  let saving = false;
  let editorTab = "conteudo";

  const $ = id => document.getElementById(id);

  // ==========================================
  // 3. FUNÇÕES AUXILIARES
  // ==========================================

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function toast(message) {
    const element = $("toast");

    if (!element) {
      console.log(message);
      return;
    }

    element.textContent = message;
    element.classList.add("show");

    setTimeout(() => {
      element.classList.remove("show");
    }, 4000);
  }

  function setStatus(message) {
    const element = $("save-status");

    if (element) {
      element.textContent = message;
    }
  }

  function wa(message) {
    const number = String(
      data.whatsapp || defaults.whatsapp
    ).replace(/\D/g, "");

    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  function normalizeContent(content) {
    const result = {
      ...clone(defaults),
      ...(content || {})
    };

    // Recupera os modelos padrão quando as listas
    // estiverem ausentes ou vazias.
    result.cards =
      Array.isArray(content?.cards) && content.cards.length > 0
        ? content.cards.map(card => ({
            type: "filmes",
            tag: "",
            title: "",
            desc: "",
            image: "",
            ...card
          }))
        : clone(defaults.cards);

    result.plans =
      Array.isArray(content?.plans) && content.plans.length > 0
        ? content.plans.map(plan => ({
            name: "",
            price: "",
            period: "",
            featured: false,
            ...plan
          }))
        : clone(defaults.plans);

    result.whatsapp = result.whatsapp || defaults.whatsapp;

    return result;
  }

  // ==========================================
  // 4. RENDERIZAÇÃO DA PÁGINA PÚBLICA
  // ==========================================

  function renderCards(type = "filmes") {
    const grid = $("poster-grid");

    if (!grid) return;

    const cards = data.cards.filter(card => card.type === type);

    grid.innerHTML = cards.map(card => `
      <article class="poster">

        ${
          card.image
            ? `<img src="${esc(card.image)}" alt="${esc(card.title)}">`
            : `<div class="poster-img-placeholder"></div>`
        }

        <div class="poster-info">
          <small>${esc(card.tag)}</small>
          <h3>${esc(card.title)}</h3>
          <p>${esc(card.desc)}</p>
        </div>

      </article>
    `).join("") || '<p class="hint">Nenhum destaque cadastrado.</p>';
  }

  function renderPlans() {
    const grid = $("plan-grid");

    if (!grid) return;

    grid.innerHTML = data.plans.map(plan => `
      <article class="plan ${plan.featured ? "featured" : ""}">

        ${
          plan.featured
            ? '<span class="tag">MELHOR CUSTO</span>'
            : ""
        }

        <h3>${esc(plan.name)}</h3>

        <div class="price">
          R$ ${esc(plan.price)}
        </div>

        <ul>
          <li>${esc(plan.period)}</li>
          <li>Consulte os detalhes</li>
          <li>Suporte pelo WhatsApp</li>
        </ul>

        <a
          class="btn"
          href="${wa(`Olá! Quero informações sobre o plano ${plan.name} do Max Plus (R$ ${plan.price}).`)}"
          target="_blank"
          rel="noopener"
        >
          Assinar
        </a>

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
    const title = document.querySelector(".hero h1");
    const subtitle = document.querySelector(".hero-copy>p");

    if (title) title.id = "hero-title";
    if (subtitle) subtitle.id = "hero-subtitle";
  }

  // ==========================================
  // 5. ABAS DO PAINEL ADMINISTRATIVO
  // ==========================================

  function setEditorTab(tab) {
    editorTab = tab;

    const content = $("editor-content");
    const plans = $("editor-plans");

    if (content) {
      content.classList.toggle("hidden", tab !== "conteudo");
    }

    if (plans) {
      plans.classList.toggle("hidden", tab !== "planos");
    }

    document.querySelectorAll("[data-editor-tab]").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.editorTab === tab
      );
    });
  }

  // ==========================================
  // 6. MONTAGEM DOS CAMPOS DE EDIÇÃO
  // ==========================================

  function renderEditor() {
    const title = $("edit-title");
    const subtitle = $("edit-subtitle");
    const whatsapp = $("edit-whatsapp");
    const cardsContainer = $("edit-cards");
    const plansContainer = $("edit-plans");

    if (title) title.value = data.title;
    if (subtitle) subtitle.value = data.subtitle;
    if (whatsapp) whatsapp.value = data.whatsapp;

    if (!cardsContainer || !plansContainer) {
      console.error(
        "Não foram encontrados os containers edit-cards ou edit-plans no HTML."
      );

      toast(
        "Erro ao montar o painel. Verifique a estrutura do index.html."
      );

      return false;
    }

    // Campos dos cards
    cardsContainer.innerHTML = data.cards.map((card, index) => `
      <div class="edit-card">

        <img
          id="preview-${index}"
          src="${esc(card.image || "")}"
          alt="${esc(card.title)}"
        >

        <div class="edit-fields">

          <label>
            Título
            <input
              type="text"
              data-card="${index}"
              data-field="title"
              value="${esc(card.title)}"
            >
          </label>

          <label>
            Descrição
            <input
              type="text"
              data-card="${index}"
              data-field="desc"
              value="${esc(card.desc)}"
            >
          </label>

          <label>
            Etiqueta
            <input
              type="text"
              data-card="${index}"
              data-field="tag"
              value="${esc(card.tag)}"
            >
          </label>

          <div>
            <button
              type="button"
              class="file-label"
              data-choose="${index}"
            >
              Escolher imagem
            </button>

            <input
              class="file-input"
              id="file-${index}"
              type="file"
              accept="image/*"
              data-file="${index}"
            >

            <button
              type="button"
              class="tab"
              data-remove="${index}"
            >
              Remover imagem
            </button>
          </div>

        </div>
      </div>
    `).join("");

    // Campos dos planos
    plansContainer.innerHTML = data.plans.map((plan, index) => `
      <div class="edit-card">

        <div class="edit-fields" style="grid-column:1/-1">

          <label>
            Nome do plano
            <input
              type="text"
              data-plan="${index}"
              data-field="name"
              value="${esc(plan.name)}"
            >
          </label>

          <label>
            Preço (ex.: 35,00)
            <input
              type="text"
              data-plan="${index}"
              data-field="price"
              value="${esc(plan.price)}"
            >
          </label>

          <label>
            Período
            <input
              type="text"
              data-plan="${index}"
              data-field="period"
              value="${esc(plan.period)}"
            >
          </label>

          <label>
            <input
              type="checkbox"
              data-plan-featured="${index}"
              ${plan.featured ? "checked" : ""}
            >
            Destacar como melhor custo
          </label>

        </div>
      </div>
    `).join("");

    setEditorTab(editorTab);

    return true;
  }

  // ==========================================
  // 7. CARREGAMENTO DOS DADOS
  // ==========================================

  async function loadData() {
    if (!sb) {
      console.error("Supabase não conectado.");
      return false;
    }

    try {
      const { data: row, error } = await sb
        .from("site_content")
        .select("content")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;

      if (row && row.content) {
        data = normalizeContent(row.content);
      } else {
        data = clone(defaults);
      }

      renderPublic();

      return true;

    } catch (error) {
      console.error("Erro ao carregar conteúdo:", error);

      toast(
        "Erro ao carregar dados: " +
        (error.message || "Falha de conexão")
      );

      return false;
    }
  }

  // ==========================================
  // 8. ENVIO DE IMAGENS
  // ==========================================

  async function uploadImage(file, index) {
    if (!sb) {
      toast("Supabase não está conectado.");
      return;
    }

    if (!file || !file.type.startsWith("image/")) {
      toast("Selecione um arquivo de imagem.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast("A imagem deve ter até 8 MB.");
      return;
    }

    try {
      toast("Enviando imagem...");

      const extension = (
        file.name.split(".").pop() || "jpg"
      ).toLowerCase().replace(/[^a-z0-9]/g, "");

      const path =
        `destaques/${Date.now()}-${index}.${extension}`;

      const { error } = await sb.storage
        .from("maxplus-images")
        .upload(path, file, {
          upsert: true,
          contentType: file.type
        });

      if (error) throw error;

      const { data: publicData } = sb.storage
        .from("maxplus-images")
        .getPublicUrl(path);

      data.cards[index].image = publicData.publicUrl;

      const preview = $(`preview-${index}`);

      if (preview) {
        preview.src = publicData.publicUrl;
      }

      toast(
        "Imagem carregada. Clique em Salvar e publicar."
      );

    } catch (error) {
      console.error("Erro no upload:", error);

      toast(
        "Falha no upload: " +
        (error.message || "Erro desconhecido")
      );
    }
  }

  // ==========================================
  // 9. COLETA DOS CAMPOS ANTES DE PUBLICAR
  // ==========================================

  function collectEditorData() {
    const title = $("edit-title");
    const subtitle = $("edit-subtitle");
    const whatsapp = $("edit-whatsapp");

    if (!title || !subtitle || !whatsapp) {
      throw new Error(
        "Os campos principais do painel não foram encontrados."
      );
    }

    data.title = title.value.trim();
    data.subtitle = subtitle.value.trim();
    data.whatsapp = whatsapp.value.replace(/\D/g, "");

    document.querySelectorAll("[data-card]").forEach(element => {
      const index = Number(element.dataset.card);
      const field = element.dataset.field;

      if (data.cards[index] && field) {
        data.cards[index][field] = element.value;
      }
    });

    document.querySelectorAll("[data-plan]").forEach(element => {
      const index = Number(element.dataset.plan);
      const field = element.dataset.field;

      if (data.plans[index] && field) {
        data.plans[index][field] = element.value;
      }
    });

    document.querySelectorAll("[data-plan-featured]").forEach(element => {
      const index = Number(element.dataset.planFeatured);

      if (data.plans[index]) {
        data.plans[index].featured = element.checked;
      }
    });
  }

  // ==========================================
  // 10. SALVAR E PUBLICAR
  // ==========================================

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

    const button = $("publish");

    if (button) {
      button.disabled = true;
      button.textContent = "Publicando...";
    }

    setStatus("Verificando acesso...");

    try {
      const { data: sessionData, error: sessionError } =
        await sb.auth.getSession();

      if (sessionError) throw sessionError;

      if (!sessionData?.session) {
        throw new Error(
          "Sua sessão expirou. Entre novamente."
        );
      }

      collectEditorData();

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

      const message =
        error?.message || "Erro desconhecido";

      setStatus("Falha ao publicar: " + message);

      toast("Não foi possível publicar: " + message);

    } finally {
      saving = false;

      if (button) {
        button.disabled = false;
        button.textContent = "Salvar e publicar";
      }
    }
  }

  // ==========================================
  // 11. INICIALIZAÇÃO DA PÁGINA
  // ==========================================

  ensureHeroIds();

  const year = $("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  renderPublic();

  // Abas públicas: Filmes, Séries e Jogos
  document.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach(item => {
        item.classList.toggle("active", item === button);
      });

      renderCards(button.dataset.tab);
    });
  });

  // Formulário de teste grátis
  $("trial-form")?.addEventListener("submit", event => {
    event.preventDefault();

    const name = $("trial-name")?.value.trim() || "";
    const phone = $("trial-phone")?.value.trim() || "";

    window.open(
      wa(
        `Olá! Quero solicitar um teste grátis do Max Plus. Nome: ${name}. Meu WhatsApp: ${phone}.`
      ),
      "_blank",
      "noopener"
    );
  });

  // Abrir painel privado
  $("admin-open")?.addEventListener("click", () => {
    $("admin-modal")?.classList.remove("hidden");
    $("auth-view")?.classList.remove("hidden");
    $("editor-view")?.classList.add("hidden");
  });

  // Fechar painel
  $("admin-close")?.addEventListener("click", () => {
    $("admin-modal")?.classList.add("hidden");
  });

  $("admin-modal")?.addEventListener("click", event => {
    if (event.target === $("admin-modal")) {
      $("admin-modal").classList.add("hidden");
    }
  });

  // ==========================================
  // 12. LOGIN DO ADMINISTRADOR
  // ==========================================

  $("login-form")?.addEventListener("submit", async event => {
    event.preventDefault();

    const message = $("login-message");

    if (!sb) {
      if (message) {
        message.textContent =
          "Supabase não configurado. Confira o config.js.";
      }

      return;
    }

    try {
      if (message) message.textContent = "Verificando acesso...";

      const { data: result, error } =
        await sb.auth.signInWithPassword({
          email: $("login-email").value,
          password: $("login-password").value
        });

      if (error) throw error;

      user = result.user;

      const { data: allowed, error: adminError } = await sb
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError) throw adminError;

      if (!allowed) {
        await sb.auth.signOut();
        user = null;

        throw new Error(
          "Esta conta não está autorizada como administradora."
        );
      }

      await loadData();

      const editorReady = renderEditor();

      if (!editorReady) {
        throw new Error(
          "Não foi possível montar os campos do painel. Verifique o HTML."
        );
      }

      $("auth-view")?.classList.add("hidden");
      $("editor-view")?.classList.remove("hidden");

      if (message) message.textContent = "";

      toast("Acesso administrativo autorizado!");

    } catch (error) {
      console.error("Erro no login:", error);

      if (message) {
        message.textContent =
          error.message || "Falha ao entrar.";
      }
    }
  });

  // ==========================================
  // 13. SAIR DO PAINEL
  // ==========================================

  $("logout")?.addEventListener("click", async () => {
    if (sb) {
      await sb.auth.signOut();
    }

    user = null;

    $("editor-view")?.classList.add("hidden");
    $("auth-view")?.classList.remove("hidden");
  });

  // ==========================================
  // 14. ABAS DE EDIÇÃO
  // ==========================================

  document.querySelectorAll("[data-editor-tab]").forEach(button => {
    button.addEventListener("click", () => {
      setEditorTab(button.dataset.editorTab);
    });
  });

  // ==========================================
  // 15. ESCOLHER E REMOVER IMAGENS
  // ==========================================

  $("edit-cards")?.addEventListener("change", event => {
    const index = event.target.dataset.file;

    if (
      index !== undefined &&
      event.target.files &&
      event.target.files[0]
    ) {
      uploadImage(
        event.target.files[0],
        Number(index)
      );
    }
  });

  $("edit-cards")?.addEventListener("click", event => {
    const choose = event.target.dataset.choose;

    if (choose !== undefined) {
      const input = $(`file-${choose}`);

      if (input) {
        input.click();
      }

      return;
    }

    const remove = event.target.dataset.remove;

    if (remove !== undefined) {
      const index = Number(remove);

      if (!data.cards[index]) return;

      data.cards[index].image = "";

      const preview = $(`preview-${index}`);

      if (preview) {
        preview.removeAttribute("src");
      }

      toast(
        "Imagem removida da edição. Publique para confirmar."
      );
    }
  });

  // ==========================================
  // 16. BOTÃO SALVAR E PUBLICAR
  // ==========================================

  const publishButton = $("publish");

  if (publishButton) {
    publishButton.type = "button";

    publishButton.addEventListener("click", event => {
      event.preventDefault();
      save();
    });
  } else {
    console.error(
      'Botão com id="publish" não encontrado no HTML.'
    );
  }

  // ==========================================
  // 17. CARREGAMENTO INICIAL
  // ==========================================

  if (configured && sb) {
    loadData();
  } else {
    console.error(
      "Supabase ausente ou biblioteca não carregada. Confira config.js e index.html."
    );
  }

})();
