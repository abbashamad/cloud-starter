import { fetchBookById } from "./books.api.js";
import { cover, escapeHtml } from "./book-ui.js";

export async function bookDetailsPage(root, bookId) {
  root.innerHTML = /* HTML */ `<section class="page-width details-page">
    <a class="text-link" href="/books" data-navigo>← Back to library</a>
    <div id="book-detail" aria-live="polite">
      <p class="muted">Opening this chapter…</p>
    </div>
  </section>`;
  const target = root.querySelector("#book-detail");
  try {
    const book = await fetchBookById(bookId);
    if (!target.isConnected) return;
    document.title = `${book.title} — Shelf`;
    target.innerHTML = /* HTML */ `<div class="details-layout">
      ${cover(book, "detail-cover")}
      <div class="details-copy">
        <p class="eyebrow">ON YOUR SHELF</p>
        <h1>${escapeHtml(book.title)}</h1>
        <p class="intro">A story worth keeping close.</p>
        <dl>
          <dt>ISBN-13</dt>
          <dd>${escapeHtml(book.isbn)}</dd>
          <dt>Collection</dt>
          <dd>The Shelf collection</dd>
        </dl>
        <a
          class="button primary"
          href="https://openlibrary.org/isbn/${encodeURIComponent(book.isbn)}"
          target="_blank"
          rel="noopener noreferrer"
          >Look up on Open Library ↗</a
        >
        <p class="field-help">Opens an external site in a new tab.</p>
      </div>
    </div>`;
  } catch (error) {
    if (!target.isConnected) return;
    target.innerHTML = /* HTML */ `<div class="empty-state">
      <h1>Couldn't open this book.</h1>
      <p></p>
      <button class="button secondary">Try again</button>
    </div>`;
    target.querySelector("p").textContent = error.message;
    target.querySelector("button").onclick = () =>
      bookDetailsPage(root, bookId);
  }
}
