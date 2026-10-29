// A small same-origin router keeps navigation working without a CDN dependency.
const routes = new Map();
let fallback = () => {};
const router = {
  on(path, handler) {
    routes.set(path, handler);
    return this;
  },
  notFound(handler) {
    fallback = handler;
    return this;
  },
  navigate(path) {
    history.pushState({}, "", path);
    this.resolve();
    window.scrollTo(0, 0);
  },
  resolve() {
    const path = location.pathname.replace(/\/$/, "") || "/";
    document.querySelectorAll("nav a").forEach((link) => {
      if (
        link.pathname === path ||
        (link.pathname === "/books" && path.startsWith("/books/"))
      ) {
        link.setAttribute("aria-current", "page");
      } else link.removeAttribute("aria-current");
    });
    if (routes.has(path)) return routes.get(path)();
    const match = path.match(/^\/books\/(\d+)$/);
    if (match) return routes.get("/books/:id")({ data: { id: match[1] } });
    fallback();
  },
};
document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-navigo]");
  if (
    !link ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  if (link.origin !== location.origin) return;
  event.preventDefault();
  router.navigate(link.pathname + link.search);
});
window.addEventListener("popstate", () => router.resolve());
export default router;
