import { useState } from "react";
import Header from "../components/Header";
import UserProfile from "../components/UserProfile";

const ProfilePage = () => {
    const [showProfile, setShowProfile] = useState(true);

    return (
        <div className="profile-page">
            <Header />
            <main className="main-content">
                {showProfile ? (
                    <UserProfile />
                ) : (
                    <div>Edit Profile View Coming Soon!</div>
                )}
            </main>
        </div>
    );
};

export default ProfilePage;