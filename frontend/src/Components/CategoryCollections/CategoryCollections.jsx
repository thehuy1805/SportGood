import React, { useState, useEffect } from 'react';
import './CategoryCollections.css';
import API_BASE_URL from '../../config';

const categoryIcons = {
    Men: { accent: '#3b82f6', title: 'Featured Collections' },
    Women: { accent: '#ec4899', title: 'Curated Collections' },
    'Sports Equipment': { accent: '#10b981', title: 'Shop By Sport' },
};

const CategoryCollections = ({ category, collections, onSelectCollection }) => {
    const [dynamicCollections, setDynamicCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const categoryConfig = categoryIcons[category] || categoryIcons.Men;

    useEffect(() => {
        if (!collections) {
            const fetchCollections = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`${API_BASE_URL}/allproducts`);
                    const products = await response.json();
                    
                    const categoryProducts = products.filter(p => p.generalCategory === category);
                    const uniqueCategories = [...new Set(categoryProducts.map(p => p.detailedCategory))];
                    
                    const collectionData = uniqueCategories.map(cat => {
                        const name = cat || 'Other';
                        let icon = '📦';
                        
                        // Assign different icons based on category name
                        if (name.toLowerCase().includes('yoga') || name.toLowerCase().includes('pilates')) icon = '🧘';
                        else if (name.toLowerCase().includes('running') || name.toLowerCase().includes('runner')) icon = '🏃';
                        else if (name.toLowerCase().includes('training') || name.toLowerCase().includes('fitness') || name.toLowerCase().includes('gym')) icon = '💪';
                        else if (name.toLowerCase().includes('lifestyle') || name.toLowerCase().includes('casual')) icon = '✨';
                        else if (name.toLowerCase().includes('jersey') || name.toLowerCase().includes('team')) icon = '🏆';
                        else if (name.toLowerCase().includes('basketball') || name.toLowerCase().includes('soccer')) icon = '⚽';
                        else if (name.toLowerCase().includes('strength') || name.toLowerCase().includes('weight')) icon = '🏋️';
                        else if (name.toLowerCase().includes('cardio') || name.toLowerCase().includes('cycling')) icon = '🚴';
                        else if (name.toLowerCase().includes('accessories')) icon = '🎒';
                        
                        return { name, icon };
                    });
                    
                    setDynamicCollections(collectionData.slice(0, 4));
                } catch (error) {
                    console.error('Error fetching collections:', error);
                }
                setLoading(false);
            };
            
            fetchCollections();
        }
    }, [category, collections]);

    const displayCollections = collections || dynamicCollections;

    return (
        <div className="category-collections">
            <h2 className="collections-title">{categoryConfig.title}</h2>
            <div className="collections-grid">
                {loading ? (
                    <p className="collections-loading">Loading...</p>
                ) : (
                    displayCollections.map((item, index) => (
                        <button
                            key={index}
                            className="collection-btn"
                            onClick={() => onSelectCollection && onSelectCollection(item.name)}
                            style={{ '--accent': categoryConfig.accent }}
                        >
                            <span className="collection-icon">{item.icon || '📦'}</span>
                            <span className="collection-name">{item.name}</span>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default CategoryCollections;
