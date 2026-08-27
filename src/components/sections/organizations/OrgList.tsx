import { getProfileImage } from "@/src/lib/utils/profileHandler";
import EmptyContent from "../../shared/EmptyContent";
import Link from "next/link";
import { useEffect } from "react";
import Image from "next/image";
import CurrencyPill from "../../shared/CurrencyPill";

interface OrgListProps {
  data: any;
  isLoading: boolean;
  isError: boolean;
}

const SkeletonItem = () => (
  <div className="border-[0.5px] bg-primary/80 border-secondary/10 h-40 rounded-lg p-3 flex flex-col justify-between">
    <div className="flex flex-col gap-2">
      <div className="skeleton size-8 rounded-xl"></div>
      <div className="skeleton h-2 w-20 rounded-xl"></div>
      <div className="skeleton h-2 w-12  rounded-xl"></div>
    </div>

    <div className="flex justify-between items-center">
      <div className="skeleton h-2 w-20 rounded-xl"></div>
      <div className="skeleton h-5 w-15 rounded-full"></div>
    </div>
  </div>
);
const OrgList = ({ data, isLoading, isError }: OrgListProps) => {
  useEffect(() => {
    if (!isLoading) {
      console.log(JSON.stringify(data));
    }
  }, [data]);
  return (
    <>
      <div
        className="grid gap-3 gap-y-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}
      >
        {isLoading || isError
          ? Array.from({ length: 15 }).map((_, idx) => (
              <SkeletonItem key={idx} />
            ))
          : data?.map((item: any) => (
              <Link href={"/dashboard/" + item.slug} key={item.id}>
                <div className="bg-primary h-40 border border-subtext/25 rounded-lg flex flex-col p-3 justify-between">
                  {/* top */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <img
                        className="size-8 rounded-xl object-cover"
                        src={item.logoUrl || getProfileImage(item?.slug)}
                        alt={item?.name}
                      />
                      <div className="flex flex-col">
                        <p className="text-secondary leading-none font-medium">
                          {item.name}
                        </p>
                        <p className="text-subtext text-[0.7rem] font-medium">
                          {item?.slug}
                        </p>
                      </div>
                    </div>

                    <button className="px-1 py-1.5 rounded-sm hover:bg-secondary/5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* bottom */}
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <p className="text-[0.7rem] flex items-center gap-1 font-semibold leading-none text-secondary/60">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                        />
                      </svg>
                      <span className="text-secondary">
                        {item.totalMembers}{" "}
                      </span>
                      {item.totalMembers == 1 ? "Recipient" : "Recipients"}
                    </p>
                    <CurrencyPill
                      currencyName={item.currency.name}
                      currencyUrl={item.currency.logoUrl}
                      fiatCurrencyUrl={item.currency.fiatLogoUrl}
                    />
                  </div>
                </div>
              </Link>
            ))}
      </div>
      {data?.length < 1 && (
        <div className="w-full">
          <EmptyContent />
        </div>
      )}
    </>
  );
};

export default OrgList;
