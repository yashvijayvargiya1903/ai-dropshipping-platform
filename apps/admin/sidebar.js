// Shared owner navigation for every admin page.
(function () {
  const start = () => {
    const button = document.getElementById("mobileMenuBtn");
    const overlay = document.getElementById("sidebarOverlay");
    if (!button || !overlay) return;

    let aside = document.querySelector("body > aside");
    if (!aside) {
      const path = location.pathname.split("/").pop() || "index.html";
      const items = [
        ["index.html", "Overview"],
        ["orders.html", "Orders"],
        ["products.html", "Products"],
        ["action-center.html", "Product Vetting"],
        ["offers.html", "Offers & Coupons"],
        ["customers.html", "Customers"],
        ["returns.html", "Returns"],
        ["analytics.html", "Analytics"],
        ["automation.html", "Automation"],
        ["settings.html", "Settings"]
      ];
      aside = document.createElement("aside");
      aside.innerHTML =
        '<div class="brand brand-lockup"><span class="brand-mark">⌂</span><span>Owner Dashboard</span></div>' +
        '<nav aria-label="Owner navigation">' +
        items.map(([href, label]) =>
          '<a href="./' + href + '"' +
          (path === href ? ' class="active" aria-current="page"' : "") +
          '>' + label + '</a>'
        ).join("") +
        '</nav><div class="status"><i></i> Demo dashboard</div>';
      document.body.insertBefore(aside, document.body.querySelector("main") || null);
    }

    const close = () => {
      document.body.classList.remove("admin-menu-open");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open owner menu");
    };
    const toggle = () => {
      const open = !document.body.classList.contains("admin-menu-open");
      document.body.classList.toggle("admin-menu-open", open);
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close owner menu" : "Open owner menu");
    };

    // Replace any previous handlers by cloning the control, so every page has
    // exactly one reliable click handler even when its own inline script exists.
    const freshButton = button.cloneNode(true);
    button.replaceWith(freshButton);
    freshButton.addEventListener("click", toggle);
    overlay.addEventListener("click", close);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") close();
    });
    aside.querySelectorAll("nav a").forEach(link => link.addEventListener("click", close));
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();