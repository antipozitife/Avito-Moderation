import React from "react";
import { useNavigate } from "react-router-dom";
import "./Card.css";

type CardProps = {
  id: number;
  title: string;
  price: number;
  category: string;
  date: string;
  status: string;
  priority: string;
  imageUrl?: string;
  onOpen?: () => void;
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

const Card: React.FC<CardProps> = ({
  id,
  title,
  price,
  category,
  date,
  status,
  priority,
  imageUrl,
  onOpen,
}) => {
  const navigate = useNavigate();

  const src = imageUrl ? imageUrl : "../../../img/placeholder.png";

  const dateObj = new Date(date);
  const formattedDate = isNaN(dateObj.getTime())
    ? "Дата недоступна"
    : dateObj.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  const handleClick = () => {
    navigate(`/item/${id}`);
    if (onOpen) onOpen();
  };

  return (
    <div className="card">
      <img className="card-img" src={src} alt={title} />
      <div className="card-content">
        <h2 className="card-title">{title}</h2>
        <p className="card-price">{price.toLocaleString()} ₽</p>
        <p className="card-sub">
          {category} • {formattedDate}
        </p>
        <p className="card-sub">
          Статус: {statusLabels[status] || status} | Приоритет:{" "}
          {priorityLabels[priority] || priority}
        </p>
      </div>
      <button className="card-btn" onClick={handleClick}>
        Открыть →
      </button>
    </div>
  );
};

export default Card;
