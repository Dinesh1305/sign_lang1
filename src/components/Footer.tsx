interface FooterProps {
  darkMode: boolean;
}

export default function Footer({ darkMode }: FooterProps) {
  return (
    <footer className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md mt-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Prototype UI – Indian Sign Language (ISL)
        </p>
      </div>
    </footer>
  );
}
