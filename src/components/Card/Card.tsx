import React from "react";
import "./Card.css";

type CardProps = {
  title: string;
  price: number;
  category: string;
  date: string;
  status: string;       
  priority: string;     
  imageUrl?: string;
  onOpen: () => void;
};

const statusLabels: { [key: string]: string } = {
  pending: "На модерации",
  approved: "Одобрено",
  rejected: "Отклонено",
};

const priorityLabels: { [key: string]: string } = {
  normal: "Обычный",
  urgent: "Срочный",
};

const Card: React.FC<CardProps> = ({ title, price, category, date, status, priority, imageUrl, onOpen }) => {
  const src = imageUrl ? imageUrl : "../../../img/placeholder.png";

  const dateObj = new Date(date);
  const formattedDate = isNaN(dateObj.getTime())
    ? "Дата недоступна"
    : dateObj.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  return (
    <div className="card">
      <img className="card-img" src={src} alt={title} />
      <div className="card-content">
        <div className="card-title">{title}</div>
        <div className="card-price">{price.toLocaleString()} ₽</div>
        <div className="card-sub">
          {category} • {formattedDate}
        </div>
        <div className="card-status">
          Статус: <b>{statusLabels[status] || status}</b>
        </div>
        <div className={`card-priority ${priority === "urgent" ? "priority-urgent" : ""}`}>
          Приоритет: <b>{priorityLabels[priority] || priority}</b>
        </div>
      </div>
      <button className="card-btn" onClick={onOpen}>
        Открыть →
      </button>
    </div>
  );
};

export default Card;
