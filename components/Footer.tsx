function Footer() {
    const currentYear = new Date().getFullYear()
    return (
        <footer className="bg-primary text-primary-foreground py-4 mt-8">
            <div className="container mx-auto px-4 text-center">
                <p>&copy; {currentYear} Idea Hub. All rights reserved.</p>
                <p className="mt-2 text-sm">Powered by Story</p>
            </div>
        </footer>
    )
}

export default Footer   