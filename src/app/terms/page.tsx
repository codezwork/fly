export const metadata = {
  title: "Terms & Conditions — FLY STORE",
  description: "Legal terms and conditions of use for FLY STORE.",
};

export default function TermsPage() {
  return (
    <main className="relative min-h-screen bg-brand-black w-full overflow-x-hidden text-white pt-24 pb-16">
      
      <div className="container mx-auto px-6 md:px-12 max-w-4xl mt-32">
        <h1 className="text-5xl md:text-8xl font-heading uppercase font-bold mb-16 tracking-tighter mix-blend-exclusion">
          Terms<br />Of Service
        </h1>

        <div className="space-y-16 font-body text-sm md:text-base leading-relaxed tracking-wider">
          <section className="border-t border-brand-grey/20 pt-8">
            <h2 className="text-xl md:text-2xl font-heading uppercase font-bold mb-6 tracking-widest text-[#888]">
              01. General
            </h2>
            <p className="opacity-80 uppercase">
              BY ACCESSING AND PLACING AN ORDER WITH FLY STORE, YOU CONFIRM THAT YOU ARE IN AGREEMENT WITH AND BOUND BY THE TERMS OF SERVICE CONTAINED IN THE TERMS & CONDITIONS OUTLINED BELOW. THESE TERMS APPLY TO THE ENTIRE WEBSITE AND ANY EMAIL OR OTHER TYPE OF COMMUNICATION BETWEEN YOU AND FLY STORE.
            </p>
          </section>

          <section className="border-t border-brand-grey/20 pt-8">
            <h2 className="text-xl md:text-2xl font-heading uppercase font-bold mb-6 tracking-widest text-[#888]">
              02. Products & Pricing
            </h2>
            <p className="opacity-80 uppercase mb-4">
              ALL PRODUCTS AND PRICES DISPLAYED ON THE WEBSITE ARE SUBJECT TO CHANGE AT ANY TIME WITHOUT NOTICE. WE RESERVE THE RIGHT TO DISCONTINUE ANY PRODUCT AT ANY TIME.
            </p>
            <p className="opacity-80 uppercase">
              WE HAVE MADE EVERY EFFORT TO DISPLAY AS ACCURATELY AS POSSIBLE THE COLORS AND IMAGES OF OUR PRODUCTS THAT APPEAR AT THE STORE. WE CANNOT GUARANTEE THAT YOUR COMPUTER MONITOR'S DISPLAY OF ANY COLOR WILL BE ACCURATE.
            </p>
          </section>

          <section className="border-t border-brand-grey/20 pt-8">
            <h2 className="text-xl md:text-2xl font-heading uppercase font-bold mb-6 tracking-widest text-[#888]">
              03. Returns & Refunds
            </h2>
            <p className="opacity-80 uppercase mb-4">
              DUE TO THE EXCLUSIVE NATURE OF OUR DROPS, ALL SALES ARE FINAL. EXCHANGES MAY BE CONSIDERED WITHIN 7 DAYS OF RECEIPT FOR DEFECTIVE OR DAMAGED ITEMS ONLY. 
            </p>
            <p className="opacity-80 uppercase">
              PLEASE CONTACT OUR CONCIERGE SERVICE TO INITIATE A REVIEW OF YOUR ITEM.
            </p>
          </section>

          <section className="border-t border-brand-grey/20 pt-8">
            <h2 className="text-xl md:text-2xl font-heading uppercase font-bold mb-6 tracking-widest text-[#888]">
              04. Intellectual Property
            </h2>
            <p className="opacity-80 uppercase">
              ALL CONTENT INCLUDED ON THE SITE, SUCH AS TEXT, GRAPHICS, LOGOS, IMAGES, AUDIO CLIPS, DIGITAL DOWNLOADS, AND DATA COMPILATIONS IS THE PROPERTY OF FLY STORE AND PROTECTED BY INTERNATIONAL COPYRIGHT LAWS.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
