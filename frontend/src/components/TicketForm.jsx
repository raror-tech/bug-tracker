import { useState, useEffect } from "react";
import api from "../api/axios";
import { getCurrentUser } from "../utils/auth";

const TicketForm = ({ projectId, onCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [type, setType] = useState("task");
  const [assigneeId, setAssigneeId] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = getCurrentUser();
  const isAdmin = user?.role === "admin";

  // 🔥 Fetch project members (only if admin)
  useEffect(() => {
    if (!projectId || !isAdmin) return;

    api.get(`/projects/${projectId}/members`)
      .then((res) => {
        setMembers(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load members", err);
      });
  }, [projectId, isAdmin]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/tickets/projects/${projectId}`, {
        title,
        description,
        priority,
        type,
        assignee_id: isAdmin && assigneeId ? Number(assigneeId) : null,
      });

      setTitle("");
      setDescription("");
      setAssigneeId("");
      onCreated();
    } catch (err) {
      console.error(err);
      alert("Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="p-4 border rounded bg-gray-50"
    >
      <h2 className="font-semibold mb-3">Create Ticket</h2>

      <input
        className="w-full border p-2 mb-2"
        placeholder="Ticket title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="w-full border p-2 mb-2"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex gap-2 mb-3">
        <select
          className="border p-2"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          className="border p-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="task">Task</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
        </select>
      </div>

      {/* 🔐 Show assignee dropdown ONLY for admin */}
      {isAdmin && (
        <select
          className="w-full border p-2 mb-3"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.email} ({m.role})
            </option>
          ))}
        </select>
      )}

      <button
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Ticket"}
      </button>
    </form>
  );
};

export default TicketForm;
