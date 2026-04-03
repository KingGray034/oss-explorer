import PostCard from "./Postcard";

//Example Mock Data structure for posts
const mockPosts = [
    {
        id: 1,
        user: {
            name: "Francis David",
            avatar: "https://via.placeholder.com/48",
            handle: "francisdavid"
        },
        timeAgo: "3 hours ago",
        content: "Just submitted my first PR to React! 🎉 Started wiath a documentation fix and the maintainers were super helpful. If you're nervous about contributing, just start small!",
        issue: {
            title: "Fix typo in hooks documentation",
            repo: "facebook/react",
            tags: ["good first issue", "documentation"]
        },
        likes: 124,
        comments: 18,
        shares: 5
    },
    {
        id: 2,
        user: {
            name: "Mike Kumar",
            avatar: "https://via.placeholder.com/48",
            handle: "mikekumar",
        },
        timeAgo: "6 hours ago",
        content: "Looking for contributors! We need help fixing a critical bug in our authentication flow. Great oppurtunity to learn about OAuth 2.0!",
        issue: {
            title: "login fails with Google OAuth",
            repo: "awesome-startup/auth-service",
            tags: ["bug", "help wanted", "authentication"]
        },
        likes: 56,
        comments: 12,
        shares: 8,
    },
    {
        id: 3,
        user: {
            name: "Alice Johnson",
            avatar: "https://via.placeholder.com/48",
            handle: "alicej"
        },
        timeAgo: "2 hours ago",
        content: "Just solved my first good-first-issue on a major project! The maintainers were super helpful.",
        issue: {
            title: "Fix typo in README",
            repo: "some-org/some-repo",
            tags: ["documentation", "good-first-issue"]
        },
        likes: 15,
        comments: 3,
        shares: 1
    },
    {
        id: 4,
        user: {
            name: "Bob Smith",
            avatar: "https://via.placeholder.com/48",
            handle: "bobsmith"
        },
        timeAgo: "5 hours ago",
        content: "Looking for contributions for my new open-source library! It's written in Rust and focuses on async programming.",
        likes: 8,
        comments: 5,
        shares: 2
    }
];


const Feed = ({ posts }) => {
    // Determine which posts to display: use real posts if available, otherwise use mock data
    const postsToDisplay = posts && posts.length > 0 ? posts : mockPosts;

    return (
        <div className="feed">
            {postsToDisplay.length > 0 ? (
                postsToDisplay.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                    />
                ))
            ) : (
                <div className="no-posts">
                    <p>No Posts yet. Be the first to share something!</p>
                </div>
            )}
        </div>
    );
};

export default Feed;