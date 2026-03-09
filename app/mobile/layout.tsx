export default function MobileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            className="relative w-full h-full min-h-screen overflow-hidden theme-transition"
            style={{ background: "var(--bg-dark)" }}
        >
            {children}
        </div>
    );
}
