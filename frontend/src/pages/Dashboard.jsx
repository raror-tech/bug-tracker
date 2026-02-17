import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  // 🔹 Get first project automatically
  useEffect(() => {
    const loadProject = async () => {
      try {
        const res = await api.get("/projects/my");
        if (res.data.length > 0) {
          setActiveProject(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadProject();
  }, []);

  // 🔹 Load tickets for active project
  useEffect(() => {
    if (!activeProject) return;

    const loadTickets = async () => {
      try {
        const res = await api.get(
          `/tickets/projects/${activeProject}`
        );
        setTickets(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadTickets();
  }, [activeProject]);

  // 🔹 Calculate progress
  const total = tickets.length;
  const completed = tickets.filter(
    (t) => t.status === "done"
  ).length;

  const progress =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="h-screen flex flex-col bg-[#F4F5F7]">
      {/* NAVBAR */}
      <Navbar />

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 bg-[#EBECF0] border-r p-4">
          <Sidebar activeProject={activeProject} />
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* DASHBOARD WIDGETS */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded shadow-sm p-4">
              <h2 className="font-semibold mb-4">
                Issue Type Overview
              </h2>
              <div className="h-64 flex items-center justify-center text-gray-400">
                {total === 0
                  ? "No tickets yet"
                  : `Total Tickets: ${total}`}
              </div>
            </div>

            <div className="bg-white rounded shadow-sm p-4">
              <h2 className="font-semibold mb-4">
                Sprint Health
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                Overall progress
              </p>
              <div className="w-full h-3 bg-gray-200 rounded">
                <div
                  className="h-3 bg-green-500 rounded"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {progress}% completed
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded shadow-sm p-4">
              <h2 className="font-semibold mb-4">
                Activity Stream
              </h2>
              <ul className="space-y-2 text-sm">
                {tickets.slice(0, 3).map((t) => (
                  <li key={t.id}>
                    ✔ {t.title} updated
                  </li>
                ))}
                {tickets.length === 0 && (
                  <li className="text-gray-400">
                    No activity yet
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-white rounded shadow-sm p-4">
              <h2 className="font-semibold mb-4">
                Assigned to Me
              </h2>
              <ul className="space-y-2 text-sm">
                {tickets.slice(0, 3).map((t) => (
                  <li key={t.id}>
                    • {t.title}
                  </li>
                ))}
                {tickets.length === 0 && (
                  <li className="text-gray-400">
                    No assigned tickets
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* 🔥 CHILD ROUTES RENDER HERE */}
          <div className="bg-white rounded shadow-sm p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
