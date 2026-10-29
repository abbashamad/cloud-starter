import { fetchBooks, addBook } from "./books.api.js";
import { bookCard, normalizeIsbn, isValidIsbn } from "./book-ui.js";

export async function booksPage(root) {
  root.innerHTML = /* HTML */ `<section class="page-width library-page">
      <div class="section-heading library-heading">
        <div>
          <p class="eyebrow">COLLECT STORIES, NOT DUST.</p>
          <h1>My library<span class="heading-dot">.</span></h1>
          <p class="muted">Your favourites, all in one place.</p>
        </div>
        <button class="button primary" id="open-add">+ Add a book</button>
      </div>
      <div class="library-toolbar">
        <label class="search-box"
          ><span aria-hidden="true">⌕</span
          ><input
            id="book-search"
            type="search"
            placeholder="Search by title or ISBN"
            aria-label="Search by title or ISBN" /></label
        ><label class="sort-box"
          >Sort by
          <select id="book-sort">
            <option value="title">Title: A–Z</option>
            <option value="title-desc">Title: Z–A</option>
            <option value="newest">Recently added</option>
          </select></label
        >
      </div>
      <div class="results-line">
        <p id="book-count" aria-live="polite">Opening your library…</p>
        <span>THE SHELF COLLECTION</span>
      </div>
      <p id="notice" class="notice" role="status" hidden></p>
      <div id="book-results" class="book-grid" aria-busy="true"></div>
    </section>
    <dialog aria-labelledby="add-heading">
      <form id="add-form">
        <div class="dialog-heading">
          <p class="eyebrow">MAKE ROOM FOR A NEW STORY</p>
          <button
            type="button"
            class="icon-button"
            id="close-add"
            aria-label="Close add book form"
          >
            ×
          </button>
        </div>
        <h2 id="add-heading">Add to your shelf.</h2>
        <p class="muted">
          Just a title and an ISBN. We’ll save it to the shared library.
        </p>
        <label class="field"
          >Book title<input
            name="title"
            required
            maxlength="255"
            placeholder="e.g. The Little Prince"
            autocomplete="off" /></label
        ><label class="field"
          >ISBN-13<input
            name="isbn"
            required
            inputmode="text"
            maxlength="30"
            placeholder="e.g. 9780156012195"
            aria-describedby="isbn-help"
            autocomplete="off"
        /></label>
        <p class="field-help" id="isbn-help">
          The 13-digit number on the book’s barcode. Spaces and hyphens are
          welcome.
        </p>
        <p id="form-error" class="error-message" role="alert" hidden></p>
        <div class="dialog-actions">
          <button type="button" class="button secondary" id="cancel-add">
            Cancel</button
          ><button class="button primary" id="save-book" type="submit">
            Add book ↗
          </button>
        </div>
      </form>
    </dialog>`;
  const page = root.querySelector(".library-page");
  const results = root.querySelector("#book-results");
  const count = root.querySelector("#book-count");
  const search = root.querySelector("#book-search");
  const sort = root.querySelector("#book-sort");
  const dialog = root.querySelector("dialog");
  const form = root.querySelector("form");
  const errorBox = root.querySelector("#form-error");
  const save = root.querySelector("#save-book");
  let books = [];
  let loaded = false;
  let saving = false;
  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const filtered = books.filter(
      (book) =>
        book.title.toLocaleLowerCase().includes(query) ||
        normalizeIsbn(book.isbn).includes(normalizeIsbn(query)),
    );
    filtered.sort((a, b) =>
      sort.value === "newest"
        ? b.id - a.id
        : (sort.value === "title-desc" ? -1 : 1) *
          a.title.localeCompare(b.title),
    );
    count.textContent = query
      ? `${filtered.length} of ${books.length} books`
      : `${books.length} ${books.length === 1 ? "book" : "books"} in your collection`;
    results.setAttribute("aria-busy", "false");
    results.innerHTML = filtered.length
      ? filtered.map(bookCard).join("")
      : `<div class="empty-state"><span class="empty-symbol" aria-hidden="true">▤</span><h2>${books.length ? "No matching stories." : "Your shelf is waiting."}</h2><p>${books.length ? "Try a different title or ISBN." : "Use Add a book to start your collection."}</p></div>`;
  }
  function close() {
    if (!saving) dialog.close();
  }
  root.querySelector("#open-add").onclick = () => {
    form.reset();
    errorBox.hidden = true;
    dialog.showModal();
  };
  root.querySelector("#close-add").onclick = close;
  root.querySelector("#cancel-add").onclick = close;
  dialog.addEventListener("cancel", (event) => {
    if (saving) event.preventDefault();
  });
  search.oninput = () => {
    if (loaded) render();
  };
  sort.onchange = () => {
    if (loaded) render();
  };
  async function load() {
    results.setAttribute("aria-busy", "true");
    try {
      books = await fetchBooks();
      if (!page.isConnected) return;
      loaded = true;
      render();
    } catch (error) {
      if (!page.isConnected) return;
      count.textContent = "Library unavailable";
      results.setAttribute("aria-busy", "false");
      results.innerHTML = /* HTML */ `<div class="empty-state">
        <h2>Couldn't open your library.</h2>
        <p></p>
        <button class="button secondary">Try again</button>
      </div>`;
      results.querySelector("p").textContent = error.message;
      results.querySelector("button").onclick = load;
    }
  }
  form.onsubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const title = form.elements.title.value.trim();
    const isbn = normalizeIsbn(form.elements.isbn.value);
    errorBox.hidden = true;
    const fail = (message) => {
      errorBox.textContent = message;
      errorBox.hidden = false;
    };
    if (!title) return fail("Please enter a book title.");
    if (!isValidIsbn(isbn))
      return fail(
        "Enter a valid 13-digit ISBN, including its correct check digit.",
      );
    if (books.some((book) => normalizeIsbn(book.isbn) === isbn))
      return fail("A book with this ISBN is already on the shelf.");
    saving = true;
    save.disabled = true;
    save.textContent = "Adding…";
    try {
      const book = await addBook({ title, isbn });
      if (!page.isConnected) return;
      books.push(book);
      search.value = "";
      sort.value = "newest";
      render();
      dialog.close();
      const notice = root.querySelector("#notice");
      notice.textContent = `“${book.title}” is now on your shelf.`;
      notice.hidden = false;
      root.querySelector("#open-add").focus();
      if (!loaded) await load();
    } catch (error) {
      if (page.isConnected) fail(error.message);
    } finally {
      saving = false;
      save.disabled = false;
      save.textContent = "Add book ↗";
    }
  };
  await load();
}
