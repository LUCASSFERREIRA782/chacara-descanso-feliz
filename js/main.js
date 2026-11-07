if (window.top !== window.self) window.top.location = window.self.location.href;

(() => {
  const WHATS = "5511971108102";
  const raiz = document.documentElement;
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // De onde a pessoa veio (?origem=instagram). Só entra no texto do WhatsApp, nada é guardado.
  const ORIGENS = { instagram: "Instagram", facebook: "Facebook", qr: "QR Code", whatsapp: "WhatsApp", google: "Google" };
  const origem = ORIGENS[new URLSearchParams(location.search).get("origem")] || "";
  const linkWhats = texto => `https://wa.me/${WHATS}?text=${encodeURIComponent(texto)}`;
  const assinatura = origem ? `\n\n(Vi a chácara pelo ${origem})` : "";

  document.querySelectorAll("[data-whats]").forEach(a => {
    a.href = linkWhats(`Olá, Devair! Vim pelo site da Chácara Descanso Feliz e quero saber sobre datas e valores.${assinatura}`);
  });
  const visita = document.querySelector("[data-whats-visita]");
  if (visita) visita.href = linkWhats(`Olá, Devair! Quero agendar uma visita à Chácara Descanso Feliz.${assinatura}`);

  /* ---------- Topo, menu e barra do celular ---------- */
  const topo = document.getElementById("topo");
  const barra = document.querySelector(".barra-celular");
  const aoRolar = () => {
    topo.classList.toggle("is-rolado", scrollY > 40);
    barra.classList.toggle("is-visivel", scrollY > innerHeight * 0.7);
  };
  addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  const menu = document.getElementById("menu");
  const botaoMenu = document.querySelector(".menu-botao");
  const fecharMenu = () => {
    menu.classList.remove("is-aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.setAttribute("aria-label", "Abrir menu");
  };
  botaoMenu.addEventListener("click", () => {
    const abrir = botaoMenu.getAttribute("aria-expanded") !== "true";
    menu.classList.toggle("is-aberto", abrir);
    botaoMenu.setAttribute("aria-expanded", String(abrir));
    botaoMenu.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
  });
  menu.addEventListener("click", e => { if (e.target.closest("a")) fecharMenu(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") fecharMenu(); });

  /* ---------- De dia / à noite ---------- */
  const capaTexto = document.querySelector(".capa-texto");
  const corTema = document.querySelector('meta[name="theme-color"]');
  const botoesModo = document.querySelectorAll(".modo-opcao");
  const aplicarModo = modo => {
    raiz.dataset.modo = modo;
    botoesModo.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.modo === modo)));
    capaTexto.textContent = capaTexto.dataset[modo];
    corTema.content = modo === "noite" ? "#161c2c" : "#3f5b2e";
  };
  botoesModo.forEach(b => b.addEventListener("click", () => aplicarModo(b.dataset.modo)));

  /* ---------- Filtro do portfólio ---------- */
  const filtros = document.querySelectorAll("[data-filtro]");
  const fotos = document.querySelectorAll(".galeria .foto");
  const resumoFiltro = document.querySelector(".filtro-resumo");
  const ctaTipo = document.querySelector("[data-orcamento-tipo]");
  let tipoEscolhido = "";
  const filtrar = botao => {
    const cat = botao.dataset.filtro;
    filtros.forEach(f => f.setAttribute("aria-checked", String(f === botao)));
    let n = 0;
    fotos.forEach(foto => {
      const mostra = cat === "todos" || foto.dataset.cat === cat;
      foto.hidden = !mostra;
      if (mostra) { n++; if (!reduzir) { foto.classList.remove("is-entrando"); void foto.offsetWidth; foto.classList.add("is-entrando"); } }
    });
    tipoEscolhido = botao.dataset.tipo || "";
    resumoFiltro.textContent = cat === "todos" ? `${n} fotos de eventos reais na chácara.` : `${n} fotos reais: ${botao.textContent.toLowerCase()}.`;
    ctaTipo.textContent = botao.dataset.cta || "Quero um orçamento para o meu evento";
  };
  filtros.forEach(f => f.addEventListener("click", () => filtrar(f)));
  // Setas do teclado no grupo de filtros (padrão de radiogroup)
  document.querySelector(".filtros").addEventListener("keydown", e => {
    if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
    const lista = [...filtros];
    const i = lista.indexOf(document.activeElement);
    if (i < 0) return;
    const prox = lista[(i + (e.key === "ArrowRight" ? 1 : lista.length - 1)) % lista.length];
    prox.focus(); filtrar(prox); e.preventDefault();
  });
  filtrar(filtros[0]);

  /* ---------- Visor de fotos ---------- */
  const visor = document.getElementById("visor");
  const visorImg = visor.querySelector("img");
  const visorLegenda = visor.querySelector(".visor-legenda");
  document.addEventListener("click", e => {
    const alvo = e.target.closest("[data-foto]");
    if (!alvo) return;
    visorImg.src = alvo.dataset.foto;
    visorImg.alt = alvo.querySelector("img")?.alt || "";
    visorLegenda.textContent = alvo.dataset.legenda || "";
    visor.showModal();
  });
  visor.addEventListener("click", e => { if (e.target === visor || e.target.closest("[data-fechar]")) visor.close(); });
  visor.addEventListener("close", () => { visorImg.src = "data:,"; });

  /* ---------- Orçamento guiado ---------- */
  const form = document.getElementById("form-orcamento");
  const data = document.getElementById("data");
  const semData = document.getElementById("sem-data");
  const dataErro = document.getElementById("data-erro");
  const convidados = document.getElementById("convidados");
  const dormem = document.getElementById("dormem");
  const caixaDormem = document.getElementById("pernoite-qtd");
  const nome = document.getElementById("nome");
  const resumo = document.getElementById("resumo");
  const enviar = document.getElementById("enviar-whats");

  const hoje = new Date();
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  data.min = iso(hoje);
  data.max = iso(new Date(hoje.getFullYear() + 3, hoje.getMonth(), hoje.getDate()));

  const dataTexto = () => {
    if (semData.checked || !data.value) return "";
    const [a, m, d] = data.value.split("-").map(Number);
    const dt = new Date(a, m - 1, d);
    return dt.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const montar = () => {
    const tipo = form.querySelector('input[name="tipo"]:checked').value;
    const pernoite = form.querySelector('input[name="pernoite"]:checked').value === "sim";
    const usar = [...form.querySelectorAll('input[name="usar"]:checked')].map(i => i.value);
    // Só letras, números e pontuação simples no nome (nada de quebras de linha ou links)
    const quem = nome.value.replace(/[^\p{L}\p{N} .'-]/gu, "").trim().slice(0, 60);

    document.getElementById("convidados-saida").value = convidados.value;
    document.getElementById("dormem-saida").value = dormem.value;
    caixaDormem.hidden = !pernoite;
    data.disabled = semData.checked;

    let erro = "";
    if (data.value && !semData.checked && (data.value < data.min || data.value > data.max)) erro = "Escolha uma data a partir de hoje, até 3 anos à frente.";
    dataErro.textContent = erro;
    dataErro.hidden = !erro;

    const quando = dataTexto();
    const linhas = [
      `Olá, Devair!${quem ? ` Aqui é ${quem}.` : ""} Quero um orçamento na Chácara Descanso Feliz:`,
      "",
      `• Evento: ${tipo}`,
      `• Data: ${erro ? "a combinar" : quando || "ainda não definida"}`,
      `• Convidados: cerca de ${convidados.value} pessoas`,
      `• Pernoite: ${pernoite ? `sim, cerca de ${dormem.value} pessoas` : "não, só o dia"}`,
    ];
    if (usar.length) linhas.push(`• Quero usar: ${usar.join(", ")}`);
    linhas.push("", "Pode me passar valores e datas livres?");
    const texto = linhas.join("\n") + assinatura;
    resumo.textContent = texto;
    enviar.href = linkWhats(texto);
  };
  form.addEventListener("input", montar);
  form.addEventListener("change", montar);
  form.addEventListener("submit", e => e.preventDefault());

  const irParaOrcamento = () => document.getElementById("orcamento").scrollIntoView({ behavior: reduzir ? "auto" : "smooth" });
  ctaTipo.addEventListener("click", e => {
    if (!tipoEscolhido) return;
    const opcao = form.querySelector(`input[name="tipo"][value="${CSS.escape(tipoEscolhido)}"]`);
    if (opcao) opcao.checked = true;
    montar();
    e.preventDefault(); irParaOrcamento();
  });
  document.querySelector("[data-pernoite]").addEventListener("click", e => {
    form.querySelector('input[name="pernoite"][value="sim"]').checked = true;
    montar();
    e.preventDefault(); irParaOrcamento();
  });
  montar();

  /* ---------- Compartilhar ---------- */
  const compartilhar = document.getElementById("compartilhar");
  compartilhar.addEventListener("click", async () => {
    const url = location.origin + location.pathname;
    const dados = { title: "Chácara Descanso Feliz", text: "Olha essa chácara em Ribeirão Pires para até 200 pessoas:", url };
    try {
      if (navigator.share) await navigator.share(dados);
      else { await navigator.clipboard.writeText(url); compartilhar.textContent = "Link copiado!"; }
    } catch { /* a pessoa cancelou o compartilhamento */ }
  });

  /* ---------- Revelação suave (uma por seção) ---------- */
  if (!reduzir && "IntersectionObserver" in window) {
    const alvos = document.querySelectorAll(".secao-topo, .estrutura, .hospedagem, .local, .faq");
    const obs = new IntersectionObserver(entradas => entradas.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("is-visivel"); obs.unobserve(en.target); }
    }), { rootMargin: "0px 0px -10% 0px" });
    alvos.forEach(a => { a.classList.add("revelar"); obs.observe(a); });
  }
})();
