export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-6">
        {/* Ashoka Chakra inspired spinner */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#138808] border-r-[#FF9933] animate-spin"
            style={{ animationDuration: "1s" }}
          ></div>
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#000080]"></div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <p className="text-sm font-bold tracking-widest text-[#138808] uppercase">
            Loading...
          </p>
          <p
            className="text-sm font-semibold text-[#FF9933]"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
          >
            लोड हो रहा है...
          </p>
        </div>

        {/* Brand */}
        <p className="text-xs text-gray-400 font-medium tracking-wide">
          DharaDrishti | धरादृष्टि
        </p>
      </div>
    </div>
  );
}
