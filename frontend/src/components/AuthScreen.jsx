import { useState } from "react";
import { Activity, ArrowRight, Dumbbell, ShieldCheck } from "lucide-react";
import { apiRequest } from "../api";

const initialLogin = { email: "", password: "" };
const initialSignup = {
  email: "",
  password: "",
  name: "",
  height: "",
  weight: "",
  age: ""
};

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialLogin);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setForm(nextMode === "login" ? initialLogin : initialSignup);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const path = mode === "login" ? "/api/user/logIn" : "/api/user/signUp";
      const body = mode === "login"
        ? form
        : {
            ...form,
            height: Number(form.height),
            weight: Number(form.weight),
            age: Number(form.age)
          };

      await apiRequest(path, { method: "POST", body });
      await onAuthenticated(form.email);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-brand" aria-label="Exercise Tracker">
        <div className="brand-lockup">
          <span className="brand-mark"><Dumbbell size={22} /></span>
          <span>Formwork</span>
        </div>
        <div className="auth-brand-copy">
          <p className="eyebrow">Exercise tracker</p>
          <h1>Build the work.<br />Track the proof.</h1>
          <p>Plan sessions, keep every set organized, and watch consistency turn into progress.</p>
        </div>
        <div className="auth-metrics" aria-hidden="true">
          <div><Activity size={19} /><span>Workout history</span></div>
          <div><ShieldCheck size={19} /><span>Private by default</span></div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-heading">
            <p className="eyebrow">Welcome</p>
            <h2>{mode === "login" ? "Sign in to continue" : "Create your account"}</h2>
            <p>{mode === "login" ? "Your plans and exercise library are ready." : "Start building workouts in a few details."}</p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Account action">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>Log in</button>
            <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")}>Sign up</button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <label>Name<input name="name" value={form.name} onChange={handleChange} placeholder="Alex Morgan" required /></label>
            )}
            <label>Email<input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required /></label>
            <label>Password<input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required /></label>

            {mode === "signup" && (
              <div className="measurement-grid">
                <label>Height<input type="number" name="height" min="1" value={form.height} onChange={handleChange} placeholder="cm" required /></label>
                <label>Weight<input type="number" name="weight" min="1" value={form.weight} onChange={handleChange} placeholder="kg" required /></label>
                <label>Age<input type="number" name="age" min="13" value={form.age} onChange={handleChange} placeholder="years" required /></label>
              </div>
            )}

            {error && <div className="form-error" role="alert">{error}</div>}

            <button className="primary-button auth-submit" type="submit" disabled={submitting}>
              <span>{submitting ? "Please wait" : mode === "login" ? "Log in" : "Create account"}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default AuthScreen;
