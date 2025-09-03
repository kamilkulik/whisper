export default function NavigationBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[200] bg-black/20 backdrop-blur-md shadow-lg">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <div className="text-white font-bold text-xl">WIECZORNY SZEPT 🌙</div>
        </div>
      </div>
    </nav>
  );
}
