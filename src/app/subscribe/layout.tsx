import NavigationBar from "../_components/NavigationBar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-indigo-900 to-[#2A031E]">
      {/* Background Orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/40 rounded-full blur-2xl heartbeat"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-3xl"></div>
      </div>

      <NavigationBar />

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="px-6 pt-12 text-center">{children}</div>
      </div>
    </div>
  );
}
