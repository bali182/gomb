# Workflow

- Use npm and Vitest. Never perform mutating git operations (commit, push, etc.).
- Do not modify any file without explicit user authorization. Start coding only after an explicit "go" at the end of the user's message (e.g. "do it", "let's give this a try") or selection of "Implement plan" after a plan.
- Never code while design questions are being discussed. A message ending with a question, or answers without an explicit "go", do not authorize coding.
- A one-word "Ok" or "rendben" approving your proposal authorizes implementing it.
- For business-logic changes, explicitly ask whether tests are wanted. For UI changes, never ask about, propose, plan, or add tests; UI is currently not testable.
- After coding, run `npm run typecheck`, then `npm run lint`, then, if both pass, `npm run pretty`. Do not start a dev server, write manual test steps, or suggest testing libraries.

## Planning and scope

- Start from the user's brief and requested clarification round. Before planning, investigate what is needed and always ASK about architectural and smaller decisions. List all unclear points as numbered questions.
- Before implementation, present a concise, concrete plan for another developer. Group it by created, updated, or deleted file; name affected types, function signatures, component types, and constants, and explain the logic changes. Describe test cases the same way when tests are requested.
- Avoid vague requirements and excessive detail. Plan enough to avoid a "write, compile, fail, redesign" loop, and ensure the user understands the implementation before starting.
- Reuse existing types, utilities, and logic rather than introducing replacements for everything.
- Only implement architecture explicitly specified in the approved plan. Before adding an unplanned import, dependency, context, state, data field, prop flow, abstraction, or cross-component data flow, STOP and ASK for approval.
- If the planned pattern cannot solve the task, STOP and CLARIFY; do not invent or partially implement a different architecture. Suggestions are welcome; the user decides.
- Never directly import a transitive dependency without explicit approval.

## Coding style

- **Access and narrowing:** use existing accessors for model lookups and parent access, and existing narrowers/asserters for type checks. Leave switches covering every alternative of a union intact. Report missing helpers instead of inventing replacements.
- **Types:** reuse existing types; avoid unnecessary new types and `Pick`/`Omit` chains. Name complex types instead of inlining them. Each object alternative of a union must be separately named; do not inline object alternatives in a union.
- **React:** organize cohesive UI parts into components with few props. Extracting a component does not by itself justify a separate file or a new context.
- **Names and comments:** use precise domain names: an accessor instance is `accessor`, a stitch line is `stitchLine`, not `line`. Write comments in English and only when they add information.
- **Control flow:** always use blocks for `if` and `for`. Use `isDefined(value)` for null/undefined checks; never use truthiness or negate a non-boolean for that purpose.
- **Hook types:** explicitly type `useMemo` with its result type, e.g. `useMemo<ProjectSchema | undefined>(...)`. Write callback parameter and return types directly; never use extracted callback types such as `useCallback<EditorContextType['setProject']>(...)`.
- Never add `aria-label` attributes unless explicitly requested.
