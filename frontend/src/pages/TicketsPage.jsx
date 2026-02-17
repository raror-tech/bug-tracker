import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import TicketForm from "../components/TicketForm";

const TicketsPage = () => {
  const { projectId } = useParams();
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      const res = await api.get(`/tickets/projects/${projectId}`);
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    fetchTickets();
  }, [projectId]);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        Project {projectId} – Tickets
      </h1>

      <div className="mb-6">
        <TicketForm projectId={projectId} onCreated={fetchTickets} />
      </div>

      <ul className="space-y-3">
        {tickets.map((t) => (
          <li
            key={t.id}
            className="bg-white p-4 rounded shadow-sm border"
          >
            <div className="font-semibold">{t.title}</div>
            <div className="text-sm text-gray-600">
              Status: {t.status}
            </div>
          </li>
        ))}

        {tickets.length === 0 && (
          <li className="text-gray-400">
            No tickets found
          </li>
        )}
      </ul>
    </div>
  );
};

export default TicketsPage;
