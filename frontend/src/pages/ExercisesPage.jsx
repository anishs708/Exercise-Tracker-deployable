import { useMemo, useState } from "react";
import { Activity, Dumbbell, Move, Search } from "lucide-react";

const categories = ["all", "strength", "cardio", "flexibility", "mobility"];

function CategoryIcon({ category }) {
  if (category === "cardio") return <Activity size={18} />;
  if (category === "flexibility" || category === "mobility") return <Move size={18} />;
  return <Dumbbell size={18} />;
}

function ExercisesPage({ exercises }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filteredExercises = useMemo(() => exercises.filter((exercise) => {
    const searchText = `${exercise.name} ${exercise.description} ${exercise.muscleGroup.join(" ")}`.toLowerCase();
    const matchesSearch = searchText.includes(query.toLowerCase());
    const matchesCategory = category === "all" || exercise.category === category;
    return matchesSearch && matchesCategory;
  }), [category, exercises, query]);

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Movement library</p>
          <h1>Exercises</h1>
          <p>Browse the seeded movements available for workout plans.</p>
        </div>
        <div className="library-count"><strong>{exercises.length}</strong><span>Total exercises</span></div>
      </header>

      <div className="exercise-toolbar">
        <label className="search-field">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or muscle" aria-label="Search exercises" />
        </label>
        <div className="category-control" aria-label="Filter by category">
          {categories.map((item) => (
            <button key={item} type="button" className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>
      </div>

      <div className="exercise-table" role="table" aria-label="Exercise library">
        <div className="exercise-table-head" role="row">
          <span>Exercise</span><span>Category</span><span>Muscle groups</span>
        </div>
        {filteredExercises.map((exercise) => (
          <article className="exercise-table-row" role="row" key={exercise._id}>
            <div className="exercise-name-cell">
              <span className={`category-mark ${exercise.category}`}><CategoryIcon category={exercise.category} /></span>
              <div><h2>{exercise.name}</h2><p>{exercise.description}</p></div>
            </div>
            <div><span className={`category-badge ${exercise.category}`}>{exercise.category}</span></div>
            <div className="muscle-list">{exercise.muscleGroup.map((muscle) => <span key={muscle}>{muscle}</span>)}</div>
          </article>
        ))}
      </div>

      {!filteredExercises.length && (
        <section className="empty-state compact-empty">
          <span className="state-icon"><Search size={24} /></span>
          <h2>No exercises found</h2>
          <p>Adjust the search or choose another category.</p>
        </section>
      )}
    </div>
  );
}

export default ExercisesPage;
