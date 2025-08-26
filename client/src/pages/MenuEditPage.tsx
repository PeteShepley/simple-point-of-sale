import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  createMenuItem,
  deleteMenuItem,
  getMenu,
  selectItemsByMenuId,
  selectMenuById,
  selectMenuError,
  selectMenuLoading,
  updateMenuItem,
} from "../features/menu/menuSlice";

function centsToDollars(cents: number | undefined): string {
  if (typeof cents !== "number" || Number.isNaN(cents)) return "";
  return (cents / 100).toFixed(2);
}

function dollarsToCents(input: string): number | undefined {
  const n = Number(input);
  if (!Number.isFinite(n)) return undefined;
  return Math.round(n * 100);
}

export default function MenuEditPage() {
  const { id } = useParams();
  const menuId = Number(id);
  const dispatch = useAppDispatch();
  const menu = useAppSelector(selectMenuById(menuId));
  const items = useAppSelector(selectItemsByMenuId(menuId));
  const loading = useAppSelector(selectMenuLoading);
  const error = useAppSelector(selectMenuError);

  // Local UI state for editing specific item rows
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; price: string }>({
    name: "",
    description: "",
    price: "",
  });

  const isValidMenuId = useMemo(() => Number.isFinite(menuId) && menuId > 0, [menuId]);

  useEffect(() => {
    if (!isValidMenuId) return;
    // Ensure we have menu and its items
    if (!menu || !menu.items) {
      void dispatch(getMenu({ menuId, include: "all" }));
    }
  }, [dispatch, isValidMenuId, menuId]);

  if (!isValidMenuId) {
    return (
      <main>
        <p>Invalid menu id.</p>
        <Link to="/menus">Back to Menus</Link>
      </main>
    );
  }

  function startEdit(itemId: number) {
    const it = items.find((x) => x.id === itemId);
    if (!it) return;
    setEditingId(itemId);
    setForm({
      name: it.name,
      description: it.description || "",
      price: centsToDollars(it.costCents),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: "", description: "", price: "" });
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId == null) return;
    const cents = dollarsToCents(form.price);
    if (cents == null) return;
    await dispatch(
      updateMenuItem({ menuId, id: editingId, body: { name: form.name, description: form.description || undefined, costCents: cents } }),
    );
    cancelEdit();
  }

  async function removeItem(itemId: number) {
    await dispatch(deleteMenuItem({ menuId, id: itemId }));
  }

  // Add new item state
  const [newItem, setNewItem] = useState<{ name: string; description: string; price: string }>({
    name: "",
    description: "",
    price: "",
  });

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const cents = dollarsToCents(newItem.price);
    if (cents == null) return;
    await dispatch(
      createMenuItem({ menuId, name: newItem.name.trim(), description: newItem.description || undefined, costCents: cents }),
    );
    setNewItem({ name: "", description: "", price: "" });
    // ensure menu refreshed if needed
    if (!menu) void dispatch(getMenu({ menuId, include: "all" }));
  }

  return (
    <main>
      <h1>Edit Menu Items {menu ? `— ${menu.name}` : ""}</h1>
      {loading && <p>Loading…</p>}
      {error && (
        <p role="alert" style={{ color: "crimson" }}>
          {error}
        </p>
      )}

      <p>
        <Link to={`/menus/${menuId}`}>Back to Menu</Link>
      </p>

      <section>
        <h2>Existing Items</h2>
        {items && items.length > 0 ? (
          <ul style={{ padding: 0, listStyle: "none", textAlign: "left" }}>
            {items.map((it) => (
              <li key={it.id} style={{ marginBottom: "0.75rem", borderBottom: "1px solid #eee", paddingBottom: "0.75rem" }}>
                {editingId === it.id ? (
                  <form onSubmit={submitEdit} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 140px auto auto", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      placeholder="Name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                    <input
                      placeholder="Description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                    <input
                      placeholder="Price ($)"
                      inputMode="decimal"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                    <button type="submit" disabled={loading}>Save</button>
                    <button type="button" onClick={cancelEdit}>Cancel</button>
                  </form>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 140px auto auto", gap: "0.5rem", alignItems: "center" }}>
                    <div>
                      <strong>{it.name}</strong>
                    </div>
                    <div>{it.description}</div>
                    <div>${centsToDollars(it.costCents)}</div>
                    <button onClick={() => startEdit(it.id)}>Edit</button>
                    <button onClick={() => removeItem(it.id)}>Delete</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No items yet.</p>
        )}
      </section>

      <section>
        <h2>Add New Item</h2>
        <form onSubmit={addItem} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 140px auto", gap: "0.5rem", maxWidth: 800, margin: "0 auto" }}>
          <input
            placeholder="Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            required
          />
          <input
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          />
          <input
            placeholder="Price ($)"
            inputMode="decimal"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            required
          />
          <button type="submit" disabled={loading}>Add Item</button>
        </form>
      </section>
    </main>
  );
}
