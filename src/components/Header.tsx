interface HeaderProps {
  darkMode: boolean;
}

export default function Header({ darkMode }: HeaderProps) {
  return (
    <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className={`text-3xl sm:text-4xl font-bold ${darkMode ? 'text-teal-400' : 'text-teal-600'} text-center`}>
          Sign Language to Voice
        </h1>
        <p className={`text-center mt-2 text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Gesture-based communication assistant
        </p>
      </div>
    </header>
  );
}
