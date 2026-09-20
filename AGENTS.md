# Basic instructions

- The package manager is npm.
- Testing framework is vitest. Only for business-logic changes, explicitly ask whether tests are wanted. For UI changes, never ask about, propose, plan, or add tests; UI is currently not testable.
- Never perform any mutating git operations (commit, push, etc)

## Editing code.

- Until the user explicitly asks you to, it's strictly forbidden to modify any files.
- Under no circumstances start writing code while the user is still asking questions about a design solution, or you don't have an explicit "go" instruction at the end of a message from the user.
- Coding is only permitted when the user explicitly exclaims something like "do it", "let's give this a try", or when the user choses the "Implement plan" option after a presenting a plan.
- If the users last prompt ended with a question, it's a clear sign, that it's forbidden to code.
- If the user answers your questions, but didn't give an explicit "go", it's still forbidden to write code.
- Never type `useCallback` with a type extracted from another type, such as `useCallback<EditorContextType['setProject']>(...)`. Write the callback parameter and return types directly in the callback declaration instead.
- Type `useMemo` directly with its result type, such as `useMemo<ProjectSchema | undefined>(...)`.
- It is forbidden to add aria-label-s unless explicitly asked to.

## Planning

- Before planning the user will briefly explain the plan, and ask you to formulate questions.
- Try to be detailed, explore what you have to and present all that wasn't clear from the brief in a NUMBERED list!
- Don't be overly verbose when writing plans.
- Group your plan by:
  - Modified (created, deleted or updated) file name.
  - Under each file note modified (created, deleted or updated) types, function signatures, component types and constants.
  - Explain the logic what you are planning to modify in said file.
- This is true for tests as well. Explain what you are planning to test as one programmer to another.
- Try to reuse types, utils, etc when appropriate. Don't mindlessly suggest new types and logic for everything.
- You are writing plans for another developer. Don't write vague requirements business analyst style, but exactly what you are planning to do in the code. The goal is, that you don't rely on the "Write something -> Try to compile -> Doesn't work -> Start again" loop excessively. You should always start implementation with a concise plan, while the user has a clear understanding of what you will do.
- Checks after writing code: `npm run typecheck`, `npm run lint` and if that's in order `npm run pretty`. Don't try to run a dev server, don't write manual test steps, don't suggest testing libraries.
- Before planning always ASK for architectural and even smaller decisions.
- If you suggest something, and the user says "Ok" or "rendben" as one word (confirmation style), you are allowed to do it.

## Coding style

- if(value) => if(isDefined(value)). Negating non-booleans is strictly forbidden for null/undefined checks.
- Complex (object) types in union types must have named type alternatives. type Union = {type: 'A', ...} | {type: 'B', ...} STRICTLY FORBIDDEN. Each type alternative must be a named type. Example: type A = {type: 'A', ...} type B = {type: 'B', ...} type Union = A | B.
- Never directly import a transitive dependency without explicit approval.
- Only implement architecture explicitly specified in the plan.
- Before adding any unplanned import, dependency, context, state, data field, prop flow, abstraction, or cross-component data flow, STOP and ASK for approval.
- If the pattern described in the plan cannot solve the task, do not invent or partially implement a different one. STOP and CLARIFY the problem. Suggestions are always welcome, but the decision comes from the user.
