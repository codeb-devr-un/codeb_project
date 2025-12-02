
import * as React from "react";
import AdminLayout from "./components/admin/AdminLayout";
import { Dashboard } from "./components/admin/Dashboard";
import { MyTasks } from "./components/admin/MyTasks";
import { Projects } from "./components/admin/Projects";
import { HR } from "./components/admin/HR";
import { Organization } from "./components/admin/Organization";
import { Card, CardContent } from "./components/ui/card";
import { Construction } from "lucide-react";

export default function App() {
  const [page, setPage] = React.useState("dashboard");
  const [isDockMode, setIsDockMode] = React.useState(false);

  const renderPage = () => {
    switch(page) {
      case "dashboard": return <Dashboard />;
      case "tasks": return <MyTasks />;
      case "projects": return <Projects />;
      case "hr": return <HR />;
      case "organization": return <Organization />;
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <div className="p-4 rounded-full bg-lime-100 text-lime-600 mb-4">
                <Construction className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">페이지 준비 중</h2>
            <p className="text-slate-500 text-center max-w-md">
                해당 페이지는 아직 개발 중입니다.<br/>
                대시보드, 내 작업, 또는 프로젝트 메뉴를 이용해주세요.
            </p>
        </div>
      );
    }
  };

  return (
    <AdminLayout 
        currentPage={page} 
        onNavigate={setPage} 
        isDockMode={isDockMode} 
        onDockModeToggle={() => setIsDockMode(!isDockMode)}
    >
        {renderPage()}
    </AdminLayout>
  );
}
