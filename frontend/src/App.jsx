import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Dumbbell, RefreshCw, WifiOff } from "lucide-react";
import { apiRequest } from "./api";
import AppShell from "./components/AppShell";
import AuthScreen from "./components/AuthScreen";
import ExercisesPage from "./pages/ExercisesPage";
import SessionsPage from "./pages/SessionsPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import "./App.css";

function Application() {
  const [sessionStatus, setSessionStatus] = useState("checking");
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [email, setEmail] = useState(() => localStorage.getItem("tracker-email") || "");
  const [notice, setNotice] = useState("");

  const loadAccountData = useCallback(async (accountEmail) => {
    try {
      const [workoutData, exerciseData, upcomingData, historyData] = await Promise.all([
        apiRequest("/api/workout"),
        apiRequest("/api/exercise"),
        apiRequest("/api/sessions/upcoming"),
        apiRequest("/api/sessions/history")
      ]);

      setWorkouts(workoutData);
      setExercises(exerciseData);
      setUpcomingSessions(upcomingData);
      setSessionHistory(historyData);
      setEmail(accountEmail ?? localStorage.getItem("tracker-email") ?? "");
      setSessionStatus("authenticated");
    } catch (error) {
      if (error.status === 401) {
        setSessionStatus("anonymous");
      } else {
        setSessionStatus("unavailable");
      }
    }
  }, []);

  useEffect(() => {
    const requestId = window.setTimeout(() => loadAccountData(), 0);
    return () => window.clearTimeout(requestId);
  }, [loadAccountData]);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const handleAuthenticated = async (accountEmail) => {
    localStorage.setItem("tracker-email", accountEmail);
    await loadAccountData(accountEmail);
  };

  const handleLogout = async () => {
    try {
      await apiRequest("/api/user/logOut", { method: "POST" });
    } finally {
      localStorage.removeItem("tracker-email");
      setEmail("");
      setWorkouts([]);
      setExercises([]);
      setUpcomingSessions([]);
      setSessionHistory([]);
      setSessionStatus("anonymous");
    }
  };

  const createWorkout = async (payload) => {
    const created = await apiRequest("/api/workout", { method: "POST", body: payload });
    setWorkouts((current) => [created, ...current]);
    showNotice("Workout created");
  };

  const updateWorkout = async (id, payload) => {
    const updated = await apiRequest(`/api/workout/${id}`, { method: "PATCH", body: payload });
    setWorkouts((current) => current.map((item) => item._id === id ? updated : item));
    showNotice("Workout updated");
  };

  const deleteWorkout = async (id) => {
    await apiRequest(`/api/workout/${id}`, { method: "DELETE" });
    setWorkouts((current) => current.filter((item) => item._id !== id));
    showNotice("Workout deleted");
  };

  const createSession = async (payload) => {
    const created = await apiRequest("/api/sessions", { method: "POST", body: payload });
    setUpcomingSessions((current) => [...current, created].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)));
    showNotice("Workout scheduled");
    return created;
  };

  const startSession = async (id) => {
    const started = await apiRequest(`/api/sessions/${id}/start`, { method: "PATCH", body: {} });
    setUpcomingSessions((current) => current.map((item) => item._id === id ? started : item));
    showNotice("Workout started");
    return started;
  };

  const completeSession = async (id, payload) => {
    const completed = await apiRequest(`/api/sessions/${id}/complete`, { method: "PATCH", body: payload });
    setUpcomingSessions((current) => current.filter((item) => item._id !== id));
    setSessionHistory((current) => [completed, ...current]);
    showNotice("Workout completed");
    return completed;
  };

  const cancelSession = async (id, payload) => {
    const cancelled = await apiRequest(`/api/sessions/${id}/cancel`, { method: "PATCH", body: payload });
    setUpcomingSessions((current) => current.filter((item) => item._id !== id));
    setSessionHistory((current) => [cancelled, ...current]);
    showNotice("Session cancelled");
    return cancelled;
  };

  const deleteSession = async (id) => {
    await apiRequest(`/api/sessions/${id}`, { method: "DELETE" });
    setUpcomingSessions((current) => current.filter((item) => item._id !== id));
    setSessionHistory((current) => current.filter((item) => item._id !== id));
    showNotice("Session deleted");
  };

  if (sessionStatus === "checking") {
    return (
      <main className="center-state">
        <span className="state-icon loading-icon"><Dumbbell size={25} /></span>
        <h1>Loading your training space</h1>
        <p>Bringing your workouts and exercise library together.</p>
      </main>
    );
  }

  if (sessionStatus === "unavailable") {
    return (
      <main className="center-state">
        <span className="state-icon error-icon"><WifiOff size={25} /></span>
        <h1>We could not reach the API</h1>
        <p>Make sure the backend is running on port 3000, then try again.</p>
        <button className="primary-button" type="button" onClick={() => {
          setSessionStatus("checking");
          loadAccountData();
        }}>
          <RefreshCw size={17} /> Retry connection
        </button>
      </main>
    );
  }

  if (sessionStatus === "anonymous") {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <>
      <Routes>
        <Route element={<AppShell email={email} onLogout={handleLogout} />}>
          <Route index element={<Navigate to="/workouts" replace />} />
          <Route
            path="/workouts"
            element={(
              <WorkoutsPage
                workouts={workouts}
                exercises={exercises}
                onCreate={createWorkout}
                onUpdate={updateWorkout}
                onDelete={deleteWorkout}
              />
            )}
          />
          <Route
            path="/sessions"
            element={(
              <SessionsPage
                workouts={workouts}
                exercises={exercises}
                upcomingSessions={upcomingSessions}
                sessionHistory={sessionHistory}
                onCreate={createSession}
                onStart={startSession}
                onComplete={completeSession}
                onCancel={cancelSession}
                onDelete={deleteSession}
              />
            )}
          />
          <Route path="/exercises" element={<ExercisesPage exercises={exercises} />} />
          <Route path="*" element={<Navigate to="/workouts" replace />} />
        </Route>
      </Routes>
      {notice && <div className="toast" role="status">{notice}</div>}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Application />
    </BrowserRouter>
  );
}

export default App;
