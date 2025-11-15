import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./StatsPage.css";

const periodOptions = [
  { label: "Сегодня", value: "today" },
  { label: "7д", value: "week" },
  { label: "30д", value: "month" },
];

const colors = {
  approved: "#4caf50",
  rejected: "#f44336",
  requestChanges: "#ff9800",
  categories: "#2196f3",
};

type SummaryType = {
  totalReviewed: number;
  approvedPercentage: number;
  rejectedPercentage: number;
  averageReviewTime: number;
};

type ActivityPoint = { date: string; approved: number; rejected: number; requestChanges: number };
type DecisionsType = { approved: number; rejected: number; requestChanges: number };
type CategoriesType = Record<string, number>;

export default function StatsPage() {
  const [period, setPeriod] = useState<string>("today");
  const [summary, setSummary] = useState<SummaryType | null>(null);
  const [activity, setActivity] = useState<ActivityPoint[]>([]);
  const [decisions, setDecisions] = useState<DecisionsType | null>(null);
  const [categories, setCategories] = useState<CategoriesType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get("/api/v1/stats/summary", { params: { period } }),
      axios.get("/api/v1/stats/chart/activity", { params: { period } }),
      axios.get("/api/v1/stats/chart/decisions", { params: { period } }),
      axios.get("/api/v1/stats/chart/categories", { params: { period } }),
    ])
      .then(([summaryRes, activityRes, decisionsRes, categoriesRes]) => {
        setSummary(summaryRes.data);
        setActivity(activityRes.data);
        setDecisions(decisionsRes.data);
        setCategories(categoriesRes.data);
        setLoading(false);
      })
      .catch(() => {
        setSummary(null);
        setActivity([]);
        setDecisions(null);
        setCategories(null);
        setLoading(false);
      });
  }, [period]);

  // Подготовка данных для PieChart решений
  const pieData = decisions
    ? [
        { name: "Одобрено", value: decisions.approved, color: colors.approved },
        { name: "Отклонено", value: decisions.rejected, color: colors.rejected },
        { name: "На доработку", value: decisions.requestChanges || 0, color: colors.requestChanges },
      ]
    : [];

  // Подготовка данных для BarChart категорий
  const barData = categories
    ? Object.entries(categories).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="stats-root-full">
      <h2 className="stats-title">Статистика</h2>
      <div className="stats-period-card">
        Период:
        {periodOptions.map((opt) => (
          <button
            key={opt.value}
            className={`stats-period-btn${period === opt.value ? " active" : ""}`}
            onClick={() => setPeriod(opt.value)}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : summary ? (
        <>
          <div className="stats-grid">
            <div className="stats-cell">
              <span>Проверено</span>
              <div className="stats-value">{summary.totalReviewed}</div>
            </div>
            <div className="stats-cell">
              <span>Одобрено</span>
              <div className="stats-value">{Math.round(summary.approvedPercentage)}%</div>
            </div>
            <div className="stats-cell">
              <span>Отклонено</span>
              <div className="stats-value">{Math.round(summary.rejectedPercentage)}%</div>
            </div>
            <div className="stats-cell">
              <span>Ср. время</span>
              <div className="stats-value">{(summary.averageReviewTime / 60).toFixed(1)} мин</div>
            </div>
          </div>

          <div className="stats-block">
            <div className="stats-block-title">График активности ({activity.length} дней)</div>
            <div className="stats-bar-chart">
              {activity.map((point, i) => (
                <div
                  key={i}
                  className="bar"
                  style={{
                    height: point.approved * 7 + 8,
                  }}
                  title={`${point.date}: Одобрено ${point.approved}, Отклонено ${point.rejected}, На доработку ${point.requestChanges}`}
                >
                  <span className="bar-val">{point.approved + point.rejected + point.requestChanges > 0 ? point.approved + point.rejected + point.requestChanges : ""}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-block" style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 300px", minWidth: 280 }}>
              <div className="stats-block-title">Распределение решений</div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ flex: "1 1 300px", minWidth: 280 }}>
              <div className="stats-block-title">Категории объявлений</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartTooltip />
                  <Bar dataKey="value" fill={colors.categories} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="error">Не удалось загрузить статистику</div>
      )}
    </div>
  );
}
