import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/layouts/main-layout';

export function App() {
  return (
    <Routes>
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  );
}
