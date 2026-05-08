import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const FeedbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const navigate = useNavigate();

  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!orderId) return setMessage('Missing order id');
    setLoading(true);
    try {
      await api.post(`/orders/${orderId}/feedback`, { rating, comments });
      setMessage('Thank you! Your feedback has been submitted.');
      setTimeout(() => navigate(`/order/${orderId}`), 1500);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Rate your experience</h2>
        <p className="text-sm text-gray-600 mb-4">Order: {orderId || 'N/A'}</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full border px-3 py-2 rounded">
            {[5,4,3,2,1].map((r) => (
              <option key={r} value={r}>{r} stars</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
          <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={4} className="w-full border px-3 py-2 rounded" />
        </div>

        {message && (
          <div className="mb-4 text-center text-sm text-gray-700">{message}</div>
        )}

        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} className="flex-1 px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Submitting...' : 'Submit Feedback'}</button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
