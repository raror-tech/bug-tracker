import { useDroppable } from "@dnd-kit/core";
import Card from "./Card";

export default function Column({ id, title, tickets, onOpenTicket }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="bg-gray-100 p-4 rounded-xl min-h-[400px]">
      <h2 className="font-bold mb-4">{title}</h2>

      {tickets.map(ticket => (
        <Card
          key={ticket.id}
          ticket={ticket}
          onOpen={onOpenTicket}   // ✅ pass handler
        />
      ))}
    </div>
  );
}
