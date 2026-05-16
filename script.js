// Brookie Cookies & More — interactions (melhorado)

document.addEventListener("DOMContentLoaded", () => {

  // ===== ANO NO FOOTER =====
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  // ===== LOADER =====
  const loader = document.getElementById("loader");
  if (loader) {
    // Tempo mínimo de exibição para evitar flash muito rápido
    const minDisplay = 1400;
    const start = Date.now();

    window.addEventListener("load", () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minDisplay - elapsed);
      setTimeout(() => {
        loader.classList.add("is-hidden");
        // Remove do DOM após a transição para não bloquear eventos
        loader.addEventListener("transitionend", () => {
          loader.setAttribute("aria-hidden", "true");
        }, { once: true });
      }, remaining);
    });

    // Fallback: garante que o loader some mesmo se o evento load falhar
    setTimeout(() => loader.classList.add("is-hidden"), minDisplay + 2000);
  }


  // ===== NAV SCROLL =====
  const nav = document.getElementById("nav");

  const updateNav = () => {
    if (!nav) return;
    if (window.scrollY > 60) {
      nav.classList.add("is-scrolled");
    } else {
      nav.classList.remove("is-scrolled");
    }
  };

  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();


  // ===== HAMBURGER MENU =====
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  let scrollY = 0;

  const openMenu = () => {
    // Salva posição de scroll antes de fixar o body
    scrollY = window.scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.classList.add("menu-open");

    hamburger.classList.add("is-open");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "Fechar menu");

    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");

    // Foco no primeiro link para acessibilidade
    const firstLink = mobileMenu.querySelector(".mobile-link");
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 300);
    }
  };

  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    // Restaura posição de scroll
    document.body.style.top = "";
    window.scrollTo({ top: scrollY, behavior: "instant" });

    hamburger.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Abrir menu");

    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");

    hamburger.focus();
  };

  const toggleMenu = () => {
    const isOpen = hamburger.classList.contains("is-open");
    isOpen ? closeMenu() : openMenu();
  };

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", toggleMenu);

    // Fechar ao clicar em qualquer link do menu mobile
    mobileMenu.querySelectorAll(".mobile-link").forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    // Fechar com Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && hamburger.classList.contains("is-open")) {
        closeMenu();
      }
    });

    // Fechar menu se viewport expandir para desktop
    const mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", (e) => {
      if (e.matches && hamburger.classList.contains("is-open")) {
        closeMenu();
      }
    });
  }


  // ===== PARALLAX (apenas desktop) =====
  const parallaxEl = document.querySelector("[data-parallax]");

  // IntersectionObserver para pausar parallax quando hero sai da tela
  let heroVisible = true;
  const heroObserver = new IntersectionObserver(
    (entries) => { heroVisible = entries[0].isIntersecting; },
    { threshold: 0 }
  );

  const heroSection = document.getElementById("hero");
  if (heroSection) heroObserver.observe(heroSection);

  // Só ativa parallax se não for dispositivo touch e não preferir movimento reduzido
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  if (parallaxEl && !prefersReducedMotion && !isTouch) {
    let ticking = false;

    const applyParallax = () => {
      if (!heroVisible) { ticking = false; return; }

      const scrolled = window.scrollY;
      const maxScroll = window.innerHeight * 1.1;
      const progress = Math.min(scrolled / maxScroll, 1);
      const translateY = progress * 28;
      const scale = 1 + progress * 0.12;
      const opacity = 1 - progress * 0.55;

      parallaxEl.style.transform = `translateY(${translateY}%) scale(${scale})`;
      parallaxEl.style.opacity = `${opacity}`;

      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking && heroVisible) {
        requestAnimationFrame(applyParallax);
        ticking = true;
      }
    }, { passive: true });
  }


  // ===== SPLIT REVEAL-TEXT EM PALAVRAS =====
  document.querySelectorAll(".reveal-text").forEach((el) => {
    const text = el.textContent.trim();
    // Preserva a tag <em> se existir
    if (el.querySelector("em")) return;

    el.innerHTML = text
      .split(/\s+/)
      .map((w) => `<span class="word">${w}</span>`)
      .join(" ");

    el.querySelectorAll(".word").forEach((word, i) => {
      word.style.transitionDelay = `${i * 0.06}s`;
    });
  });


  // ===== INTERSECTION OBSERVER — REVEAL =====
  // rootMargin menor em mobile para disparar revelação mais cedo
  const isMobile = window.innerWidth < 768;

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const delay = parseFloat(el.dataset.delay || "0");

        // Em mobile, reduz delays longos para não parecer lento
        const effectiveDelay = isMobile ? Math.min(delay, 0.4) : delay;

        setTimeout(() => {
          el.classList.add("is-visible");
        }, effectiveDelay * 1000);

        revealObserver.unobserve(el);
      });
    },
    {
      threshold: 0.12,
      rootMargin: isMobile ? "-40px" : "-60px",
    }
  );

  document.querySelectorAll(".reveal, .reveal-text, .zoom-in").forEach((el) => {
    revealObserver.observe(el);
  });


  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          // Compensa a altura fixa do nav
          const navHeight = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue("--nav-h"),
            10
          ) || 72;
          const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
    });
  });


  // ===== NAV: destaca link ativo ao scrollar =====
  const sections = document.querySelectorAll("section[id], footer[id]");
  const navLinks = document.querySelectorAll(".nav__links a");

  if (navLinks.length && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.style.opacity = link.getAttribute("href") === `#${id}` ? "1" : "0.6";
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

});