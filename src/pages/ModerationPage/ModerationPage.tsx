import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Добавьте этот импорт
import axios from "axios";
import "./ModerationPage.css";

type AdItem = {
  id: number;
  title: string;
  price: number;
  category: string;
  date: string;
  status: string;
  priority: string;
  images: string[];
  description?: string;
};

const ModerationPage = () => {
  const navigate = useNavigate(); // Инициализируйте навигацию
  const [currentAd, setCurrentAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionComment, setRejectionComment] = useState("");
  const [allAds, setAllAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const reasons = [
    "Запрещенный товар",
    "Неверная категория",
    "Другое",
  ];

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/v1/ads", { params: { limit: 1000, page: 1, status: "pending" } })
      .then((res) => {
        const ads = Array.isArray(res.data.ads) ? res.data.ads : [];
        setAllAds(ads);
        if (ads.length > 0) {
          setCurrentAd(ads[0]);
        }
        setLoading(false);
      })
      .catch(() => {
        setAllAds([]);
        setLoading(false);
      });
  }, []);

  const handleApprove = async () => {
    if (!currentAd) return;
    try {
      await axios.post(`/api/v1/ads/${currentAd.id}/approve`);
      moveToNext();
    } catch (error) {
      console.error("Error approving ad:", error);
    }
  };

  const handleReject = async () => {
    if (!currentAd || !rejectionReason) return;
    try {
      await axios.post(`/api/v1/ads/${currentAd.id}/reject`, {
        reason: rejectionReason,
        comment: rejectionComment,
      });
      setShowRejectionModal(false);
      setRejectionReason("");
      setRejectionComment("");
      moveToNext();
    } catch (error) {
      console.error("Error rejecting ad:", error);
    }
  };

  const handleRequestChanges = async () => {
    if (!currentAd) return;
    try {
      await axios.post(`/api/v1/ads/${currentAd.id}/request-changes`, {
        reason: rejectionReason,
        comment: rejectionComment,
      });
      setShowRejectionModal(false);
      setRejectionReason("");
      setRejectionComment("");
      moveToNext();
    } catch (error) {
      console.error("Error requesting changes:", error);
    }
  };

  const moveToNext = () => {
    if (currentIndex < allAds.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentAd(allAds[nextIndex]);
    } else {
      setCurrentAd(null);
    }
  };

  const moveToPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentAd(allAds[prevIndex]);
    }
  };

  if (loading) {
    return <div className="moderation-page">Загрузка объявлений...</div>;
  }

  if (!currentAd) {
    return <div className="moderation-page">Нет объявлений для модерации</div>;
  }

  const imageUrl = currentAd.images && currentAd.images.length > 0
    ? currentAd.images[0]
    : "img/placeholder.png";

  const dateObj = new Date(currentAd.date);
  const formattedDate = dateObj.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="moderation-page">
      <div className="moderation-container">
        {/* Gallery Section */}
        <div className="moderation-gallery">
          <img src={imageUrl} alt={currentAd.title} />
        </div>

        {/* Moderation History */}
        <div className="moderation-history">
          <h3>📋 История модерации</h3>
          <p><strong>Модератор:</strong> Иван</p>
          <p><strong>Дата:</strong> {formattedDate}</p>
          <p><strong>Статус:</strong> ✓ Одобрено</p>
        </div>

        {/* Full Description */}
        <div className="moderation-description">
          <h3>📝 Полное описание</h3>
          <h4>Характеристики (таблица)</h4>
          <p>
            <strong>Продавец:</strong> {currentAd.title} | ⭐ 4.8<br />
            {allAds.length} объявлений | На сайте: 2 года
          </p>
        </div>

        {/* Action Buttons */}
        <div className="moderation-actions">
          <button className="btn btn-approve" onClick={handleApprove}>
            ✓ Одобрить
          </button>
          <button
            className="btn btn-reject"
            onClick={() => setShowRejectionModal(true)}
          >
            ✕ Отклонить
          </button>
          <button className="btn btn-request-changes">
            ⟳ Доработка
          </button>
        </div>

        {/* Navigation */}
        <div className="moderation-nav">
          <button 
            className="nav-link" 
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#007bff",
              fontWeight: 600,
              fontSize: "0.95rem",
              padding: 0
            }}
          >
            ← К списку
          </button>
          <div className="pagination">
            <button
              onClick={moveToPrevious}
              disabled={currentIndex === 0}
              aria-label="Предыдущее объявление"
            >
              ◀ Пред
            </button>
            <span className="page-info">
              {currentIndex + 1} / {allAds.length}
            </span>
            <button
              onClick={moveToNext}
              disabled={currentIndex === allAds.length - 1}
              aria-label="Следующее объявление"
            >
              Сред ▶
            </button>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="modal-overlay" onClick={() => setShowRejectionModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>📋 Отклонение</h2>
            <div className="modal-content">
              <h4>Причина:</h4>
              <div className="checkbox-group">
                {reasons.map((reason) => (
                  <label key={reason} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rejectionReason === reason}
                      onChange={() => setRejectionReason(reason)}
                    />
                    {reason}
                  </label>
                ))}
              </div>
            </div>
            <button className="btn btn-submit" onClick={handleReject}>
              Отправить
            </button>
            <button 
              className="btn btn-close" 
              onClick={() => setShowRejectionModal(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationPage;
