import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createMenu, selectMenuError, selectMenuLoading } from "../features/menu/menuSlice";

export default function NewMenuPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector(selectMenuLoading);
  const error = useAppSelector(selectMenuError);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await dispatch(
      createMenu({ name: name.trim(), description: description || undefined }) as any,
    );
    // Result may be a fulfilled action with payload containing id
    const payload: any = (result as any).payload;
    if (payload && typeof payload.id === "number") {
      navigate(`/menus/${payload.id}/edit`);
    }
  }

  return (
    <main>
      <h1>Create New Menu</h1>
      {error && (
        <p role="alert" style={{ color: "crimson" }}>
          {error}
        </p>
      )}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.75rem", maxWidth: 520, margin: "0 auto", textAlign: "left" }}>
        <label>
          <div>Name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Dinner Menu"
            required
          />
        </label>
        <label>
          <div>Description (optional)</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this menu"
            rows={3}
          />
        </label>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button type="submit" disabled={loading || !name.trim()}>
            {loading ? "Creating…" : "Create Menu"}
          </button>
          <Link to="/menus">Cancel</Link>
        </div>
      </form>
    </main>
  );
}
