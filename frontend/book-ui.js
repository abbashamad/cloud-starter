export function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = String(value ?? "");
  return element.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
export function normalizeIsbn(value) {
  return value.replace(/[-\s]/g, "");
}
export function isValidIsbn(value) {
  if (!/^\d{13}$/.test(value)) return false;
  const sum = [...value.slice(0, 12)].reduce(
    (total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1),
    0,
  );
  return (10 - (sum % 10)) % 10 === Number(value[12]);
}
export function cover(book, extraClass = "") {
  const theme = Number(book.id) % 5;
  return /* HTML */ `<div
    class="book-cover cover-${theme} ${extraClass}"
    aria-hidden="true"
  >
    <span class="cover-label">THE SHELF COLLECTION</span
    ><span class="cover-title">${escapeHtml(book.title)}</span
    ><span class="cover-art"></span
    ><span class="cover-bottom">A STORY WORTH KEEPING</span>
  </div>`;
}
export function bookCard(book) {
  return /* HTML */ `<a
    class="book-card"
    href="/books/${Number(book.id)}"
    data-navigo
    >${cover(book)}
    <div class="card-meta">
      <h3>${escapeHtml(book.title)}</h3>
      <span aria-hidden="true">↗</span>
    </div>
    <p class="isbn">ISBN ${escapeHtml(book.isbn)}</p></a
  >`;
}
