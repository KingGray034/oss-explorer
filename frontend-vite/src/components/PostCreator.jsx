import { useState } from "react";

const PostCreator = () => {
    const [postContent, setPostContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    const handlePost = async () => {
        if (!postContent.trim()) {
            alert("Please write something before posting!");
            return;
        }

        setIsPosting(true);
        setTimeout(() => {
            console.log("Posted:", postContent);
            setPostContent('');
            setIsPosting(false);
            alert("Post published successfully!")
        }, 1000);
    };

    const handleImageClick = () => {
        alert("Image upload feature coming soon!");
    };

    const handleLinkClick = () => {
        alert("Link attachment feature coming soon!");
    };

    return (
        <div className="post-creator">
            <div className="post-creator-header">
                <div className="post-creator-avatar">
                    <img 
                    src="https://via.placeholder.com/50" 
                    alt="Your avatar" 
                    className="creator-avatar-img"
                />
                </div>

                <textarea
                    className="post-creator-input"
                    placeholder="Share something..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={3}
                    disabled={isPosting}
                 />
            </div>

            <div className="post-creator-footer">
                <div className="post-creator-actions">
                    <button
                        className="action-btn image-btn"
                        onClick={handleImageClick}
                        disabled={isPosting}
                        aria-label="Add image"
                    >
                        <span className="action-icon">🖼</span>
                        <span className="action-text">Image</span>
                    </button>

                    <button 
                        className="action-btn link-btn"
                        onClick={handleLinkClick}
                        disabled={isPosting}
                        aria-label="Add Link"
                    >
                        <span className="action-icon">🔗</span>
                        <span className="action-text">Link</span>
                    </button>
                </div>

                <button
                    className="post-btn"
                    onClick={handlePost}
                    disabled={isPosting || !postContent.trim()}
                >
                    {isPosting ? "Posting..." : "Post"}
                </button>
            </div>
        </div>
    );
};

export default PostCreator;