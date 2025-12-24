import React from 'react';

interface MenuItemProps {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ name, description, price, imageUrl }) => {
    return (
        <div className="menu-item">
            <img src={imageUrl} alt={name} className="menu-item-image" />
            <h3 className="menu-item-name">{name}</h3>
            <p className="menu-item-description">{description}</p>
            <p className="menu-item-price">₹{price.toFixed(2)}</p>
        </div>
    );
};

export default MenuItem;