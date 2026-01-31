import { useState, useEffect } from 'react';
import api from '../services/api'; // IMPORTANTE: Usa a instância configurada
import { Star, MessageSquare, User, ThumbsUp } from 'lucide-react';
import './ReviewsManager.css';

const ReviewsManager = () => {
  const [data, setData] = useState({ reviews: [], average: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // O interceptor do api.js já cuida do Token e da URL base (Render)
      const res = await api.get('/api/reviews');
      setData(res.data);
    } catch (error) {
      console.error("Erro ao carregar avaliações", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        fill={i < rating ? "#eab308" : "none"} 
        color={i < rating ? "#eab308" : "#cbd5e1"} 
      />
    ));
  };

  if (loading) return <p className="loading-text">Carregando feedback...</p>;

  return (
    <div className="reviews-container">
      
      {/* Resumo Geral */}
      <div className="reviews-header">
        <div className="score-box">
          <h1>{Number(data.average).toFixed(1)}</h1>
          <div className="stars-wrapper">
            <div className="stars-row">
              {renderStars(Math.round(data.average))}
            </div>
            <span>Baseado em {data.total} avaliações</span>
          </div>
        </div>
        <div className="header-text">
          <h3>Feedback dos Clientes</h3>
          <p>Veja o que estão falando sobre seus serviços.</p>
        </div>
      </div>

      {/* Lista */}
      <div className="reviews-list">
        {data.reviews.length === 0 ? (
          <div className="empty-reviews">
            <MessageSquare size={48} style={{opacity: 0.3, marginBottom: '1rem'}} />
            <p>Nenhuma avaliação recebida ainda.</p>
          </div>
        ) : (
          data.reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-top">
                <div className="reviewer-info">
                  <div className="avatar-placeholder">
                    <User size={16} />
                  </div>
                  <div>
                    <strong>{review.customerName}</strong>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="review-stars">
                  {renderStars(review.rating)}
                </div>
              </div>
              
              {review.comment && (
                <div className="review-body">
                  <p>"{review.comment}"</p>
                </div>
              )}

              <div className="review-footer">
                <span className="verified-badge">
                  <ThumbsUp size={12} /> Cliente Verificado
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsManager;