import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profile | Chain of Thrones",
    description: "View your game history and statistics",
};

import ProfilePage from "@/components/profile/ProfilePage";

export default function Profile() {
    return <ProfilePage />;
} 