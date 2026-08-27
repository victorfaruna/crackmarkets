const Logo = ({ size = 18 }: { size?: number }) => {
  return (
    <div className={`flex items-center justify-center`}>
      <img src="/logo.webp" alt="Lgogo" className="size-5 rounded-sm" />
    </div>
  );
};

export default Logo;
