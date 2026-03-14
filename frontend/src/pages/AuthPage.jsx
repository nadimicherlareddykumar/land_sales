import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", agency_name: "", experience: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let result;
    if (mode === "login") {
      result = await login(form.email, form.password);
    } else {
      result = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        agency_name: form.agency_name,
        experience: Number(form.experience) || 0
      });
    }

    if (result.success) {
      toast.success(mode === "login" ? `Welcome back, ${result.user.name}!` : `Account created! Welcome!`);
      navigate("/agent/dashboard");
    } else {
      toast.error(result.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="brand" style={{ justifyContent: "center", marginBottom: "1.5rem" }}>
            <span className="brand-mark">PND</span>
            <span>PND Developers</span>
          </Link>

          <div className="auth-tabs">
            <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Sign In</button>
            <button className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => setMode("register")}>Register</button>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Full Name*
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
            </label>
          )}

          <label>
            Email Address*
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </label>

          <label>
            Password*
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder={mode === "login" ? "Enter your password" : "Min 6 characters"} required minLength={mode === "register" ? 6 : undefined} />
          </label>

          {mode === "register" && (
            <>
              <label>
                Phone Number*
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91-XXXXXXXXXX" required />
              </label>
              <label>
                Agency / Division Name*
                <input name="agency_name" value={form.agency_name} onChange={handleChange} placeholder="Internal division" required />
              </label>
            </>
          )}

          <button className="btn btn-primary btn-full" type="submit" disabled={submitting}>
            {submitting ? "Please wait..." : (mode === "login" ? "Sign In as Staff" : "Create Staff Account")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
