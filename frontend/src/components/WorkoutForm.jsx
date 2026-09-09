import { useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

const blankExercise = () => ({ exercise: "", sets: 3, reps: 10 });

const normalizeExerciseId = (value) => {
  if (value && typeof value === "object") return value._id;
  return value || "";
};

function WorkoutForm({ workout, exercises, onClose, onSave }) {
  const initialValues = useMemo(() => ({
    name: workout?.name || "",
    description: workout?.description || "",
    exercises: workout?.exercises?.length
      ? workout.exercises.map((item) => ({
          exercise: normalizeExerciseId(item.exercise),
          sets: item.sets ?? 3,
          reps: item.reps ?? 10
        }))
      : [blankExercise()]
  }), [workout]);

  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateExercise = (index, field, value) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      ))
    }));
  };

  const removeExercise = (index) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.exercises.length || form.exercises.some((item) => !item.exercise)) {
      setError("Choose at least one exercise for this workout.");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      exercises: form.exercises.map((item) => ({
        exercise: item.exercise,
        sets: Number(item.sets),
        reps: Number(item.reps)
      }))
    };

    try {
      await onSave(payload);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal workout-modal" role="dialog" aria-modal="true" aria-labelledby="workout-form-title">
        <header className="modal-header">
          <div>
            <p className="eyebrow">Workout plan</p>
            <h2 id="workout-form-title">{workout ? "Edit workout" : "Create workout"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} title="Close" aria-label="Close workout form">
            <X size={20} />
          </button>
        </header>

        <form className="workout-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Workout name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Upper body strength" required />
            </label>
            <label>
              Description
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Main strength session for the week" rows="3" required />
            </label>
          </div>

          <div className="exercise-builder-heading">
            <div>
              <h3>Exercises</h3>
              <p>Set the target work for each movement.</p>
            </div>
            <button className="secondary-button" type="button" onClick={() => setForm((current) => ({ ...current, exercises: [...current.exercises, blankExercise()] }))}>
              <Plus size={17} /> Add exercise
            </button>
          </div>

          <div className="exercise-builder">
            {form.exercises.map((item, index) => (
              <div className="exercise-form-row" key={`${index}-${item.exercise}`}>
                <span className="exercise-order">{index + 1}</span>
                <label className="exercise-select">
                  Exercise
                  <select value={item.exercise} onChange={(event) => updateExercise(index, "exercise", event.target.value)} required>
                    <option value="">Choose an exercise</option>
                    {exercises.map((exercise) => <option key={exercise._id} value={exercise._id}>{exercise.name}</option>)}
                  </select>
                </label>
                <label>Sets<input type="number" min="1" value={item.sets} onChange={(event) => updateExercise(index, "sets", event.target.value)} required /></label>
                <label>Reps<input type="number" min="1" value={item.reps} onChange={(event) => updateExercise(index, "reps", event.target.value)} required /></label>
                <button className="icon-button danger-icon" type="button" onClick={() => removeExercise(index)} title="Remove exercise" aria-label={`Remove exercise ${index + 1}`} disabled={form.exercises.length === 1}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}

          <footer className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
            <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving" : workout ? "Save changes" : "Create workout"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default WorkoutForm;
