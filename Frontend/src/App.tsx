import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Upload from './pages/Upload';
import Result from './pages/Result';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Upload />} />
            <Route path="/result/:id" element={<Result />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
      <ToastContainer position="bottom-right" theme="light" />
    </BrowserRouter>
  );
}
