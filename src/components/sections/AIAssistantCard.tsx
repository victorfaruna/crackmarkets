"use client";

const AIAssistantCard = () => {
  return (
    <div
      className="w-full h-full rounded-3xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #7AE25A 0%, #4db84e 50%, #2d8f2d 100%)",
      }}
    >
      {/* AI badge */}
      <div className="flex justify-end">
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 text-white text-[0.65rem] font-medium backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3">
            <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
          </svg>
          AI assistant
        </span>
      </div>

      {/* Rocket icon */}
      <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-6">
          <path d="M10.894 2.553a1 1 0 0 0-1.788 0l-7 14a1 1 0 0 0 1.169 1.409l5-1.429A1 1 0 0 0 9 15.571V11a1 1 0 1 1 2 0v4.571a1 1 0 0 0 .725.962l5 1.428a1 1 0 0 0 1.17-1.408l-7-14Z" />
        </svg>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-white font-clash-display text-xl font-semibold leading-tight">
          Advanced AI Analytics
        </p>
        <p className="text-white/80 text-[0.7rem] leading-relaxed">
          Use our AI assistant to gain deeper insights, advanced analytics, smarter decisions, personalized predictions, and real-time market intelligence.
        </p>
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {["#9b87f5", "#f97316", "#06b6d4"].map((color, i) => (
            <div
              key={i}
              className="size-7 rounded-full border-2 border-[#7AE25A] shrink-0"
              style={{ background: color }}
            />
          ))}
        </div>
        <div>
          <p className="text-white font-rubik font-semibold text-sm">7.8K+</p>
          <p className="text-white/70 text-[0.6rem]">People rely on us daily</p>
        </div>
      </div>

      {/* Decorative spiral */}
      <div
        className="absolute -bottom-6 -right-6 size-20 border-4 border-white/20 rounded-full"
        style={{ borderStyle: "dashed" }}
      />
      <div
        className="absolute -bottom-2 -right-2 size-10 border-4 border-white/30 rounded-full"
        style={{ borderStyle: "dashed" }}
      />
    </div>
  );
};

export default AIAssistantCard;
