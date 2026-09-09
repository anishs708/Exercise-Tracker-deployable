import { useMemo, useState } from "react";
import { CalendarDays, Dumbbell, Edit3, Plus, Search, Trash2 } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import WorkoutForm from "../components/WorkoutForm";

const getExerciseId = (value) => value && typeof value === "object" ? value._id : value;

function WorkoutsPage({ workouts, exercises, onCreate, onUpdate, onDelete }) {
  const [query, setQuery] = useState("");
  const [editorWorkout, setEditorWorkout] = useState(undefined);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const exerciseMap = useMemo(() => new Map(exercises.map((item) => [item._id, item.name])), [exercises]);
  const filteredWorkouts = workouts.filter((workout) => (
    `${workout.name} ${workout.description}`.toLowerCase().includes(query.toLowerCase())
  ));
  const totalMovements = workouts.reduce((total, workout) => total + workout.exercises.length, 0);
  const totalSets = workouts.reduce((total, workout) => (
    total + workout.exercises.reduce((sum, item) => sum + Number(item.sets || 0), 0)
  ), 0);

  const openCreate = () => {
    setEditorWorkout(undefined);
    setEditorOpen(true);
  };

  const openEdit = (workout) => {
    setEditorWorkout(workout);
    setEditorOpen(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(deleteTarget._id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Training plans</p>
          <h1>Workouts</h1>
          <p>Build repeatable sessions from your exercise library.</p>
        </div>
        <button className="primary-button" type="button" onClick={openCreate}>
          <Plus size={18} /> New workout
        </button>
      </header>

      <section className="summary-strip" aria-label="Workout summary">
        <div><span>Plans</span><strong>{workouts.length}</strong></div>
        <div><span>Movements</span><strong>{totalMovements}</strong></div>
        <div><span>Planned sets</span><strong>{totalSets}</strong></div>
      </section>

      <div className="list-toolbar">
        <label className="search-field">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search workouts" aria-label="Search workouts" />
        </label>
        <span className="result-count">{filteredWorkouts.length} {filteredWorkouts.length === 1 ? "plan" : "plans"}</span>
      </div>

      {filteredWorkouts.length ? (
        <div className="workout-list">
          {filteredWorkouts.map((workout) => (
            <article className="workout-card" key={workout._id}>
              <div className="workout-card-main">
                <div className="workout-title-row">
                  <span className="workout-mark"><Dumbbell size={20} /></span>
                  <div>
                    <h2>{workout.name}</h2>
                    <p>{workout.description}</p>
                  </div>
                </div>

                <div className="movement-list">
                  {workout.exercises.map((item, index) => (
                    <div className="movement-item" key={item._id || `${workout._id}-${index}`}>
                      <span>{exerciseMap.get(getExerciseId(item.exercise)) || "Unknown exercise"}</span>
                      <small>{item.sets} sets · {item.reps} reps</small>
                    </div>
                  ))}
                </div>
              </div>

              <footer className="workout-card-footer">
                <span><CalendarDays size={15} /> {new Date(workout.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                <div className="row-actions">
                  <button className="icon-button" type="button" onClick={() => openEdit(workout)} title="Edit workout" aria-label={`Edit ${workout.name}`}><Edit3 size={18} /></button>
                  <button className="icon-button danger-icon" type="button" onClick={() => setDeleteTarget(workout)} title="Delete workout" aria-label={`Delete ${workout.name}`}><Trash2 size={18} /></button>
                </div>
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <span className="state-icon"><Dumbbell size={25} /></span>
          <h2>{workouts.length ? "No matching workouts" : "Create your first workout"}</h2>
          <p>{workouts.length ? "Try a different search term." : "Choose exercises, set your targets, and keep the plan ready for training day."}</p>
          {!workouts.length && <button className="primary-button" type="button" onClick={openCreate}><Plus size={18} /> New workout</button>}
        </section>
      )}

      {editorOpen && (
        <WorkoutForm
          workout={editorWorkout}
          exercises={exercises}
          onClose={() => setEditorOpen(false)}
          onSave={(payload) => editorWorkout ? onUpdate(editorWorkout._id, payload) : onCreate(payload)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={`Delete ${deleteTarget.name}?`}
          message="This removes the workout plan permanently. Your exercise library will not be affected."
          busy={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default WorkoutsPage;
