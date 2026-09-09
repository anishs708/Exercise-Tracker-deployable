import { BookOpen, CalendarClock, Dumbbell, LogOut } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/sessions", label: "Sessions", icon: CalendarClock },
  { to: "/exercises", label: "Exercises", icon: BookOpen }
];

function NavigationLinks({ mobile = false }) {
  return navigation.map(({ to, label, icon: Icon }) => (
    <NavLink key={to} to={to} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
      <Icon size={mobile ? 20 : 18} />
      <span>{label}</span>
    </NavLink>
  ));
}

function AppShell({ email, onLogout }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup sidebar-brand">
          <span className="brand-mark"><Dumbbell size={21} /></span>
          <span>Formwork</span>
        </div>

        <nav className="side-nav" aria-label="Primary navigation">
          <NavigationLinks />
        </nav>

        <div className="account-block">
          <div className="account-avatar" aria-hidden="true">{email ? email[0].toUpperCase() : "U"}</div>
          <div className="account-copy">
            <span>Signed in</span>
            <strong title={email}>{email || "Account"}</strong>
          </div>
          <button className="icon-button dark-icon" type="button" onClick={onLogout} title="Log out" aria-label="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <header className="mobile-header">
        <div className="brand-lockup">
          <span className="brand-mark"><Dumbbell size={20} /></span>
          <span>Formwork</span>
        </div>
        <button className="icon-button" type="button" onClick={onLogout} title="Log out" aria-label="Log out">
          <LogOut size={19} />
        </button>
      </header>

      <section className="app-main">
        <Outlet />
      </section>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <NavigationLinks mobile />
      </nav>
    </div>
  );
}

export default AppShell;
