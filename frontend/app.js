import { bookDetailsPage } from "./bookdetails.page.js";
import { booksPage } from "./books.page.js";
import { fetchBooks } from "./books.api.js";
import { bookCard } from "./book-ui.js";
import router from "./router.js";

const app = document.querySelector("#app");
async function renderHomePage() {
  document.title = "Shelf — A home for your books";
  app.innerHTML = /* HTML */ `<section class="hero page-width">
      <div class="hero-copy">
        <p class="eyebrow">YOUR PERSONAL BOOK COLLECTION</p>
        <h1>Good books.<br />Great company.</h1>
        <p class="hero-description">
          A home for the stories you love, and the ones you haven’t discovered
          yet. Make a little room on your shelf.
        </p>
        <a class="button primary" href="/books" data-navigo
          >Explore my library <span>↗</span></a
        ><span class="hero-footnote"
          >A small collection. Endless possibilities.</span
        >
      </div>
      <div class="hero-art" aria-hidden="true">
        <span class="orbit orbit-one"></span
        ><span class="orbit orbit-two"></span
        ><span class="art-caption">LOSE YOURSELF<br />IN A GOOD BOOK.</span>
        <div class="hero-book book-back">
          <span>THE ART<br />OF GETTING<br />LOST</span>
        </div>
        <div class="hero-book book-front">
          <small>THE SHELF COLLECTION</small
          ><strong>One more<br />chapter.</strong><span class="sun"></span
          ><small>THERE’S ALWAYS ANOTHER STORY</small>
        </div>
        <span class="art-number">VOL. 001 — ∞</span>
      </div>
    </section>
    <section class="collection-section page-width">
      <div class="section-heading">
        <div>
          <p class="eyebrow">WORTH A SPOT ON YOUR SHELF</p>
          <h2>A glimpse of your library</h2>
        </div>
        <a class="text-link" href="/books" data-navigo>View all books ↗</a>
      </div>
      <div id="home-books" class="book-grid preview-grid" aria-live="polite">
        <p class="muted">Opening your library…</p>
      </div>
    </section>`;
  const target = app.querySelector("#home-books");
  try {
    const books = await fetchBooks();
    if (!target.isConnected) return;
    target.innerHTML = books.length
      ? books.slice(0, 4).map(bookCard).join("")
      : `<div class="empty-state"><h3>Your story starts here.</h3><p>Add your first book in My library.</p><a class="text-link" href="/books" data-navigo>Start your collection ↗</a></div>`;
  } catch (error) {
    if (target.isConnected) {
      target.replaceChildren();
      const message = document.createElement("p");
      message.textContent = error.message;
      target.append(message);
    }
  }
}
function renderAboutPage() {
  document.title = "About — Shelf";
  app.innerHTML = /* HTML */ `<section class="page-width about-page">
    <p class="eyebrow">A SMALL SPACE. A BIG LOVE FOR BOOKS.</p>
    <h1>Every shelf<br />tells a story.</h1>
    <p class="intro">This one is yours.</p>
    <div class="about-columns">
      <div>
        <h2>Keep the good ones close.</h2>
        <p>
          Shelf is a simple home for your book collection. Add a title and its
          ISBN, find a favourite, or discover what’s already waiting in your
          library.
        </p>
        <a class="button primary" href="/books" data-navigo
          >Make yourself at home ↗</a
        >
      </div>
      <div>
        <h2>Made while learning.</h2>
        <p>
          Built by Abbas Hamad with JavaScript, Spring Boot and MySQL. Each book
          you add is stored in the shared library database.
        </p>
        <p class="muted">
          This is a public learning project: the collection is shared with
          everyone who visits. There are no personal accounts.
        </p>
      </div>
    </div>
  </section>`;
}
router
  .on("/", renderHomePage)
  .on("/books", () => {
    document.title = "My library — Shelf";
    booksPage(app);
  })
  .on("/books/:id", (params) => bookDetailsPage(app, params.data.id))
  .on("/about", renderAboutPage)
  .notFound(() => {
    document.title = "Page not found — Shelf";
    app.innerHTML = /* HTML */ `<section class="empty-state page-width">
      <p class="eyebrow">404 — A MISSING CHAPTER</p>
      <h1>This page isn't on the shelf.</h1>
      <a class="button primary" href="/" data-navigo>Back to overview ↗</a>
    </section>`;
  });
router.resolve();
