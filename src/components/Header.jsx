import React from 'react';

export const Header = ({
  searchTerm,
  onSearchChange,
  filterMode,
  onFilterChange,
  categories,
  selectedCategory,
  onCategoryChange,
  onAddClick
}) => {
  return (
    <header className="app-header">
      <h1>多肉管理系统</h1>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="搜索当前分类..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="filter-container">
        <select
          className="filter-select"
          value={filterMode}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          <option value="all">全部</option>
          <option value="missingLocal">缺本地</option>
          <option value="missingRemote">缺远端</option>
        </select>
      </div>
      <div className="category-filter-container">
        <select
          className="category-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {categories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
          <option value="__uncategorized__">未分类</option>
        </select>
      </div>
      <button className="add-button" onClick={onAddClick}>
        新增/上传
      </button>
    </header>
  );
};

