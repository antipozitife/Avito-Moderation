import React from "react";
import "./Filters.css";

export type FiltersState = {
  status: string[];
  category: string[];
  priceMin: string;
  priceMax: string;
  search: string;
};

type StatusType = {
  key: string;
  label: string;
};

type Props = {
  filters: FiltersState;
  categories: string[];
  onChange: (filters: FiltersState) => void;
  onReset: () => void;
};

const statuses: StatusType[] = [
  { key: 'pending', label: 'На модерации' },
  { key: 'approved', label: 'Одобренный' },
  { key: 'rejected', label: 'Отклоненный' }
];

const Filters: React.FC<Props> = ({ filters, categories, onChange, onReset }) => {
  const toggleMultiple = (key: keyof FiltersState, value: string) => {
    let arr = filters[key] as string[];
    if (arr.includes(value)) {
      arr = arr.filter(el => el !== value);
    } else {
      arr = [...arr, value];
    }
    onChange({ ...filters, [key]: arr });
  };

  const handlePriceChange = (key: "priceMin" | "priceMax", value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  return (
    <div className="filters-root">
      <div className="filters-header">
        <div className="filters-caption">Фильтры:</div>
        <button className="filters-reset" onClick={onReset}>Сброс фильтров</button>
      </div>

      <div className="filters-row">
        <span className="filter-label">Статус:</span>
        <div className="filter-menu status-menu">
          {statuses.map(s => (
            <label key={s.key}>
              <input
                type="checkbox"
                checked={filters.status.includes(s.key)}
                onChange={() => toggleMultiple("status", s.key)}
              />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      <div className="filters-row category-search-row">
        <div className="category-section">
          <span className="filter-label">Категория:</span>
          <div className="filter-menu category-menu">
            {categories.map(c => (
              <label key={c}>
                <input
                  type="checkbox"
                  checked={filters.category.includes(c)}
                  onChange={() => toggleMultiple("category", c)}
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        <div className="search-price-section">
          <input
            className="filter-input search-input"
            type="text"
            placeholder="Поиск..."
            value={filters.search}
            onChange={handleSearchChange}
          />
          <div className="price-row">
            <input
              className="filter-input price-input"
              type="number"
              placeholder="Мин цена"
              value={filters.priceMin}
              onChange={e => handlePriceChange("priceMin", e.target.value)}
            />
            <input
              className="filter-input price-input"
              type="number"
              placeholder="Макс цена"
              value={filters.priceMax}
              onChange={e => handlePriceChange("priceMax", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
