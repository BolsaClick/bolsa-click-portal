type TabButtonProps = {
  isActive: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
};


export const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, label, icon }) => {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-102 w-[200px] ${
        isActive 
          ? 'bg-dark-green text-white shadow-sm' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
};