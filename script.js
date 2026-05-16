// Brookie Cookies & More — interactions

document.addEventListener("DOMContentLoaded", () => {
  // year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // loader
  const loader = document.getElementById("loader");
  setTimeout(() => loader && loader.classList.add("is-hidden"), 1400);

  // nav background on scroll
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (window.scrollY > 60) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // hero parallax
  const parallax = document.querySelector("[data-parallax]");
  if (parallax) {
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      const max = window.innerHeight * 1.1;
      const p = Math.min(y / max, 1);
      parallax.style.transform = `translateY(${p * 30}%) scale(${1 + p * 0.15})`;
      parallax.style.opacity = `${1 - p * 0.6}`;
    }, { passive: true });
  }

  // split reveal-text into words
  document.querySelectorAll(".reveal-text").forEach((el) => {
    const text = el.textContent.trim();
    el.innerHTML = text.split(/\s+/).map((w) => `<span class="word">${w}</span>`).join(" ");
    // staggered transition-delay
    el.querySelectorAll(".word").forEach((w, i) => {
      w.style.transitionDelay = `${i * 0.06}s`;
    });
  });

  // intersection observer for reveal + reveal-text
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseFloat(el.dataset.delay || "0");
      setTimeout(() => el.classList.add("is-visible"), delay * 1000);
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: "-60px" });

  document.querySelectorAll(".reveal, .reveal-text, .zoom-in").forEach((el) => io.observe(el));

  // smooth anchor scroll (in addition to css smooth)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length > 1) {
        const t = document.querySelector(id);
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: "smooth", block: "start" }); }
      }
    });
  });
});
