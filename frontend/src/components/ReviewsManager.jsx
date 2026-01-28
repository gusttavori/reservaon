import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, MessageSquare } from 'lucide-react';
import './ReviewsManager.css';

const ReviewsManager = () => {
  const [data, setData] = useState({ reviews: [], average: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (error) {
      console.error("Erro ao carregar avaliações");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={16} fill={i < rating ? "#eab308" : "none"} color={i < rating ? "#eab308" : "#cbd5e1"} />
    ));
  };

  if (loading) return <p>Carregando feedback...</p>;

  return (
    <div className="reviews-container">
      <div className="reviews-summary">
        <div className="score-card">
          <h2>{Number(data.average).toFixed(1)}</h2>
          <div className="stars-row">
            {renderStars(Math.round(data.average))}
          </div>
          <p>{data.total} avaliações totais</p>
        </div>
      </div>

      <div className="reviews-list">
        {data.reviews.length === 0 ? (
          <div className="empty-reviews">
            <Star size={48} style={{opacity: 0.3, marginBottom: '1rem'}} />
            <p>Nenhuma avaliação recebida ainda.</p>
          </div>
        ) : (
          data.reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <strong>{review.customerName}</strong>
                <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="review-stars">
                {renderStars(review.rating)}
              </div>
              {review.comment && (
                <p className="review-comment">
                  <MessageSquare size={14} style={{marginRight: '6px', display: 'inline'}}/>
                  "{review.comment}"
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsManager;