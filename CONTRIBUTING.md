# Contributing

Thanks for helping improve this B2B multi-SaaS starter. Issues, feature requests, and pull requests are welcome.

Please write issues, requests, and pull request text in English.

## Issues

Use a GitHub Issue for bugs and for questions that are not already answered in the README.

Include:

- What you expected, and what happened
- Steps to reproduce
- Hub and App1 URLs (locale included, for example `/en/dashboard`)
- Node, pnpm, and OS versions
- Relevant logs, with secrets removed

Do not paste `.env.local`, JWT secrets, Stripe keys, or session cookies.

## Feature requests

Open an Issue before starting a large change. Describe the user workflow, which app it belongs to (`hub` or `products/app1`), and how it should behave when external keys are still the dummy values.

This repository stays mock-first: Stripe, the database, GA4, and Search Console must keep working on localhost without a paid account.

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Keep the change focused. One pull request should do one thing.
3. Open the pull request against `main` and link the related Issue.
4. Describe how you tested it. For UI changes, note the routes you opened in the browser.

### Branches

| Kind | Name |
| --- | --- |
| Feature | `feat/short-description` |
| Bug fix | `fix/short-description` |
| Docs only | `docs/short-description` |

Use lowercase words separated by hyphens.

### Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <imperative summary>
```

Types in use: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

Examples:

```
feat(hub): add locale-aware checkout return URL
fix(app1): redirect expired sessions to the Hub
docs: describe the shared session cookie
```

The subject is imperative, lowercase after the colon, and has no trailing period. Keep it within 72 characters. Add a body when the reason is not obvious from the subject.

### Code expectations

- TypeScript stays strict. Do not introduce `any`.
- UI stays a monochrome wireframe (`bg-gray-50`, `border-gray-200`). Do not add visual decoration.
- User-facing copy goes through `messages/en.json` and `messages/ja.json`. English is the default locale.
- Do not commit `.env.local` or generated secrets.
- Legal placeholder text stays marked `[EDIT_REQUIRED: ...]` in English and `[要手動編集: ...]` in Japanese. Do not present the terms template as production legal advice.

Run `pnpm exec tsc --noEmit` inside `hub` and `products/app1` when you change TypeScript.
