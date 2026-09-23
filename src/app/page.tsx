import { redirect } from "next/navigation";

const HomePage = () => {
  redirect("/dashboard/profile");
};

export default HomePage;
