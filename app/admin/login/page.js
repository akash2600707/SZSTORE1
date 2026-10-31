import { redirect } from "next/navigation";
import { isAdmin, enabled } from "@/lib/admin";
import { login } from "../actions";
export const dynamic = "force-dynamic";
export default function Login({ searchParams }) {
  if (isAdmin()) redirect("/admin");
  return (
    <main style={{ maxWidth: 440, margin: "0 auto", padding: "56px 0" }}>
      <h1 style={{ fontSize: 40, marginBottom: 24 }}>Admin sign in</h1>
      {!enabled() ? <p className="err">Admin is switched off. Set ADMIN_PASSWORD in your environment variables to turn it on.</p> :
        <form className="box" action={login}>
          <label htmlFor="pw">Password</label><input id="pw" name="password" type="password" required autoFocus autoComplete="current-password" />
          {searchParams?.e && <p className="err" role="alert">Wrong password.</p>}
          <button className="btn">Sign in</button>
        </form>}
    </main>
  );
}
