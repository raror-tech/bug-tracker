import { useEffect, useState } from "react";
import axios from "axios";
import { DndContext } from "@dnd-kit/core";
import { useParams } from "react-router-dom";
import Column from "../components/Column";
import TicketModal from "../components/TicketModal";

export default function Kanban() {
  const { projectId } = useParams();

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // 🔥 Full Filters State
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignee_id: "",
    search: ""
  });

  // 🔥 Fetch Tickets With Filters
  const fetchTickets = async () => {
    if (!projectId) return;

    try {
      const token = localStorage.getItem("token");

      const queryParams = new URLSearchParams();

      if (filters.status) queryParams.append("status", filters.status);
      if (filters.priority) queryParams.append("priority", filters.priority);
      if (filters.assignee_id)
        queryParams.append("assignee_id", filters.assignee_id);
      if (filters.search) queryParams.append("search", filters.search);

      const res = await axios.get(
        `http://localhost:8001/tickets/projects/${projectId}?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setTickets(res.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  // 🔥 Refetch When Filters Change
  useEffect(() => {
    fetchTickets();
  }, [projectId, filters]);

  // 🔥 Group For Kanban Columns
  const grouped = {
    todo: tickets.filter(t => t.status === "todo"),
    in_progress: tickets.filter(t => t.status === "in_progress"),
    done: tickets.filter(t => t.status === "done")
  };

  // 🔥 Drag Logic (Unchanged)
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const ticketId = Number(active.id);
    const newStatus = over.id;

    const oldTicket = tickets.find(t => t.id === ticketId);
    if (!oldTicket || oldTicket.status === newStatus) return;

    const token = localStorage.getItem("token");

    // Optimistic update
    setTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, status: newStatus }
          : ticket
      )
    );

    try {
      await axios.patch(
        `http://localhost:8001/tickets/${ticketId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error("Status update failed:", error);

      // Rollback
      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, status: oldTicket.status }
            : ticket
        )
      );
    }
  };

  return (
    <>
      {/* 🔥 FILTER BAR */}
      <div className="flex flex-wrap gap-4 p-4 bg-white shadow items-center">

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters(prev => ({ ...prev, status: e.target.value }))
          }
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={(e) =>
            setFilters(prev => ({ ...prev, priority: e.target.value }))
          }
          className="border p-2 rounded"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Assignee Filter */}
        <input
          type="number"
          placeholder="Assignee ID"
          value={filters.assignee_id}
          onChange={(e) =>
            setFilters(prev => ({ ...prev, assignee_id: e.target.value }))
          }
          className="border p-2 rounded w-32"
        />

        {/* Search */}
        <input
          type="text"
          placeholder="Search tickets..."
          value={filters.search}
          onChange={(e) =>
            setFilters(prev => ({ ...prev, search: e.target.value }))
          }
          className="border p-2 rounded flex-1"
        />
      </div>

      {/* 🔥 KANBAN BOARD */}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-6 p-6">
          <Column
            id="todo"
            title="Todo"
            tickets={grouped.todo}
            onOpenTicket={setSelectedTicket}
          />
          <Column
            id="in_progress"
            title="In Progress"
            tickets={grouped.in_progress}
            onOpenTicket={setSelectedTicket}
          />
          <Column
            id="done"
            title="Done"
            tickets={grouped.done}
            onOpenTicket={setSelectedTicket}
          />
        </div>
      </DndContext>

      {/* 🔥 TICKET MODAL */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </>
  );
}
