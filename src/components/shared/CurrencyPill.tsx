import Image from "next/image";

interface CurrencyPillProps {
  currencyUrl?: string;
  currencyName?: string;
  fiatCurrencyUrl?: string;
}

export default function CurrencyPill({
  currencyUrl = "/images/stablecoins/usdt.png",
  currencyName = "USDT",
  fiatCurrencyUrl = "/images/us.svg",
}: CurrencyPillProps) {
  return (
    <div className="w-fit self-start flex relative items-center gap-1.5 rounded-full bg-background py-1 px-1 pr-3 border border-secondary/10">
      {/* Overlapping pair: USDT + US Flag */}
      <div className="flex items-center -space-x-2">
        <Image
          className="size-4.5 rounded-full object-cover shrink-0 z-2 ring-1 ring-background"
          src={currencyUrl || "/images/stablecoins/usdt.png"}
          alt={currencyName}
          width={18}
          height={18}
        />
        <Image
          className="size-4.5 rounded-full object-cover shrink-0 z-1"
          src={fiatCurrencyUrl || "/images/us.svg"}
          alt="US Flag"
          width={18}
          height={18}
        />
      </div>

      <p className="text-[0.7rem] font-semibold text-secondary/80">
        {currencyName}
      </p>
    </div>
  );
}
