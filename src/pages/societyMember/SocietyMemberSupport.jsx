import React, { useState } from "react";

import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock3,
  HelpCircle,
  ChevronDown,
  CreditCard,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Headphones,
  Navigation,
  AlertCircle,
  FileQuestion,
} from "lucide-react";


function SocietyMemberSupport() {

  const [openFaq, setOpenFaq] =
    useState(null);


  // =====================================================
  // SUPPORT DETAILS
  // CHANGE THESE FOR YOUR BUSINESS
  // =====================================================

  const support = {

    phone: "8696755781",

    whatsapp: "8696755781",

    email:
      "support@srmfinance.com",

    address:
      "SRM Finance Office, Manpur ,  Dausa , Rajasthan",

    workingHours:
      "Monday - Saturday · 9:30 AM - 6:30 PM",

  };


  // =====================================================
  // FAQ
  // =====================================================

  const faqs = [

    {
      id: 1,
      icon: CreditCard,
      question:
        "Why is my installment showing as pending?",
      answer:
        "An installment is shown as pending when its payment has not yet been recorded in your account. Check your Saving and Passbook sections first. If you have already paid, contact the office with your Member ID and payment details."
    },

    {
      id: 2,
      icon: CreditCard,
      question:
        "Why has a penalty been added?",
      answer:
        "A penalty may be applied when an installment is not paid within the applicable due period. Your current penalty and pending amount are shown in your member account."
    },

    {
      id: 3,
      icon: Landmark,
      question:
        "Where can I see my loan details?",
      answer:
        "Open the Loan section from the Society Member portal. You can view your loan amount, outstanding balance, EMI details, paid EMIs, pending EMIs and payment history."
    },

    {
      id: 4,
      icon: FileQuestion,
      question:
        "Where can I see my complete payment history?",
      answer:
        "Open the Passbook section. Your recorded installment payments, dates, amounts, penalties and payment methods are displayed there."
    },

    {
      id: 5,
      icon: LockKeyhole,
      question:
        "I forgot my password. What should I do?",
      answer:
        "Contact the SRM Finance office using the phone or WhatsApp option on this page. Keep your registered mobile number and Member ID ready for account verification."
    },

    {
      id: 6,
      icon: Phone,
      question:
        "My mobile number or profile details are incorrect.",
      answer:
        "Contact the office and provide your Member ID and registered mobile number. The administrator can verify your account and update the required information."
    },

    {
      id: 7,
      icon: AlertCircle,
      question:
        "My payment was made but is not visible.",
      answer:
        "First check your Passbook and Saving section after refreshing the page. If the payment is still missing, contact support and provide the payment date, amount and Member ID."
    },

    {
      id: 8,
      icon: ShieldCheck,
      question:
        "Is my account information secure?",
      answer:
        "Your member portal is intended for your authenticated account. Never share your password, OTP or login credentials with anyone."
    },

    {
      id: 9,
      icon: HelpCircle,
      question:
        "What information should I provide to support?",
      answer:
        "Provide your Member ID, registered mobile number and a clear description of the issue. For payment-related problems, also provide the payment date and amount."
    },

  ];


  // =====================================================
  // ACTIONS
  // =====================================================

  const callSupport = () => {

    window.location.href =
      `tel:${support.phone}`;

  };


  const openWhatsApp = () => {

    const message =
      "Hello SRM Finance Support, I need help with my Society Member account.";

    const url =
      `https://wa.me/91${support.whatsapp}?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  };


  const sendEmail = () => {

    window.location.href =
      `mailto:${support.email}`;

  };


  const openMap = () => {

    const url =
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        support.address
      )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  };


  return (

    <div className="
      mx-auto
      w-full
      max-w-3xl
      space-y-5
      pb-8
      sm:space-y-6
    ">


      {/* =================================================
          HEADER
      ================================================= */}

      <section>

        <p className="
          text-xs
          font-semibold
          text-slate-400
        ">
          Help & Assistance
        </p>

        <h1 className="
          mt-1
          text-2xl
          font-black
          tracking-tight
          text-slate-950
        ">
          Support Center
        </h1>

        <p className="
          mt-2
          max-w-xl
          text-xs
          leading-5
          text-slate-500
          sm:text-sm
        ">
          Get help with your society account,
          payments, savings, loans and login.
        </p>

      </section>


      {/* =================================================
          MAIN SUPPORT CARD
      ================================================= */}

      <section className="
        overflow-hidden
        rounded-3xl
        bg-gradient-to-br
        from-blue-700
        via-blue-600
        to-indigo-700
        p-5
        text-white
        shadow-[0_15px_40px_rgba(37,99,235,0.18)]
        sm:p-6
      ">

        <div className="
          flex
          items-start
          gap-4
        ">

          <div className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-white/10
            ring-1
            ring-white/15
          ">

            <Headphones
              size={23}
              strokeWidth={2}
            />

          </div>


          <div className="
            min-w-0
          ">

            <p className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-blue-100
            ">
              Member Assistance
            </p>

            <h2 className="
              mt-1
              text-lg
              font-extrabold
              sm:text-xl
            ">
              SRM Finance Support
            </h2>

            <p className="
              mt-1.5
              text-xs
              leading-5
              text-blue-100
              sm:text-sm
            ">
              Our support team can help you
              with your society account and
              payment-related questions.
            </p>

          </div>

        </div>


        {/* ACTIONS */}

        <div className="
          mt-5
          grid
          grid-cols-2
          gap-2
          sm:grid-cols-3
        ">

          <button
            type="button"
            onClick={callSupport}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-white
              px-3
              py-3
              text-xs
              font-extrabold
              text-blue-700
              transition
              hover:bg-blue-50
              active:scale-[0.98]
            "
          >

            <Phone
              size={16}
            />

            Call

          </button>


          <button
            type="button"
            onClick={openWhatsApp}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/15
              bg-white/10
              px-3
              py-3
              text-xs
              font-extrabold
              text-white
              transition
              hover:bg-white/15
              active:scale-[0.98]
            "
          >

            <MessageCircle
              size={16}
            />

            WhatsApp

          </button>


          <button
            type="button"
            onClick={sendEmail}
            className="
              col-span-2
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/15
              bg-white/10
              px-3
              py-3
              text-xs
              font-extrabold
              text-white
              transition
              hover:bg-white/15
              active:scale-[0.98]
              sm:col-span-1
            "
          >

            <Mail
              size={16}
            />

            Email

          </button>

        </div>

      </section>


      {/* =================================================
          OFFICE INFORMATION
      ================================================= */}

      <section className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
      ">

        <div className="
          border-b
          border-slate-100
          px-4
          py-4
        ">

          <div className="
            flex
            items-center
            gap-2
          ">

            <Landmark
              size={17}
              className="text-blue-600"
            />

            <h2 className="
              text-sm
              font-bold
              text-slate-900
            ">
              Office Information
            </h2>

          </div>

        </div>


        <div className="
          divide-y
          divide-slate-100
        ">


          {/* PHONE */}

          <button
            type="button"
            onClick={callSupport}
            className="
              flex
              w-full
              items-center
              justify-between
              gap-3
              px-4
              py-4
              text-left
              transition
              hover:bg-slate-50
            "
          >

            <div className="
              flex
              min-w-0
              items-center
              gap-3
            ">

              <div className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-blue-600
              ">

                <Phone
                  size={17}
                />

              </div>


              <div>

                <p className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-400
                ">
                  Phone
                </p>

                <p className="
                  mt-0.5
                  text-sm
                  font-bold
                  text-slate-800
                ">
                  {support.phone}
                </p>

              </div>

            </div>


            <Phone
              size={15}
              className="text-slate-300"
            />

          </button>


          {/* WHATSAPP */}

          <button
            type="button"
            onClick={openWhatsApp}
            className="
              flex
              w-full
              items-center
              justify-between
              gap-3
              px-4
              py-4
              text-left
              transition
              hover:bg-slate-50
            "
          >

            <div className="
              flex
              min-w-0
              items-center
              gap-3
            ">

              <div className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-emerald-50
                text-emerald-600
              ">

                <MessageCircle
                  size={17}
                />

              </div>


              <div>

                <p className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-400
                ">
                  WhatsApp
                </p>

                <p className="
                  mt-0.5
                  text-sm
                  font-bold
                  text-slate-800
                ">
                  {support.whatsapp}
                </p>

              </div>

            </div>


            <MessageCircle
              size={15}
              className="text-slate-300"
            />

          </button>


          {/* EMAIL */}

          <button
            type="button"
            onClick={sendEmail}
            className="
              flex
              w-full
              items-center
              justify-between
              gap-3
              px-4
              py-4
              text-left
              transition
              hover:bg-slate-50
            "
          >

            <div className="
              flex
              min-w-0
              items-center
              gap-3
            ">

              <div className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-violet-50
                text-violet-600
              ">

                <Mail
                  size={17}
                />

              </div>


              <div className="min-w-0">

                <p className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-400
                ">
                  Email
                </p>

                <p className="
                  mt-0.5
                  truncate
                  text-sm
                  font-bold
                  text-slate-800
                ">
                  {support.email}
                </p>

              </div>

            </div>


            <Mail
              size={15}
              className="text-slate-300"
            />

          </button>


          {/* ADDRESS */}

          <button
            type="button"
            onClick={openMap}
            className="
              flex
              w-full
              items-start
              justify-between
              gap-3
              px-4
              py-4
              text-left
              transition
              hover:bg-slate-50
            "
          >

            <div className="
              flex
              min-w-0
              items-start
              gap-3
            ">

              <div className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-rose-50
                text-rose-600
              ">

                <MapPin
                  size={17}
                />

              </div>


              <div className="
                min-w-0
              ">

                <p className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-400
                ">
                  Office Address
                </p>

                <p className="
                  mt-0.5
                  text-sm
                  font-bold
                  leading-5
                  text-slate-800
                ">
                  {support.address}
                </p>

              </div>

            </div>


            <Navigation
              size={15}
              className="
                shrink-0
                text-slate-300
              "
            />

          </button>


          {/* HOURS */}

          <div className="
            flex
            items-center
            gap-3
            px-4
            py-4
          ">

            <div className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-amber-50
              text-amber-600
            ">

              <Clock3
                size={17}
              />

            </div>


            <div>

              <p className="
                text-[10px]
                font-bold
                uppercase
                tracking-wide
                text-slate-400
              ">
                Working Hours
              </p>

              <p className="
                mt-0.5
                text-sm
                font-bold
                leading-5
                text-slate-800
              ">
                {support.workingHours}
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          QUICK HELP
      ================================================= */}

      <section>

        <div className="
          mb-3
          flex
          items-center
          gap-2
        ">

          <HelpCircle
            size={17}
            className="text-blue-600"
          />

          <h2 className="
            text-sm
            font-bold
            text-slate-900
          ">
            Quick Help
          </h2>

        </div>


        <div className="
          grid
          grid-cols-2
          gap-3
        ">

          <QuickHelp
            icon={CreditCard}
            title="Payments"
            description="Installment or penalty"
          />

          <QuickHelp
            icon={Landmark}
            title="Loans"
            description="EMI and loan details"
          />

          <QuickHelp
            icon={LockKeyhole}
            title="Login"
            description="Password and access"
          />

          <QuickHelp
            icon={FileQuestion}
            title="Account"
            description="Profile information"
          />

        </div>

      </section>


      {/* =================================================
          FAQ
      ================================================= */}

      <section className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
      ">

        <div className="
          border-b
          border-slate-100
          px-4
          py-4
        ">

          <h2 className="
            text-sm
            font-bold
            text-slate-900
          ">
            Frequently Asked Questions
          </h2>

          <p className="
            mt-1
            text-[11px]
            text-slate-400
          ">
            Common questions from society members
          </p>

        </div>


        <div className="
          divide-y
          divide-slate-100
        ">

          {faqs.map((faq) => {

            const Icon =
              faq.icon;

            const isOpen =
              openFaq === faq.id;


            return (

              <div
                key={faq.id}
              >

                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq(
                      isOpen
                        ? null
                        : faq.id
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-3
                    px-4
                    py-4
                    text-left
                    transition
                    hover:bg-slate-50
                  "
                >

                  <div className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                  ">

                    <div className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-50
                      text-blue-600
                    ">

                      <Icon
                        size={16}
                      />

                    </div>


                    <span className="
                      text-xs
                      font-bold
                      leading-5
                      text-slate-700
                    ">
                      {faq.question}
                    </span>

                  </div>


                  <ChevronDown
                    size={17}
                    className={`
                      shrink-0
                      text-slate-400
                      transition-transform
                      ${
                        isOpen
                          ? "rotate-180"
                          : ""
                      }
                    `}
                  />

                </button>


                {isOpen && (

                  <div className="
                    border-t
                    border-slate-100
                    bg-slate-50
                    px-4
                    py-4
                  ">

                    <p className="
                      text-xs
                      leading-6
                      text-slate-600
                    ">
                      {faq.answer}
                    </p>

                  </div>

                )}

              </div>

            );

          })}

        </div>

      </section>


      {/* =================================================
          SECURITY NOTICE
      ================================================= */}

      <section className="
        flex
        items-start
        gap-3
        rounded-2xl
        border
        border-emerald-100
        bg-emerald-50
        p-4
      ">

        <div className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-emerald-100
          text-emerald-600
        ">

          <ShieldCheck
            size={19}
          />

        </div>


        <div>

          <p className="
            text-xs
            font-bold
            text-emerald-800
          ">
            Security Reminder
          </p>

          <p className="
            mt-1
            text-[11px]
            leading-5
            text-emerald-700
          ">
            Never share your password,
            OTP or account credentials with
            anyone.
          </p>

        </div>

      </section>

    </div>
  );
}


// =====================================================
// QUICK HELP CARD
// =====================================================

function QuickHelp({
  icon: Icon,
  title,
  description
}) {

  return (

    <div className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-4
    ">

      <div className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-xl
        bg-blue-50
        text-blue-600
      ">

        <Icon
          size={17}
        />

      </div>


      <p className="
        mt-3
        text-xs
        font-bold
        text-slate-800
      ">
        {title}
      </p>


      <p className="
        mt-1
        text-[10px]
        leading-4
        text-slate-400
      ">
        {description}
      </p>

    </div>

  );
}


export default SocietyMemberSupport;