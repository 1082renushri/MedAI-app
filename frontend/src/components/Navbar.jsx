import "./Navbar.css";

export default function Navbar({ onNavigate }) {
  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <span className="nav-title">MedAI App</span>
      </div>

      {/* CENTER */}
      <div className="nav-center">
        <span onClick={() => onNavigate("home")}>Analyze</span>
        <span onClick={() => onNavigate("results")}>Results</span>
        <span>Report</span>
      </div>

      {/* RIGHT SPACER */}
      <div className="nav-right"></div>
    </nav>
  );
}
