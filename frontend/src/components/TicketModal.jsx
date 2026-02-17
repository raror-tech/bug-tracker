import { useState } from "react";
import api from "../api/axios";
import CommentSection from "./CommentSection";
import { getCurrentUser } from "../utils/auth";

export default function TicketModal({ ticket, onClose }) {
  const user = getCurrentUser();
  const [loading, setLoading] = useState(false);

  const isDeveloper = user?.role === "developer";
  const isAdmin = user?.role === "admin";

  const assignToMe = async () => {
    if (!user) return;

    setLoading(true);

    try {
      await api.patch(`/tickets/${ticket.id}`, {
        assignee_id: user.id
      });

      alert("Assigned to you");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Not allowed to assign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white w-2/3 p-6 rounded-lg shadow-lg relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-500 text-lg"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold mb-2">
          {ticket.title}
        </h2>

        {/* Status + Priority */}
        <div className="flex gap-3 mb-3 text-sm">
          <span className="px-2 py-1 bg-gray-200 rounded capitalize">
            {ticket.status}
          </span>

          <span className="px-2 py-1 bg-yellow-200 rounded capitalize">
            {ticket.priority}
          </span>
        </div>

        {/* Assignee Info */}
        <div className="mb-4 text-sm">
          <strong>Assignee:</strong>{" "}
          {ticket.assignee
            ? ticket.assignee.email
            : "Unassigned"}
        </div>

        {/* 🔥 Assign to Me Button (Developer Only + Unassigned) */}
        {isDeveloper && !ticket.assignee && (
          <button
            onClick={assignToMe}
            disabled={loading}
            className="mb-4 bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            {loading ? "Assigning..." : "Assign to Me"}
          </button>
        )}

        {/* Description */}
        <p className="mb-4">{ticket.description}</p>

        {/* Comments */}
        <CommentSection ticketId={ticket.id} />

      </div>
    </div>
  );
}
