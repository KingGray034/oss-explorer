import { useNavigate } from "react-router-dom";

const TrendingWidget = () => {
    const navigate = useNavigate();

    const trendingTopics = [
        { name: "React 19", category: "Technology", posts: "12.5k" },
        { name: "Open Source", category: "Development", posts: "8.2k" },
        { name: "TypeScript", category: "Programming", posts: "6.7k" },
        { name: "Good First Issue", category: "Trending", posts: "4.1k" },
    ];

    return (
        <div className="trending-widget">
            <h3 className="widget-title">🔥 What's Trending</h3>
            <div className="trending-list">
                {trendingTopics.map((topic, index) => (
                    <div 
                        key={index}
                        className="trending-item"
                        onClick={() => navigate(`/search?language=${topic.name.toLowerCase()}`)}
                    >
                        <div className="trending-category">{topic.category}</div>
                        <div className="trending-name">{topic.name}</div>
                        <div className="trending-posts">{topic.posts} posts</div>
                    </div>
                ))}
            </div>

            <button 
                className="show-more-link"
                onClick={() => navigate('/search')}
            >
                Show more
            </button>
        </div>
    );
};

export default TrendingWidget