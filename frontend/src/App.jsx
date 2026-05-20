import { Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import CubeInput from './components/CubeInput';
import Historial from './components/Historial';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/input-cubo" element={<CubeInput />} />
      <Route path="/historial" element={<Historial />} />
    </Routes>
  );
}

export default App;