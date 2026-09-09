import { Dumbbell, Scale, X } from "lucide-react";
import { useMemo, useState } from "react";

const getExerciseName = (exercise, exerciseMap) => {
  if (exercise && typeof exercise === "object") return exercise.name;
  return exerciseMap.get(exercise)?.name || "Unknown exercise";
};

const getTrackingType = (sessionExercise, exerciseMap) => {
  if (sessionExercise.trackingType) return sessionExercise.trackingType;
  const exerciseId = typeof sessionExercise.exercise === "object"
    ? sessionExercise.exercise._id
    : sessionExercise.exercise;
  return exerciseMap.get(exerciseId)?.trackingType || "external_weight";
};

function SessionLogger({ session, exercises, onClose, onComplete }) {
  const exerciseMap = useMemo(() => new Map(exercises.map((item) => [item._id, item])), [exercises]);
  const [weightUnit, setWeightUnit] = useState(session.weightUnit || "lb");
  const [results, setResults] = useState(() => session.exercises.map((sessionExercise) => ({
    trackingType: getTrackingType(sessionExercise, exerciseMap),
    bodyWeight: sessionExercise.bodyWeight || 0,
    comments: sessionExercise.comments || "",
    sets: sessionExercise.sets.map((set) => ({
      reps: set.completed ? set.reps : set.targetReps,
      weight: set.weight || 0,
      addedWeight: set.addedWeight || 0,
      completed: set.completed
    }))
  })));
  const [comments, setComments] = useState(session.comments || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const setCount = results.reduce((total, exercise) => total + exercise.sets.length, 0);
  const completedCount = results.reduce(
    (total, exercise) => total + exercise.sets.filter((set) => set.completed).length,
    0
  );

  const updateExercise = (exerciseIndex, field, value) => {
    setResults((current) => current.map((exercise, currentIndex) => (
      currentIndex === exerciseIndex ? { ...exercise, [field]: value } : exercise
    )));
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    setResults((current) => current.map((exercise, currentExerciseIndex) => (
      currentExerciseIndex !== exerciseIndex
        ? exercise
        : {
            ...exercise,
            sets: exercise.sets.map((set, currentSetIndex) => (
              currentSetIndex === setIndex ? { ...set, [field]: value } : set
            ))
          }
    )));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payloadExercises = results.map((exercise) => ({
      bodyWeight: exercise.trackingType === "bodyweight_added" ? Number(exercise.bodyWeight) : 0,
      comments: exercise.comments.trim(),
      sets: exercise.sets.map((set) => ({
        reps: Number(set.reps),
        weight: exercise.trackingType === "external_weight" ? Number(set.weight) : 0,
        addedWeight: exercise.trackingType === "bodyweight_added" ? Number(set.addedWeight) : 0,
        completed: set.completed
      }))
    }));

    const invalidExerciseIndex = payloadExercises.findIndex((exercise, index) => {
      if (results[index].trackingType === "bodyweight_added" && (!Number.isFinite(exercise.bodyWeight) || exercise.bodyWeight <= 0)) return true;
      return exercise.sets.some((set) => (
        !Number.isFinite(set.reps) || set.reps < 0 ||
        !Number.isFinite(set.weight) || set.weight < 0 ||
        !Number.isFinite(set.addedWeight) || set.addedWeight < 0
      ));
    });

    if (invalidExerciseIndex !== -1) {
      const exerciseName = getExerciseName(session.exercises[invalidExerciseIndex].exercise, exerciseMap);
      setError(`${exerciseName} needs valid non-negative values. Body weight must be greater than zero for dips and pull-ups.`);
      return;
    }

    setSaving(true);
    try {
      await onComplete(session._id, {
        weightUnit,
        exercises: payloadExercises,
        comments: comments.trim()
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
      <section className="modal workout-modal session-logger-modal" role="dialog" aria-modal="true" aria-labelledby="session-logger-title">
        <header className="modal-header logger-header">
          <div>
            <p className="eyebrow">In progress</p>
            <h2 id="session-logger-title">{session.workoutName}</h2>
            <p>{completedCount} of {setCount} sets marked complete</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} title="Close" aria-label="Close workout logger">
            <X size={20} />
          </button>
        </header>

        <form className="session-logger-form" onSubmit={handleSubmit}>
          <div className="logger-unit-row">
            <div>
              <Scale size={18} />
              <span>Weight unit</span>
            </div>
            <div className="unit-control" role="group" aria-label="Weight unit">
              <button type="button" className={weightUnit === "lb" ? "active" : ""} onClick={() => setWeightUnit("lb")}>lb</button>
              <button type="button" className={weightUnit === "kg" ? "active" : ""} onClick={() => setWeightUnit("kg")}>kg</button>
            </div>
          </div>

          <div className="logger-exercises">
            {session.exercises.map((sessionExercise, exerciseIndex) => {
              const exerciseName = getExerciseName(sessionExercise.exercise, exerciseMap);
              const result = results[exerciseIndex];
              const tracksExternalWeight = result.trackingType === "external_weight";
              const tracksAddedWeight = result.trackingType === "bodyweight_added";

              return (
                <section className="logger-exercise" key={`${exerciseIndex}-${exerciseName}`}>
                  <div className="logger-exercise-heading">
                    <span className="workout-mark"><Dumbbell size={18} /></span>
                    <div>
                      <h3>{exerciseName}</h3>
                      <p>
                        {tracksAddedWeight
                          ? "Enter your body weight once, then any added resistance for each set."
                          : tracksExternalWeight
                            ? "Record the external weight used for each set."
                            : "Record reps and mark each completed set."}
                      </p>
                    </div>
                  </div>

                  {tracksAddedWeight && (
                    <label className="bodyweight-field">
                      Body weight ({weightUnit})
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={result.bodyWeight}
                        onChange={(event) => updateExercise(exerciseIndex, "bodyWeight", event.target.value)}
                        required
                      />
                    </label>
                  )}

                  <div className={`set-table ${result.trackingType}`}>
                    <div className="set-table-head">
                      <span>Set</span><span>Target</span><span>Reps</span>
                      {tracksExternalWeight && <span>Weight ({weightUnit})</span>}
                      {tracksAddedWeight && <span>Added ({weightUnit})</span>}
                      <span>Done</span>
                    </div>
                    {sessionExercise.sets.map((targetSet, setIndex) => {
                      const setResult = result.sets[setIndex];
                      return (
                        <div className={setResult.completed ? "set-row completed" : "set-row"} key={`${exerciseIndex}-${setIndex}`}>
                          <strong>{setIndex + 1}</strong>
                          <span>{targetSet.targetReps} reps</span>
                          <input aria-label={`${exerciseName} set ${setIndex + 1} reps`} type="number" min="0" value={setResult.reps} onChange={(event) => updateSet(exerciseIndex, setIndex, "reps", event.target.value)} />
                          {tracksExternalWeight && (
                            <input aria-label={`${exerciseName} set ${setIndex + 1} weight in ${weightUnit}`} type="number" min="0" step="0.5" value={setResult.weight} onChange={(event) => updateSet(exerciseIndex, setIndex, "weight", event.target.value)} />
                          )}
                          {tracksAddedWeight && (
                            <input aria-label={`${exerciseName} set ${setIndex + 1} added weight in ${weightUnit}`} type="number" min="0" step="0.5" value={setResult.addedWeight} onChange={(event) => updateSet(exerciseIndex, setIndex, "addedWeight", event.target.value)} />
                          )}
                          <label className="set-checkbox" title="Mark set complete">
                            <input
                              type="checkbox"
                              checked={setResult.completed}
                              onChange={(event) => updateSet(exerciseIndex, setIndex, "completed", event.target.checked)}
                              aria-label={`Mark ${exerciseName} set ${setIndex + 1} complete`}
                            />
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  <label className="exercise-comment-field">
                    Exercise comment <span>Optional</span>
                    <textarea
                      value={result.comments}
                      onChange={(event) => updateExercise(exerciseIndex, "comments", event.target.value)}
                      placeholder={`Notes about ${exerciseName}`}
                      rows="2"
                    />
                  </label>
                </section>
              );
            })}
          </div>

          <label className="modal-field logger-comments">
            Overall session comment <span>Optional</span>
            <textarea value={comments} onChange={(event) => setComments(event.target.value)} placeholder="How did the workout feel overall?" rows="3" />
          </label>

          {error && <div className="form-error" role="alert">{error}</div>}

          <footer className="modal-actions logger-actions">
            <button className="secondary-button" type="button" onClick={onClose}>Close</button>
            <button className="primary-button" type="submit" disabled={saving}>{saving ? "Completing" : "Complete workout"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default SessionLogger;
