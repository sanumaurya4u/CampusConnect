# Campus Connect — AI Development Rules

## 1. Purpose

These rules define how AI coding assistants and developers should build and modify Campus Connect.

The AI must follow the PRD, Architecture, Phases, and Design documents before introducing new functionality.

---

## 2. General Rules

### MUST

- Read the relevant project documentation before making major changes.
- Follow the existing architecture.
- Keep changes focused on the current phase.
- Reuse existing components before creating new ones.
- Keep code readable and maintainable.
- Use TypeScript.
- Validate user input.
- Handle loading, empty, success, and error states.
- Protect authenticated and role-specific routes.
- Keep secrets in environment variables.
- Update documentation when architecture changes.

### MUST NOT

- Rewrite the entire project for a small feature.
- Add dependencies without a clear reason.
- Introduce paid services without approval.
- Build features that are outside the current phase.
- Hardcode API keys or passwords.
- Bypass Supabase security policies.
- Remove working functionality without checking dependencies.
- Create fake backend responses and present them as real data.

---

## 3. Preferred Libraries

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Supabase
- Lucide React

Use additional libraries only when they solve a real requirement.

---

## 4. Libraries to Avoid by Default

Avoid:

- Large UI frameworks when Tailwind/components are sufficient.
- Multiple state-management libraries.
- Multiple data-fetching libraries.
- Unnecessary animation libraries.
- Unnecessary charting libraries.
- Microservice frameworks.
- A separate backend server when Supabase is sufficient.

If a new library is needed, explain:

1. Why it is needed.
2. Why existing tools are insufficient.
3. Whether a free version is available.
4. Its effect on bundle size and maintenance.

---

## 5. AI Rules

AI features must be introduced only after the core workflow is stable.

AI must:

- Provide useful assistance rather than decoration.
- Handle uncertain results gracefully.
- Never silently perform high-impact administrative actions.
- Avoid exposing private user data.
- Use structured outputs where possible.
- Have fallback behavior when the AI service fails.

For recommendations, start with simple deterministic matching based on interests/categories before introducing an expensive or complex AI model.

---

## 6. Error Handling

Every important operation must handle:

### Loading

Show a meaningful loading state.

### Empty

Explain when no data exists.

### Error

Show a user-friendly message.

### Retry

Provide retry where appropriate.

### Validation

Validate forms before submission.

Never expose raw database errors, API keys, stack traces, or internal implementation details to normal users.

---

## 7. Authentication Rules

- Use Supabase Auth.
- Never store passwords manually.
- Never expose service-role keys in frontend code.
- Protect private routes.
- Verify permissions server/database-side.
- Use Row Level Security.
- Logout must invalidate the user session correctly.

---

## 8. Database Rules

- Use migrations for schema changes.
- Use foreign keys where relationships require them.
- Add timestamps to important entities.
- Avoid duplicate data when a relationship can represent it.
- Use meaningful names.
- Enable RLS on user-facing tables.
- Test policies with different roles.

---

## 9. UI Rules

- Follow Design.md.
- Use reusable UI components.
- Keep spacing and typography consistent.
- Support responsive layouts.
- Provide accessible labels and controls.
- Avoid excessive animations.
- Avoid unnecessary popups.
- Do not create a different visual style for every page.

---

## 10. Development Discipline

Before coding:

1. Identify the current phase.
2. Identify the exact feature.
3. Check the PRD.
4. Check the architecture.
5. Plan affected files.
6. Implement the smallest correct solution.
7. Test it.
8. Check responsive behavior.
9. Update documentation if needed.

---

## 11. Git Rules

Use meaningful commits such as:

```text
feat: add club discovery
feat: add event registration
fix: correct organizer permissions
refactor: extract club card component
docs: update architecture
```

Do not commit:

- `.env`
- API secrets
- passwords
- private credentials
- generated sensitive data

---

## 12. Free-First Rule

The project currently has **zero development budget**.

Therefore:

> Prefer free and open-source tools and free tiers.

Before introducing any paid service, the AI must identify whether a free alternative can satisfy the requirement.

---

## 13. Scope Control

If a requested feature belongs to a future phase, do not implement it automatically.

Instead:

- Explain that it belongs to a later phase.
- Identify dependencies.
- Suggest the smallest prerequisite if required.

This prevents AI-assisted development from turning into uncontrolled feature expansion.
