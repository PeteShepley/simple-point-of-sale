import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <main>
      <h1>Simple Point of Sale</h1>
      <p>Welcome! Choose where to start:</p>
      <nav aria-label="Main navigation">
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>
            <Link to="/menus">View Menus</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}

export default LandingPage;
