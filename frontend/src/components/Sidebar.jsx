import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/axios";
import CreateProjectModal from "./CreateProjectModal";
import AddMemberModal from "./AddMemberModal";

const Sidebar = ({ activeProject }) => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [memberProjectId, setMemberProjectId] = useState(null);
  const location = useLocation();

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects/my");
      setProjects(res.data || []);
    } catch (err) {
      console.error("PROJECTS ERROR:", err);
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-4 text-sm space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="uppercase text-xs text-gray-500">
          Projects
        </h3>

        <button
          onClick={() => setShowModal(true)}
          className="text-blue-600 text-xs font-semibold hover:underline"
        >
          + New
        </button>
      </div>

      {projects.length === 0 && (
        <p className="text-gray-400">No projects</p>
      )}

      {projects.map((p) => (
        <div key={p.id} className="space-y-1">
          {/* Project Name */}
          <div
            className={`px-3 py-2 rounded font-medium flex justify-between items-center ${
              activeProject === p.id
                ? "bg-gray-300"
                : "hover:bg-gray-200"
            }`}
          >
            <span>{p.name}</span>

            {/* Add Member Button */}
            <button
              onClick={() => setMemberProjectId(p.id)}
              className="text-xs text-blue-600 hover:underline"
            >
              + Member
            </button>
          </div>

          {/* Navigation Links */}
          <div className="ml-4 space-y-1 text-gray-600">
            <Link
              to={`/tickets/${p.id}`}
              className={`block px-2 py-1 rounded ${
                location.pathname.includes(`/tickets/${p.id}`)
                  ? "bg-gray-300"
                  : "hover:bg-gray-200"
              }`}
            >
              Tickets
            </Link>

            <Link
              to={`/kanban/${p.id}`}
              className={`block px-2 py-1 rounded ${
                location.pathname.includes(`/kanban/${p.id}`)
                  ? "bg-gray-300"
                  : "hover:bg-gray-200"
              }`}
            >
              Kanban Board
            </Link>
          </div>
        </div>
      ))}

      {/* Create Project Modal */}
      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={fetchProjects}
        />
      )}

      {/* Add Member Modal */}
      {memberProjectId && (
        <AddMemberModal
          projectId={memberProjectId}
          onClose={() => setMemberProjectId(null)}
        />
      )}
    </div>
  );
};

export default Sidebar;
