# Shelf

A small shared book collection built with vanilla JavaScript, Spring Boot, MySQL and Docker. The frontend includes an overview, a searchable and sortable library, book details, and an Add Book form connected to the existing API.

## How adding a book works

1. `books.page.js` collects a title and ISBN from the dialog.
2. `book-ui.js` removes spaces/hyphens and checks the ISBN-13 check digit. The form also checks for duplicate ISBNs in the loaded collection.
3. `books.api.js` sends JSON to `POST /api/books` on the same origin.
4. Nginx forwards `/api/` requests to Spring Boot. The backend validates the request and saves the book in MySQL.
5. The new book appears in the library after the server confirms it was saved. Refreshing loads the collection from the API again.

The collection is **shared by all visitors**, with no accounts. Existing book fields are title and ISBN; cover designs are decorative CSS artwork rather than actual book jackets. Search and sorting run in the browser over the loaded collection. Open Library links are optional external lookups.

## Frontend files

- `frontend/style.css`: colours, typography, book artwork and responsive layouts.
- `frontend/app.js`: overview, About and route registration.
- `frontend/router.js`: same-origin navigation and browser Back/Forward support; no CDN required.
- `frontend/books.page.js`: library, search, sorting and Add Book form.
- `frontend/bookdetails.page.js`: book details and Open Library link.
- `frontend/books.api.js`: API calls and readable request errors.
- `frontend/book-ui.js`: safe text rendering and ISBN helpers.

## Checks

Run `npm test` from the repository root (Node 18 or newer). No npm dependencies are needed. These checks cover ISBN validation, API request payloads, details requests and error responses.

For a complete manual check, run the frontend with its existing Nginx development proxy and a running backend, then:

1. Open Overview, My library and a book's details.
2. Search by title and ISBN; try each sort option and an unmatched search.
3. Open Add a book. Try an invalid ISBN, an existing ISBN, then a new valid ISBN such as `9780156012195` (The Little Prince).
4. Refresh and confirm the new book is still present.
5. Check the form using Tab and Escape, and check the library at a narrow phone width.

## Deployment notes for the existing VM

Frontend source changes do not update an already running image. Merge the changes, publish a new release such as `v0.0.2`, and wait for the frontend image publishing workflow to finish successfully. Then update only the frontend image tag in the VM's `~/practice-cloud-app/compose.yml` to the new tag:

```yaml
image: ghcr.io/abbashamad/cloud-starter/frontend:v0.0.2
```

From that VM directory, pull and recreate the frontend:

```bash
docker compose pull frontend
docker compose up -d --no-deps frontend
```

The VM's existing `compose.override.yml`, HTTPS Nginx configuration, certificate mount and database remain in use. Test both domain names over HTTPS and add a book after deployment. Certificate renewal is a separate server task; this frontend change does not configure it.
