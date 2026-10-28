import React, { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, placeholder = "Search..." }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <form className="search-container" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        {/* Search Icon */}
        <span className="search-icon">🔍</span>

        {/* Input Field */}
        <input
          type="text"
          className="search-input"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
        />

        {/* Loading Spinner or Clear Button */}
        {isLoading ? (
          <span className="search-spinner" />
        ) : query ? (
          <button
            type="button"
            className="clear-btn"
            onClick={handleClear}
            aria-label="Clear search input"
          >
            ✕
          </button>
        ) : null}
      </div>

      <button type="submit" className="search-submit-btn">
        Search
      </button>
    </form>
  );
}