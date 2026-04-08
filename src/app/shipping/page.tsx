export const metadata = {
  title: "Shipping — FLY STORE",
  description: "Worldwide shipping and delivery timelines for FLY STORE.",
};

export default function ShippingPage() {
  return (
    <main className="relative min-h-screen bg-brand-black w-full overflow-x-hidden text-white pt-24 pb-16">
      
      <div className="container mx-auto px-6 md:px-12 max-w-4xl mt-32">
        <h1 className="text-5xl md:text-8xl font-heading uppercase font-bold mb-16 tracking-tighter">
          Shipping<br />& Delivery
        </h1>

        <div className="space-y-16 font-body text-sm md:text-base leading-relaxed tracking-wider">
          <section className="border-t border-brand-grey/20 pt-8">
            <h2 className="text-xl md:text-2xl font-heading uppercase font-bold mb-6 tracking-widest text-[#888]">
              01. Processing Time
            </h2>
            <p className="opacity-80">
              ALL ORDERS ARE PROCESSED WITHIN 1-3 BUSINESS DAYS. ORDERS ARE NOT SHIPPED OR DELIVERED ON WEEKENDS OR HOLIDAYS. IF WE ARE EXPERIENCING A HIGH VOLUME OF ORDERS, SHIPMENTS MAY BE DELAYED BY A FEW DAYS. PLEASE ALLOW ADDITIONAL DAYS IN TRANSIT FOR DELIVERY.
            </p>
          </section>

          <section className="border-t border-brand-grey/20 pt-8">
            <h2 className="text-xl md:text-2xl font-heading uppercase font-bold mb-6 tracking-widest text-[#888]">
              02. Domestic Shipping
            </h2>
            <p className="opacity-80 mb-4">
              WE OFFER STANDARD AND EXPRESS SHIPPING OPTIONS WITHIN THE COUNTRY.
            </p>
            <ul className="list-disc pl-5 opacity-80 space-y-2">
              <li>STANDARD (3-5 BUSINESS DAYS): COMPLIMENTARY ON ORDERS OVER ₹500.</li>
              <li>EXPRESS (1-2 BUSINESS DAYS): CALCULATED AT CHECKOUT.</li>
            </ul>
          </section>

          <section className="border-t border-brand-grey/20 pt-8">
            <h2 className="text-xl md:text-2xl font-heading uppercase font-bold mb-6 tracking-widest text-[#888]">
              03. International Shipping
            </h2>
            <p className="opacity-80 mb-4">
              WE SHIP WORLDWIDE. SHIPPING CHARGES FOR YOUR ORDER WILL BE CALCULATED AND DISPLAYED AT CHECKOUT. 
            </p>
            <p className="opacity-80">
              PLEASE NOTE THAT YOU ARE RESPONSIBLE FOR ANY CUSTOMS AND TAXES APPLIED TO YOUR ORDER. ALL FEES IMPOSED DURING OR AFTER SHIPPING ARE THE RESPONSIBILITY OF THE CUSTOMER (TARIFFS, TAXES, ETC.).
            </p>
          </section>

          <section className="border-t border-brand-grey/20 pt-8">
            <h2 className="text-xl md:text-2xl font-heading uppercase font-bold mb-6 tracking-widest text-[#888]">
              04. Order Tracking
            </h2>
            <p className="opacity-80">
              ONCE YOUR ORDER HAS SHIPPED, YOU WILL RECEIVE A SHIPMENT CONFIRMATION EMAIL CONTAINING YOUR TRACKING NUMBER(S). THE TRACKING NUMBER WILL BE ACTIVE WITHIN 24 HOURS.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
