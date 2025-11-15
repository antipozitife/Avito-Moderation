import React, { useState, useEffect } from "react";
import axios from "axios";
import Filters, { FiltersState } from "../../components/Filters/Filters";
import Card from "../../components/Card/Card";
import "./MainPage.css";

const PAGE_SIZE = 10;

const categories = [
  "Электроника",
  "Недвижимость",
  "Транспорт",
  "Работа",
  "Услуги",
  "Животные",
  "Мода",
  "Детское",
];

type SortByOption = "createdAt" | "price" | "priority";
type SortOrder = "asc" | "desc";

const defaultFilters: FiltersState = {
  status: [],
  category: [],
  priceMin: "",
  priceMax: "",
  search: "",
};

const MainPage = () => {
  const [allAdverts, setAllAdverts] = useState<any[]>([]);
  const [filteredAdverts, setFilteredAdverts] = useState<any[]>([]);
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortByOption>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    setLoading(true);
    axios.get("/api/v1/ads", { params: { limit: 1000, page: 1 } })
      .then(res => {
        const ads = Array.isArray(res.data.ads) ? res.data.ads : [];
        setAllAdverts(ads);
        setLoading(false);
      })
      .catch(() => {
        setAllAdverts([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = allAdverts.filter((item) => {
      const itemStatus = item.status?.toLowerCase() || "";
      const itemCategory = item.category?.toLowerCase() || "";

      if (
        filters.status.length > 0 &&
        !filters.status.map(s => s.toLowerCase()).includes(itemStatus)
      ) {
        return false;
      }
      if (
        filters.category.length > 0 &&
        !filters.category.map(c => c.toLowerCase()).includes(itemCategory)
      ) {
        return false;
      }
      if (filters.priceMin && item.price < +filters.priceMin) return false;
      if (filters.priceMax && item.price > +filters.priceMax) return false;
      if (
        filters.search &&
        !item.title.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;

      return true;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      if (sortBy === "priority") {
        const priorityRank = (p: string) => (p === "urgent" ? 1 : 0);
        aValue = priorityRank(a.priority || "");
        bValue = priorityRank(b.priority || "");
      } else if (sortBy === "price") {
        aValue = a.price;
        bValue = b.price;
      } else {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredAdverts(filtered);
    setCurrentPage(1);
  }, [filters, allAdverts, sortBy, sortOrder]);

  const total = filteredAdverts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPageAdverts = filteredAdverts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  const handleFiltersChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <div>
      <Filters
        categories={categories}
        filters={filters}
        onChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      <div className="sort-container">
        <label htmlFor="sortBySelect">Сортировать по:</label>
        <select
          id="sortBySelect"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortByOption)}
        >
          <option value="createdAt">Дате создания</option>
          <option value="price">Цене</option>
          <option value="priority">Приоритету</option>
        </select>

        <label htmlFor="sortOrderSelect">Порядок:</label>
        <select
          id="sortOrderSelect"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
        >
          <option value="desc">По убыванию</option>
          <option value="asc">По возрастанию</option>
        </select>
      </div>

      {loading && <div className="loading">Загрузка объявлений...</div>}

      {!loading && currentPageAdverts.length === 0 && (
        <div className="no-ads">Нет объявлений по выбранным фильтрам.</div>
      )}
      {!loading &&
        currentPageAdverts.map((item) => (
          <Card
            key={item.id}
            id={item.id}
            title={item.title}
            price={item.price}
            category={item.category}
            date={item.createdAt}
            status={item.status}
            priority={item.priority}
            imageUrl={item.images && item.images.length > 0 ? item.images[0] : undefined}
            onOpen={() => {}}
          />
        ))}

      <div className="pagination-container">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Предыдущая страница"
        >
          ◄
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={pageNum === currentPage ? "active" : ""}
            aria-current={pageNum === currentPage ? "page" : undefined}
            aria-label={`Страница ${pageNum}`}
          >
            {pageNum}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Следующая страница"
        >
          ►
        </button>
      </div>

      <div className="total-ads">Всего: {total} объявлений</div>
    </div>
  );
};

export default MainPage;
