import HomePage from "../pages/HomePage";
import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <Routes>
      <Route index element={<HomePage />} />
    </Routes>
  );
};

export default App;
