<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# IMPORTANT: Server Actions + useActionState
- In Next.js 16, `useActionState` from React expects action signature `(prevState: State, formData: FormData) => Promise<State>`.
- When using `useActionState`, the action should NOT throw for expected validation errors; return error string instead.
- `redirect()` inside a server action still works, but if wrapping with `useActionState`, do client-side redirect via `useRouter().push()` instead.
- Server actions that throw `new Error(...)` show generic "Algo salió mal" page; use `useActionState` + return error strings to show inline.
<!-- END:nextjs-agent-rules -->
