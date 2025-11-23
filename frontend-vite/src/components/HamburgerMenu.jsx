import React from "react";
import { Link } from "react-router-dom";


const HamburgerMenu = ({ isOpen, onClose}) => {
    if (!isOpen) return null;

    return (
        <div className="hamburger-menu-overlay" onClick={onClose}>
            <div className="hamburger-menu-content" onClick={(e) => e.stopPropagation}>
                <div className="menu-header">
                    <div className="user-info">
                        <img src="https://via.placeholder.com/60" alt="User Avatar" className="avatar-large" />
                        <div className="user-details">
                            <div className="username">John Doe</div> {/* Placeholder username */}
                            <div className="handle">@johndoe</div> {/* Placeholder handle */}
                        </div>
                    </div>
                    <button className="close-menu" onClick={onClose} aria-label="Close Menu"></button>
                </div>
            </div>
        </div>
    )
}