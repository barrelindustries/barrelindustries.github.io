(function () {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle("nav--scrolled", window.scrollY > 8);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = nav.querySelector(".nav-toggle");
  const menu = nav.querySelector("#nav-links");
  if (!toggle || !menu) return;

  const mobile = window.matchMedia("(max-width: 720px)");

  const syncInert = () => {
    if (!mobile.matches) {
      menu.inert = false;
      return;
    }
    menu.inert = !nav.classList.contains("nav--open");
  };

  const closeMenu = () => {
    nav.classList.remove("nav--open");
    toggle.setAttribute("aria-expanded", "false");
    syncInert();
  };

  const openMenu = () => {
    nav.classList.add("nav--open");
    toggle.setAttribute("aria-expanded", "true");
    syncInert();
  };

  toggle.addEventListener("click", () => {
    nav.classList.contains("nav--open") ? closeMenu() : openMenu();
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  mobile.addEventListener("change", syncInert);
  syncInert();
})();
