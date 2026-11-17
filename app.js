(() => {
  const cfg = window.MAXPLUS_CONFIG || {};

  const configured = Boolean(
    cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("COLE_AQUI") &&
    !cfg.SUPABASE_ANON_KEY.includes("COLE_AQUI")
  );

  let sb = null;
  try {
    if (configured && window.supabase) {
      sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
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
