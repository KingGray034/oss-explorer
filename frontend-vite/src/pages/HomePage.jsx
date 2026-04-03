import { useState, useRef } from "react";
import Header from "../components/Header";
import HamburgerMenu from "../components/HamburgerMenu";
import DailyChallenge from "../components/DailyChallenge";
import PostCreator from "../components/PostCreator";
import Feed from "../components/Feed";
import SearchWidget from "../components/SearchWidget";
import TrendingWidget from "../components/TrendingWidget";

const HomePage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const hamburgerRef = useRef(null); //Create ref for the hamburger button

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="home-page">
            <Header onMenuToggle={toggleMenu} hamburgerRef={hamburgerRef} />
            <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            <div className="home-layout">
                {/* Main Content Area */}
                <main className="main-content">
                    <DailyChallenge /> {/* Use existing component */}
                    <PostCreator />
                    <Feed /> {/* Use the new Feed component */}
                </main>

                {/* Sidebar */}
                <aside className="sidebar">
                    <SearchWidget />
                    <TrendingWidget />
                </aside>
            </div>
        </div>
    );
};

export default HomePage;