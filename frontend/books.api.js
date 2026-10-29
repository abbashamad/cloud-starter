const API_URL = "/api/books";

async function request(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error(
      "We couldn't reach your library. Check your connection and try again.",
    );
  }
  if (!response.ok) {
    if (response.status === 404)
      throw new Error("This book could not be found.");
    if (response.status === 409)
      throw new Error("A book with this ISBN already exists.");
    if (response.status === 400)
      throw new Error("Check the title and enter a valid ISBN-13.");
    throw new Error(
      "The server couldn't complete the request. Please try again.",
    );
  }
  return response.json();
}
export function fetchBooks() {
  return request(API_URL);
}
export function fetchBookById(id) {
  return request(`${API_URL}/${encodeURIComponent(id)}`);
}
export function addBook(book) {
  return request(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
}
