import React, { useState, useEffect, useRef } from 'react';
import './ShopFilterBar.css';
import {
    ChevronDown, SlidersHorizontal, X, DollarSign,
    Tag, Ruler, Palette, Star, Check
} from 'lucide-react';

const sortOptions = [
    { value: 'rating', label: 'Top Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'popular', label: 'Best Sellers' },
    { value: 'name-asc', label: 'Name: A to Z' },
];

const filterGroups = [
    {
        id: 'price',
        label: 'Price',
        icon: DollarSign,
        options: ['Under $25', '$25 - $50', '$50 - $100', '$100 - $200', 'Over $200'],
    },
    {
        id: 'brand',
        label: 'Brand',
        icon: Tag,
        options: ['Nike', 'Adidas', 'Puma', 'Under Armour', 'New Balance', 'Reebok'],
    },
    {
        id: 'size',
        label: 'Size',
        icon: Ruler,
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    },
    {
        id: 'color',
        label: 'Color',
        icon: Palette,
        options: ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray'],
    },
    {
        id: 'rating',
        label: 'Rating',
        icon: Star,
        options: ['5 Stars', '4+ Stars', '3+ Stars'],
    },
];

const ShopFilterBar = ({ onSortChange, onFilterChange }) => {
    const [sortValue, setSortValue] = useState('rating');
    const [sortOpen, setSortOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({});
    const [activeGroup, setActiveGroup] = useState(null);
    const sortRef = useRef(null);
    const filterRef = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 400);
        return () => clearTimeout(timer);
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (sortRef.current && !sortRef.current.contains(e.target)) {
                setSortOpen(false);
            }
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setFilterOpen(false);
                setActiveGroup(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSortChange = (value) => {
        setSortValue(value);
        setSortOpen(false);
        onSortChange && onSortChange(value);
    };

    const toggleFilterOption = (groupId, option) => {
        setSelectedFilters((prev) => {
            const group = prev[groupId] || [];
            const exists = group.includes(option);
            const updated = exists
                ? group.filter((o) => o !== option)
                : [...group, option];
            const newFilters = { ...prev, [groupId]: updated };

            // Notify parent
            onFilterChange && onFilterChange(newFilters);
            return newFilters;
        });
    };

    const clearAllFilters = () => {
        setSelectedFilters({});
        onFilterChange && onFilterChange({});
    };

    const activeFilterCount = Object.values(selectedFilters).flat().length;

    return (
        <div className={`shop-filter-bar ${visible ? 'filter-bar-visible' : ''}`}>
            {/* Top Bar */}
            <div className="filter-bar-top">
                {/* Result count */}
                <div className="filter-count">
                    <span className="filter-count-num">500+</span>
                    <span className="filter-count-label">Products</span>
                </div>

                {/* Sort Dropdown */}
                <div className="sort-wrapper" ref={sortRef}>
                    <button
                        className="sort-btn"
                        onClick={() => setSortOpen(!sortOpen)}
                    >
                        <span className="sort-label">Sort by:</span>
                        <span className="sort-value">
                            {sortOptions.find((o) => o.value === sortValue)?.label}
                        </span>
                        <ChevronDown
                            size={16}
                            className={`sort-chevron ${sortOpen ? 'open' : ''}`}
                        />
                    </button>

                    {sortOpen && (
                        <div className="sort-dropdown">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    className={`sort-option ${sortValue === option.value ? 'active' : ''}`}
                                    onClick={() => handleSortChange(option.value)}
                                >
                                    {option.label}
                                    {sortValue === option.value && (
                                        <Check size={14} />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Filter Toggle Button */}
                <button
                    className={`filter-toggle-btn ${activeFilterCount > 0 ? 'has-filters' : ''}`}
                    onClick={() => setFilterOpen(!filterOpen)}
                >
                    <SlidersHorizontal size={16} />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="filter-badge">{activeFilterCount}</span>
                    )}
                </button>

                {/* Active filter tags */}
                {activeFilterCount > 0 && (
                    <button className="clear-all-btn" onClick={clearAllFilters}>
                        <X size={13} />
                        Clear all
                    </button>
                )}
            </div>

            {/* Active filter pills */}
            {activeFilterCount > 0 && (
                <div className="active-filter-pills">
                    {Object.entries(selectedFilters).map(([groupId, options]) =>
                        options.map((opt) => {
                            const group = filterGroups.find((g) => g.id === groupId);
                            return (
                                <button
                                    key={`${groupId}-${opt}`}
                                    className="filter-pill"
                                    onClick={() => toggleFilterOption(groupId, opt)}
                                >
                                    <span>{group?.label}: {opt}</span>
                                    <X size={12} />
                                </button>
                            );
                        })
                    )}
                </div>
            )}

            {/* Filter Panel */}
            {filterOpen && (
                <div className="filter-panel" ref={filterRef}>
                    <div className="filter-panel-header">
                        <h3>Filter Products</h3>
                        <button
                            className="filter-panel-close"
                            onClick={() => {
                                setFilterOpen(false);
                                setActiveGroup(null);
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="filter-panel-body">
                        {/* Group tabs */}
                        <div className="filter-group-tabs">
                            {filterGroups.map((group) => {
                                const Icon = group.icon;
                                const count = selectedFilters[group.id]?.length || 0;
                                return (
                                    <button
                                        key={group.id}
                                        className={`filter-group-tab ${activeGroup === group.id ? 'tab-active' : ''} ${count > 0 ? 'tab-has-count' : ''}`}
                                        onClick={() => setActiveGroup(group.id)}
                                    >
                                        <Icon size={14} />
                                        <span>{group.label}</span>
                                        {count > 0 && (
                                            <span className="tab-count">{count}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Group content */}
                        <div className="filter-group-content">
                            {filterGroups.map((group) => {
                                const Icon = group.icon;
                                return (
                                    <div
                                        key={group.id}
                                        className={`filter-options-group ${activeGroup === group.id ? 'group-active' : ''}`}
                                    >
                                        <div className="filter-options-header">
                                            <Icon size={16} />
                                            <span>{group.label}</span>
                                        </div>
                                        <div className="filter-options-grid">
                                            {group.options.map((opt) => {
                                                const isSelected = selectedFilters[group.id]?.includes(opt);
                                                return (
                                                    <button
                                                        key={opt}
                                                        className={`filter-option-btn ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => toggleFilterOption(group.id, opt)}
                                                    >
                                                        {isSelected && <Check size={13} />}
                                                        {opt}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="filter-panel-footer">
                        <button className="filter-apply-btn" onClick={() => setFilterOpen(false)}>
                            Apply Filters ({activeFilterCount})
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopFilterBar;
