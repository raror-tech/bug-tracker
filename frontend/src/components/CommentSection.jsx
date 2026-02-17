import { useEffect, useState } from "react";
import axios from "axios";

export default function CommentSection({ ticketId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");

  const fetchComments = async () => {
    const res = await axios.get(
      `http://localhost:8001/comments/tickets/${ticketId}`
    );
    setComments(res.data);
  };

  const handleSubmit = async () => {
    await axios.post(
      `http://localhost:8001/comments/tickets/${ticketId}`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setContent("");
    fetchComments();
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Comments</h3>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border p-2 rounded"
        placeholder="Write a comment..."
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
      >
        Add Comment
      </button>

      <div className="mt-4 space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="bg-gray-100 p-2 rounded">
            {c.content}
          </div>
        ))}
      </div>
    </div>
  );
}
