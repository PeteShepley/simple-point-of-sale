import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getMenu,
  deleteMenu,
  fetchMenus,
  selectItemsByMenuId,
  selectMenuById,
  selectMenuError,
  selectMenuLoading,
} from "../features/menu/menuSlice";

export function MenuDetailPage() {
  const { id } = useParams();
  const menuId = Number(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const menu = useAppSelector(selectMenuById(menuId));
  const items = useAppSelector(selectItemsByMenuId(menuId));
  const loading = useAppSelector(selectMenuLoading);
  const error = useAppSelector(selectMenuError);

  useEffect(() => {
    if (!Number.isFinite(menuId)) return;
    if (!menu || !menu.items) {
      void dispatch(getMenu({ menuId, include: "all" }));
    }
  }, [dispatch, menuId]);

  async function onDeleteMenu() {
    if (!Number.isFinite(menuId)) return;
    const name = menu?.name || `Menu #${menuId}`;
    const ok = window.confirm(`Delete menu "${name}"? This will also delete all its items.`);
    if (!ok) return;
    await dispatch(deleteMenu({ menuId }));
    // After deletion, refresh the menus list to ensure UI reflects server state
    await dispatch(fetchMenus());
    navigate("/menus");
  }

  if (!Number.isFinite(menuId)) {
    return (
      <main>
        <p>Invalid menu id.</p>
        <Link to="/menus">Back to Menus</Link>
      </main>
    );
  }

  return (
    <main>
      <h1>{menu ? menu.name : "Menu"}</h1>
      {loading && <p>Loading…</p>}
      {error && (
        <p role="alert" style={{ color: "crimson" }}>
          {error}
        </p>
      )}
      {menu?.description && <p>{menu.description}</p>}
      <h2>Items</h2>
      {items && items.length > 0 ? (
        <ul>
          {items.map((it) => (
            <li key={it.id}>
              <strong>{it.name}</strong>
              {it.description ? ` — ${it.description}` : ""}
              {" "}
              <em>(${(it.costCents / 100).toFixed(2)})</em>
            </li>
          ))}
        </ul>
      ) : (
        <p>No items found.</p>
      )}
      <p>
        <Link to={`/menus/${menuId}/edit`}>Edit Menu Items</Link>
      </p>
      <p>
        <button onClick={onDeleteMenu} disabled={loading} style={{ color: 'white', background: 'crimson', border: 'none', padding: '0.5rem 0.75rem', cursor: 'pointer' }}>
          {loading ? 'Deleting…' : 'Delete Menu'}
        </button>
      </p>
      <p>
        <Link to="/menus">Back to Menus</Link>
      </p>
    </main>
  );
}

export default MenuDetailPage;
