import { CalendarPlus, X } from "lucide-react";
import { useMemo, useState } from "react";

const getDefaultDateTime = () => {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

function ScheduleSessionForm({ workouts, onClose, onSave }) {
  const [form, setForm] = useState({
    workout: workouts[0]?._id || "",
    scheduledAt: getDefaultDateTime(),
    comments: ""
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedWorkout = useMemo(
    () => workouts.find((workout) => workout._id === form.workout),
    [form.workout, workouts]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const scheduledDate = new Date(form.scheduledAt);
    if (!form.workout || Number.isNaN(scheduledDate.getTime())) {
      setError("Choose a workout and a valid date and time.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        workout: form.workout,
        scheduledAt: scheduledDate.toISOString(),
        comments: form.comments.trim()
      });
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal workout-modal schedule-modal" role="dialog" aria-modal="true" aria-labelledby="schedule-session-title">
        <header className="modal-header">
          <div>
            <p className="eyebrow">Training calendar</p>
            <h2 id="schedule-session-title">Schedule workout</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} title="Close" aria-label="Close schedule form">
            <X size={20} />
          </button>
        </header>

        <form className="workout-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Workout plan
              <select value={form.workout} onChange={(event) => setForm({ ...form, workout: event.target.value })} required>
                <option value="">Choose a workout</option>
                {workouts.map((workout) => (
                  <option key={workout._id} value={workout._id}>{workout.name}</option>
                ))}
              </select>
            </label>
            <label>
              Date and time
              <input type="datetime-local" value={form.scheduledAt} onChange={(event) => setForm({ ...form, scheduledAt: event.target.value })} required />
            </label>
          </div>

          {selectedWorkout && (
            <div className="schedule-plan-preview">
              <span className="workout-mark"><CalendarPlus size={19} /></span>
              <div>
                <strong>{selectedWorkout.name}</strong>
                <p>{selectedWorkout.exercises.length} {selectedWorkout.exercises.length === 1 ? "exercise" : "exercises"} will be copied into this session.</p>
              </div>
            </div>
          )}

          <label className="modal-field">
            Comments <span>Optional</span>
            <textarea value={form.comments} onChange={(event) => setForm({ ...form, comments: event.target.value })} placeholder="Focus, reminders, or training notes" rows="3" />
          </label>

          {error && <div className="form-error" role="alert">{error}</div>}

          <footer className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
            <button className="primary-button" type="submit" disabled={saving}>{saving ? "Scheduling" : "Schedule workout"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default ScheduleSessionForm;
