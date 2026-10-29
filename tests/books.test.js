import test from "node:test";
import assert from "node:assert/strict";
import { normalizeIsbn, isValidIsbn } from "../frontend/book-ui.js";
import { addBook, fetchBooks, fetchBookById } from "../frontend/books.api.js";

test("ISBN accepts formatting and rejects incorrect check digits or lengths", () => {
  assert.equal(normalizeIsbn("978-0-1560 1219-5"), "9780156012195");
  assert.equal(isValidIsbn(normalizeIsbn("978-0-1560 1219-5")), true);
  assert.equal(isValidIsbn("9780156012196"), false);
  assert.equal(isValidIsbn("978015601219"), false);
  assert.equal(isValidIsbn("978015601219X"), false);
});

test("adding a book uses the real same-origin POST endpoint", async (t) => {
  const book = { title: "The Little Prince", isbn: "9780156012195" };
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/api/books");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(options.body), book);
    return Response.json({ id: 11, ...book }, { status: 201 });
  });
  assert.deepEqual(await addBook(book), { id: 11, ...book });
});

test("API gives usable feedback for invalid, missing, duplicate, and server errors", async (t) => {
  for (const [status, message] of [
    [400, /valid ISBN/],
    [404, /could not be found/],
    [409, /already exists/],
    [500, /try again/],
  ]) {
    const mock = t.mock.method(
      globalThis,
      "fetch",
      async () => new Response(null, { status }),
    );
    await assert.rejects(fetchBooks(), message);
    mock.mock.restore();
  }
});

test("network failure shows a connection error", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new TypeError("Failed to fetch");
  });
  await assert.rejects(fetchBooks(), /Check your connection/);
});

test("details request uses the selected book identifier", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.equal(url, "/api/books/7");
    return Response.json({ id: 7, title: "Moby Dick", isbn: "9781503280786" });
  });
  assert.equal((await fetchBookById(7)).title, "Moby Dick");
});
