export default function MobileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative w-full h-full min-h-screen bg-gray-950 overflow-hidden">
            {children}
        </div>
    );
}
