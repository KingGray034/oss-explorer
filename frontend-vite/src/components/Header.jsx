import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HamburgerMenu from "./HamburgerMenu";
import logo from "../assets/oss-explorer-logo-light.svg"


const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <header className="header">
                <div className="header-content">
                    <div className="logo-section">
                        <Link to="/" className="logo">
                            <img src={logo} alt="OSS Explorer Logo" className="logo-image" />
                        </Link>
                    </div>

                    <div className="header-actions">
                        <Link to="/messages" className="icon-button" aria-label="Messages">
                            <i className="bell-icon">🔔</i>
                        </Link>

                        <button className="theme-button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} >
                            {theme === 'light' ? '🌙' : '🌞'}
                        </button>

                        <button className={`hamburger-menu ${isMenuOpen ? 'open' : ''}`}
                        onClick={toggleMenu}
                        aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
                        >
                            <div className="hamburger-line"></div>
                            <div className="hamburger-line"></div>
                            <div className="hamburger-line"></div>
                        </button>
                    </div>
                </div>
                <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </header>
    )
}

export default Header;