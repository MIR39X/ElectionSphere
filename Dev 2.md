# Dev 2 Instructions: Frontend and UI/UX

## Role

You are responsible only for the frontend side of ElectionSphere.

Your focus is:

- React pages
- UI/UX polish
- Frontend validation
- Styling and responsive layout
- Frontend documentation

Do not edit smart contract or deployment files.

## Allowed Files and Folders

You may edit only:

```text
src/
public/
index.html
eslint.config.js
docs/frontend-notes.md
```

## Do Not Touch

Do not edit:

```text
contracts/
test/
scripts/
hardhat.config.cjs
.env.example
README.md
package.json
package-lock.json
```

If you need a contract or deployment change, write it down and give it to Dev 1.

## Tasks

1. Polish frontend pages
   - Landing page
   - Dashboard page
   - Admin page
   - Vote page
   - Results page

2. Improve user flow
   - Make every page clear.
   - Remove duplicate information.
   - Show only relevant actions.
   - Improve empty states.
   - Improve loading states.

3. Add frontend validation
   - Validate wallet address format.
   - Block empty candidate forms.
   - Disable invalid actions.
   - Show readable error messages.

4. Improve UI consistency
   - Use consistent spacing.
   - Use consistent button styles.
   - Use clear active navigation states.
   - Use responsive layouts.
   - Keep the interface modern and professional.

5. Add documentation
   - Create `docs/frontend-notes.md`.
   - Explain page structure.
   - Explain user roles in the UI.
   - Explain known frontend limitations.

## Commands

Use these commands for your work:

```bash
npm run dev
npm run lint
npm run build
```

## Commit Rules

Use short, clear commit messages:

```text
Polish dashboard layout
Improve admin validation
Refine vote page states
```

## Strict Rule

Do not edit Dev 1 files. No exceptions without team agreement.
