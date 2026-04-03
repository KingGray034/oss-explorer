import { useState } from "react";
import { Link } from "react-router-dom";

const PostCard = ({ post }) => {

    if (!post) return null; 

    // Destructure common properties from the post object for easier access
    const {
        id,
        user = {},
        timeAgo,
        content,
        issue ={},
        likes: initialLikes = 0,
        comments: initialComments = 0,
        shares: initialShares = 0
    } = post;

    const [isLiked, setIsliked] = useState(false);
    const [likes, setLikes] = useState(initialLikes);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [commentsList, setCommentsList] = useState([]);

    const handleLike = () => {
        if (isLiked) {
            setLikes(likes - 1);
            setIsliked(false);
        } else {
            setLikes(likes + 1);
            setIsliked(true);
        }
    };

    const handleCommentSubmit = () => {
        if (!commentText.trim()) return;

        const newComment = {
            id: Date.now(),
            user: "You",
            text: commentsText,
            timeAgo: "Just now"
        };

        setCommentsList([...commentsList, newComment]);
        setCommentText("");
    };

    const handleShare = () => {
        alert("Share functionality coming soon!");
    };

    return (
        <div className="post-card">
            <div className="post-header">
                <Link to={`/profile/${user.handle || user.id}`} className="post-user-link">
                    <img src={user.avatar || "https://via.placeholder.com/40"} alt={`${user.name || 'User'}'s avatar`} className="post-avatar" />
                    <div className="post-user-info">
                        <span className="post-username">{user.name || 'Anonymous'}</span>
                        <span className="post-time">{timeAgo || 'Just now'}</span>
                    </div>
                </Link>
                <button className="more-options" aria-label="More Options">⁞</button>
            </div>

            <div className="post-content">
                <p>{content}</p>
                {issue && issue.title && ( // Conditionally render linked issue section if issue exists
                    <div className="linked-issue">
                       <div className="issue-header">
                            <span className="issue-icon">📝</span>
                            <strong>{issue.title}</strong>
                       </div>
                       <p className="issue-repo">{issue.repo}</p>
                       {issue.tags && issue.tags.length > 0 && (
                            <div className="issue-tags">
                                {issue.tags.map(tag => (
                                    <span key={tag} className="issue-tag">{tag}</span>
                                ))}
                            </div>
                       )}
                    </div>
                )}
            </div>

            <div className="post-stats">
                <span>{likes} Likes</span>
                <span>{commentsList.length + initialComments} Comments</span>
                <span>{initialShares} Shares</span> 
            </div>

            <div className="post-actions">
                <button
                    className={`action-btn ${isLiked ? 'Liked' : ''}`}
                    onClick={handleLike}
                    aria-label={isLiked ? "Unlike" : "Like"}
                >
                    <span className="action-icon">{isLiked ? '❤' : '🤍'}</span>
                    <span className="action-count">{likes}</span>
                </button>

                <button 
                    className="action-btn"
                    onClick={() => setShowComments(!showComments)}
                    aria-label="Comment"
                >
                    <span className="action-icon">💬</span>
                    <span className="action-count">{commentsList.length + initialComments}</span>
                </button>

                <button 
                    className="action-btn"
                    onClick={handleShare}
                    aria-label="Share"
                >
                    <span className="action-icon">↗</span>
                </button>
            </div>

            {showComments && (
                <div className="comments-sections">
                    {/* Existing Comments */}
                    {commentsList.length > 0 && (
                        <div className="comments-list">
                            {commentsList.map(comment => (
                                <div key={comment.id} className="comment-item">
                                    <div className="comment-avatar">
                                        <img src="https://via.placeholder,com/32" alt="User" />
                                    </div>
                                    <div className="comment-content">
                                        <div className="comment-header">
                                            <span className="comment-user">{comment.user}</span>
                                            <span className="comment-time">{comment.timeAgo}</span>
                                        </div>
                                        <p className="comment-text">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="comment-input-wrapper">
                        <img 
                            src="https://via.placeholder.com/32" 
                            alt="Your avatar" 
                            className="comment-avatar-small"
                        />
                        <input 
                            type="text"
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                            className="comment-input"
                        />
                        <button
                            onClick={handleCommentSubmit}
                            disabled={!commentText.trim()}
                            className="comment-submit-btn"
                        >
                            Post
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
    
};

export default PostCard;
