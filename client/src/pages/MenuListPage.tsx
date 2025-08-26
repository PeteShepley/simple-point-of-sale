import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchMenus,
  selectMenuError,
  selectMenuLoading,
  selectMenus,
} from "../features/menu/menuSlice";

export function MenuListPage() {
  const dispatch = useAppDispatch();
  const menus = useAppSelector(selectMenus);
  const loading = useAppSelector(selectMenuLoading);
  const error = useAppSelector(selectMenuError);

  useEffect(() => {
    // Always refresh menus when the list page mounts so state is up-to-date after operations like delete
    void dispatch(fetchMenus());
  }, [dispatch]);

  return (
    <main>
      <h1>Menus</h1>
      {loading && <p>Loading…</p>}
      {error && (
        <p role="alert" style={{ color: "crimson" }}>
          {error}
        </p>
      )}
      <ul>
        {menus.map((m) => (
          <li key={m.id}>
            <Link to={`/menus/${m.id}`}>{m.name}</Link>
          </li>
        ))}
      </ul>
      <p>
        <Link to="/menus/new">Create New Menu</Link>
      </p>
      <p>
        <Link to="/">Back to Home</Link>
      </p>
    </main>
  );
}

export default MenuListPage;
