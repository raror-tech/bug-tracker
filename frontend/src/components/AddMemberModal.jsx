import { useState } from "react";
import api from "../api/axios";

const AddMemberModal = ({ projectId, onClose }) => {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post(`/projects/${projectId}/members`, {
        user_id: Number(userId)
      });

      onClose();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to add member"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-lg font-semibold mb-4">
          Add Member
        </h2>

        <form onSubmit={handleAddMember} className="space-y-4">
          <input
            type="number"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
