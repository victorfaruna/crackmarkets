import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen text-center">
      <div className="flex flex-col gap-4">
        <p className="text-5xl font-medium">404</p>
        <p className="text-lg font-medium">Page Not Found</p>
        <p className="text-sm text-subtext">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/dashboard"
          className="bg-secondary text-primary px-8 py-3 rounded-full w-fit mx-auto"
        >
          Go back to dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
