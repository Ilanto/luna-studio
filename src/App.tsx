import { Route, Routes } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { MobileNav } from "./components/MobileNav";
import { Dashboard } from "./pages/Dashboard";
import { PromptLibrary } from "./pages/PromptLibrary";
import { PromptEditor } from "./pages/PromptEditor";
import { CharacterProfiles } from "./pages/CharacterProfiles";
import { PromptBuilder } from "./pages/PromptBuilder";
import { ResultGallery } from "./pages/ResultGallery";
import { Settings } from "./pages/Settings";

const WithTopbar = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-1 flex-col">
    <Topbar />
    {children}
  </div>
);

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex flex-1 flex-col">
        <Routes>
          <Route
            path="/"
            element={
              <WithTopbar>
                <div className="px-6 pb-28 pt-6 sm:px-8">
                  <Dashboard />
                </div>
              </WithTopbar>
            }
          />
          <Route path="/library" element={<PromptLibrary />} />
          <Route path="/editor" element={<PromptEditor />} />
          <Route path="/editor/:id" element={<PromptEditor />} />
          <Route path="/characters" element={<WithTopbar><CharacterProfiles /></WithTopbar>} />
          <Route path="/builder" element={<WithTopbar><PromptBuilder /></WithTopbar>} />
          <Route path="/results" element={<WithTopbar><ResultGallery /></WithTopbar>} />
          <Route path="/settings" element={<WithTopbar><Settings /></WithTopbar>} />
        </Routes>
      </main>
      <MobileNav />
    </div>
  );
}
