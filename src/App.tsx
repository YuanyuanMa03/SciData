import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AboutPage } from "./pages/AboutPage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { DatasetPage } from "./pages/DatasetPage";
import { DisciplinesPage } from "./pages/DisciplinesPage";
import { ExplorePage } from "./pages/ExplorePage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="dataset/:id" element={<DatasetPage />} />
        <Route path="disciplines" element={<DisciplinesPage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
