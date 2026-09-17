import Image from "next/image";

const Logo = ({ size = 18 }: { size?: number }) => {
  return (
    <div className={`flex items-center justify-center`}>
      <Image src="/logo.webp" alt="Trackmarkets" width={size} height={size} className="rounded-sm" />
    </div>
  );
};

export default Logo;
