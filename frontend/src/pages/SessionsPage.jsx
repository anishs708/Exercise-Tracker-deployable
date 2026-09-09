import { useMemo, useState } from "react";
import {
  Ban,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  History,
  Play,
  Trash2
} from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import ScheduleSessionForm from "../components/ScheduleSessionForm";
import SessionLogger from "../components/SessionLogger";

const formatSessionDate = (dateValue) => new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
}).format(new Date(dateValue));

const getExerciseName = (exercise, exerciseMap) => {
  if (exercise && typeof exercise === "object") return exercise.name;
  return exerciseMap.get(exercise) || "Unknown exercise";
};

const statusLabel = {
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled"
};

function SessionsPage({
  workouts,
  exercises,
  upcomingSessions,
  sessionHistory,
  onCreate,
  onStart,
  onComplete,
  onCancel,
  onDelete
}) {
  const [view, setView] = useState("upcoming");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [loggerSession, setLoggerSession] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");

  const exerciseMap = useMemo(() => new Map(exercises.map((item) => [item._id, item.name])), [exercises]);
  const sessions = view === "upcoming" ? upcomingSessions : sessionHistory;

  const handleStart = async (session) => {
    setWorkingId(session._id);
    setError("");
    try {
      const started = await onStart(session._id);
      setLoggerSession(started);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorkingId("");
    }
  };

  const handleCancel = async () => {
    setWorkingId(cancelTarget._id);
    setError("");
    try {
      await onCancel(cancelTarget._id, { comments: cancelTarget.comments || "" });
      setCancelTarget(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorkingId("");
    }
  };

  const handleDelete = async () => {
    setWorkingId(deleteTarget._id);
    setError("");
    try {
      await onDelete(deleteTarget._id);
      setDeleteTarget(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorkingId("");
    }
  };

  const getCompletedSets = (session) => session.exercises.reduce(
    (total, exercise) => total + exercise.sets.filter((set) => set.completed).length,
    0
  );

  const getTotalSets = (session) => session.exercises.reduce(
    (total, exercise) => total + exercise.sets.length,
    0
  );

  return (
    <div className="page-shell sessions-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Training schedule</p>
          <h1>Sessions</h1>
          <p>Schedule a plan, log each set, and keep a record of completed training.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setScheduleOpen(true)} disabled={!workouts.length} title={!workouts.length ? "Create a workout plan first" : undefined}>
          <CalendarPlus size={18} /> Schedule workout
        </button>
      </header>

      <section className="summary-strip session-summary" aria-label="Session summary">
        <div><span>Upcoming</span><strong>{upcomingSessions.filter((session) => session.status === "scheduled").length}</strong></div>
        <div><span>In progress</span><strong>{upcomingSessions.filter((session) => session.status === "in_progress").length}</strong></div>
        <div><span>Completed</span><strong>{sessionHistory.filter((session) => session.status === "completed").length}</strong></div>
      </section>

      <div className="session-toolbar">
        <div className="view-tabs" aria-label="Session view">
          <button type="button" className={view === "upcoming" ? "active" : ""} onClick={() => setView("upcoming")}>
            <Clock3 size={17} /> Upcoming <span>{upcomingSessions.length}</span>
          </button>
          <button type="button" className={view === "history" ? "active" : ""} onClick={() => setView("history")}>
            <History size={17} /> History <span>{sessionHistory.length}</span>
          </button>
        </div>
      </div>

      {error && <div className="form-error page-error" role="alert">{error}</div>}

      {sessions.length ? (
        <div className="session-list">
          {sessions.map((session) => {
            const completedSets = getCompletedSets(session);
            const totalSets = getTotalSets(session);
            const overdue = session.status === "scheduled" && new Date(session.scheduledAt) < new Date();

            return (
              <article className={`session-card ${session.status}`} key={session._id}>
                <header className="session-card-header">
                  <div className="session-title">
                    <span className="session-date-mark"><CalendarClock size={20} /></span>
                    <div>
                      <div className="session-name-row">
                        <h2>{session.workoutName}</h2>
                        <span className={`status-badge ${overdue ? "overdue" : session.status}`}>{overdue ? "Overdue" : statusLabel[session.status]}</span>
                      </div>
                      <p>{formatSessionDate(session.scheduledAt)}</p>
                    </div>
                  </div>
                  <button className="icon-button danger-icon" type="button" onClick={() => setDeleteTarget(session)} title="Delete session" aria-label={`Delete ${session.workoutName} session`}>
                    <Trash2 size={18} />
                  </button>
                </header>

                <div className="session-movements">
                  {session.exercises.map((sessionExercise, index) => {
                    const firstSet = sessionExercise.sets[0];
                    return (
                      <div className="session-movement" key={`${session._id}-${index}`}>
                        <div>
                          <span>{getExerciseName(sessionExercise.exercise, exerciseMap)}</span>
                          {sessionExercise.comments && <p>{sessionExercise.comments}</p>}
                        </div>
                        <small>{sessionExercise.sets.length} sets × {firstSet?.targetReps ?? 0} reps</small>
                      </div>
                    );
                  })}
                </div>

                {(session.comments || session.status === "completed") && (
                  <div className="session-note">
                    {session.status === "completed" && <strong><CheckCircle2 size={16} /> {completedSets}/{totalSets} sets completed</strong>}
                    {session.comments && <p>{session.comments}</p>}
                  </div>
                )}

                {view === "upcoming" && (
                  <footer className="session-card-actions">
                    <button className="secondary-button cancel-session-button" type="button" onClick={() => setCancelTarget(session)} disabled={workingId === session._id}>
                      <Ban size={17} /> Cancel
                    </button>
                    {session.status === "scheduled" ? (
                      <button className="primary-button" type="button" onClick={() => handleStart(session)} disabled={Boolean(workingId)}>
                        <Play size={17} /> {workingId === session._id ? "Starting" : "Start workout"}
                      </button>
                    ) : (
                      <button className="primary-button" type="button" onClick={() => setLoggerSession(session)}>
                        <Play size={17} /> Continue workout
                      </button>
                    )}
                  </footer>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <section className="empty-state session-empty">
          <span className="state-icon">{view === "upcoming" ? <CalendarClock size={25} /> : <History size={25} />}</span>
          <h2>{view === "upcoming" ? "No sessions scheduled" : "No workout history yet"}</h2>
          <p>{view === "upcoming" ? "Choose one of your workout plans and put it on the calendar." : "Completed and cancelled sessions will appear here."}</p>
          {view === "upcoming" && workouts.length > 0 && (
            <button className="primary-button" type="button" onClick={() => setScheduleOpen(true)}><CalendarPlus size={18} /> Schedule workout</button>
          )}
        </section>
      )}

      {scheduleOpen && <ScheduleSessionForm workouts={workouts} onClose={() => setScheduleOpen(false)} onSave={onCreate} />}

      {loggerSession && (
        <SessionLogger
          session={loggerSession}
          exercises={exercises}
          onClose={() => setLoggerSession(null)}
          onComplete={onComplete}
        />
      )}

      {cancelTarget && (
        <ConfirmDialog
          title={`Cancel ${cancelTarget.workoutName}?`}
          message="This moves the session to your history as cancelled. No completed-set data will be recorded."
          busy={workingId === cancelTarget._id}
          confirmLabel="Cancel session"
          busyLabel="Cancelling"
          onCancel={() => setCancelTarget(null)}
          onConfirm={handleCancel}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={`Delete ${deleteTarget.workoutName}?`}
          message="This permanently removes the session and any set results stored in it."
          busy={workingId === deleteTarget._id}
          confirmLabel="Delete session"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default SessionsPage;
