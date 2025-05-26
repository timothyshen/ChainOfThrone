import React, { ReactNode } from 'react';
import { Header, Footer } from "@/components/layout";
import GameFooter from '@/components/layout/GameFooter';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div>
            <Header />
            <main className="flex-grow">{children}</main>
            <GameFooter />
        </div>
    );
};

export default Layout;
