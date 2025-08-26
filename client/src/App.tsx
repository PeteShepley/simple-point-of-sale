import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MenuListPage from "./pages/MenuListPage";
import MenuDetailPage from "./pages/MenuDetailPage";
import MenuEditPage from "./pages/MenuEditPage";
import NewMenuPage from "./pages/NewMenuPage";

export function App() {
  return (
    <div>
      <header style={{ marginBottom: "1rem" }}>
        <nav>
          <Link to="/">Home</Link>
          {" | "}
          <Link to="/menus">Menus</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/menus" element={<MenuListPage />} />
        <Route path="/menus/new" element={<NewMenuPage />} />
        <Route path="/menus/:id" element={<MenuDetailPage />} />
        <Route path="/menus/:id/edit" element={<MenuEditPage />} />
      </Routes>
    </div>
  );
}

export default App;
