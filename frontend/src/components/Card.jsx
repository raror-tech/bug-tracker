import { useDraggable } from "@dnd-kit/core";

export default function Card({ ticket, onOpen }) {
  const { attributes, listeners, setNodeRef, transform } =
    useDraggable({ id: ticket.id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : undefined;

  const handleMouseUp = (e) => {
    e.stopPropagation();
    if (onOpen) {
      onOpen(ticket);
    }
  };

  // 🔹 Priority color
  const priorityColor = {
    low: "bg-gray-200 text-gray-700",
    medium: "bg-yellow-200 text-yellow-800",
    high: "bg-orange-200 text-orange-800",
    critical: "bg-red-200 text-red-800"
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseUp={handleMouseUp}
      className="bg-white p-3 rounded shadow hover:shadow-md transition cursor-pointer mb-2 border"
    >
      {/* Title */}
      <h4 className="font-semibold text-sm mb-2">
        {ticket.title}
      </h4>

      {/* Priority Badge */}
      <div className="flex justify-between items-center">
        <span
          className={`text-xs px-2 py-1 rounded capitalize ${
            priorityColor[ticket.priority] || "bg-gray-200"
          }`}
        >
          {ticket.priority}
        </span>

        {/* 🔥 Assignee Badge */}
        {ticket.assignee && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {ticket.assignee.email}
          </span>
        )}
      </div>
    </div>
  );
}
