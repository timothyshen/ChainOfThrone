"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

interface GameCompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
}
// TODO: Add a winner to the modal
// TODO: Add tie condition

export default function GameCompleteModal({ isOpen, onClose }: GameCompleteModalProps) {
    const router = useRouter();

    const handleExploreGames = () => {
        router.push("/explore");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        Game Completed!
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Congratulations! The game has been completed.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <p className="text-center text-muted-foreground">
                        Thank you for playing! Would you like to explore more games?
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button onClick={handleExploreGames}>
                            Explore Games
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 