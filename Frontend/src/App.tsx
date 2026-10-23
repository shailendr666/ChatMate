import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-14">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
