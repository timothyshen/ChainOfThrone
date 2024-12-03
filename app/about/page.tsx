import { Shield, Sword, Scroll, Crown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutUs() {
    const teamMembers = [
        { name: "Elara Stormborn", role: "Lead Strategist", icon: Shield },
        { name: "Thorne Ironheart", role: "Blockchain Architect", icon: Sword },
        { name: "Lyra Moonshadow", role: "UX Enchanter", icon: Scroll },
        { name: "Zephyr Dawnbringer", role: "Smart Contract Sage", icon: Crown },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
            <div className="container mx-auto px-4 py-16">
                <header className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-white font-medieval mb-4">About Chain of Throne</h1>
                    <p className="text-xl text-gray-400">Forging the Future of Decentralized Diplomacy</p>
                </header>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <Card className="bg-black/60 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-2xl font-medieval text-white">Our Thesis</CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-300">
                            <p className="mb-4">
                                Chain of Throne stands at the intersection of blockchain technology and strategic gameplay. Our thesis is rooted in the belief that decentralized systems can revolutionize how we approach diplomacy, negotiation, and conflict resolution in virtual realms.
                            </p>
                            <p>
                                By leveraging smart contracts and tokenomics, we aim to create a truly fair and transparent gaming ecosystem where every decision has weight, every alliance has consequence, and every player has the power to shape the destiny of entire kingdoms.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-black/60 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-2xl font-medieval text-white">Our Vision</CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-300">
                            <p className="mb-4">
                                We envision a future where Chain of Throne becomes more than just a game – it becomes a platform for learning, collaboration, and innovation. Our goal is to create an immersive world where players can:
                            </p>
                            <ul className="list-disc list-inside space-y-2">
                                <li>Master the art of digital diplomacy</li>
                                <li>Experiment with novel governance models</li>
                                <li>Forge alliances that transcend traditional boundaries</li>
                                <li>Experience the true potential of decentralized decision-making</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <h2 className="text-3xl font-bold text-white font-medieval mb-8 text-center">Meet Our Team</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {teamMembers.map((member, index) => (
                        <Card key={index} className="bg-black/60 border-gray-800">
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="bg-gray-800 p-3 rounded-full mb-4">
                                        <member.icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                                    <p className="text-gray-400">{member.role}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

