import React from "react";
import {
  ShieldCheck,
  LockKeyhole,
  WalletCards,
  ReceiptText,
  UserCheck,
  AlertTriangle,
  Scale,
  FileText,
  Ban,
  RefreshCcw,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const sections = [
  {
    id: "acceptance",
    number: "01",
    icon: UserCheck,
    title: "Acceptance & Authorized Use / स्वीकृति एवं अधिकृत उपयोग",
    content: [
      "This system is provided to authorized agents for performing assigned financial collection and account-management activities. / यह सिस्टम अधिकृत एजेंटों को सौंपे गए वित्तीय संग्रह और खाता-प्रबंधन कार्यों को करने के लिए प्रदान किया गया है।",
      "By accessing the Agent Dashboard, you agree to follow these Terms & Conditions, internal policies, and instructions issued by the organization. / एजेंट डैशबोर्ड का उपयोग करके आप इन नियम एवं शर्तों, आंतरिक नीतियों और संगठन द्वारा जारी निर्देशों का पालन करने के लिए सहमत होते हैं।",
      "Your login credentials are personal and must not be shared with another person. / आपके लॉगिन क्रेडेंशियल व्यक्तिगत हैं और इन्हें किसी अन्य व्यक्ति के साथ साझा नहीं किया जाना चाहिए।",
      "The system may only be used for legitimate business purposes authorized by the organization. / सिस्टम का उपयोग केवल संगठन द्वारा अधिकृत वैध व्यावसायिक उद्देश्यों के लिए किया जा सकता है।",
    ],
  },
  {
    id: "privacy",
    number: "02",
    icon: LockKeyhole,
    title: "Member Information & Privacy / सदस्य जानकारी एवं गोपनीयता",
    highlight: true,
    content: [
      "Member information is confidential and must be handled responsibly at all times. / सदस्य की जानकारी गोपनीय है और हर समय जिम्मेदारी से संभाली जानी चाहिए।",
      "Agents must never misuse, copy, sell, publish, transfer, download, photograph, screenshot, or disclose member information for personal or unauthorized purposes. / एजेंट व्यक्तिगत या अनधिकृत उद्देश्यों के लिए सदस्य की जानकारी का दुरुपयोग, कॉपी, बिक्री, प्रकाशन, हस्तांतरण, डाउनलोड, फोटो, स्क्रीनशॉट या खुलासा कभी नहीं कर सकते।",
      "Member information may only be accessed when it is necessary to perform an assigned responsibility. / सदस्य की जानकारी केवल सौंपे गए कार्य को पूरा करने के लिए आवश्यक होने पर ही एक्सेस की जा सकती है।",
      "Information such as name, mobile number, address, identification details, financial records, loan information, savings information, and payment history must be treated as confidential. / नाम, मोबाइल नंबर, पता, पहचान विवरण, वित्तीय रिकॉर्ड, ऋण जानकारी, बचत जानकारी और भुगतान इतिहास जैसी जानकारी को गोपनीय माना जाना चाहिए।",
      "Member information must not be shared with friends, family members, third parties, or unauthorized employees. / सदस्य की जानकारी दोस्तों, परिवार के सदस्यों, तीसरे पक्ष या अनधिकृत कर्मचारियों के साथ साझा नहीं की जानी चाहिए।",
    ],
  },
  {
    id: "credentials",
    number: "03",
    icon: ShieldCheck,
    title: "Account & Login Security / खाता एवं लॉगिन सुरक्षा",
    content: [
      "Keep your username, password, PIN, OTP, and other authentication information confidential. / अपना यूजरनेम, पासवर्ड, PIN, OTP और अन्य प्रमाणीकरण जानकारी गोपनीय रखें।",
      "Do not allow another person to operate the Agent Dashboard using your account. / किसी अन्य व्यक्ति को अपने खाते से एजेंट डैशबोर्ड चलाने की अनुमति न दें।",
      "Immediately report suspected unauthorized access or compromised credentials to the appropriate administrator. / संदिग्ध अनधिकृत एक्सेस या क्रेडेंशियल से छेड़छाड़ की सूचना तुरंत संबंधित प्रशासक को दें।",
      "Always log out when using a shared or public device. / साझा या सार्वजनिक डिवाइस का उपयोग करने के बाद हमेशा लॉग आउट करें।",
    ],
  },
  {
    id: "collection",
    number: "04",
    icon: WalletCards,
    title: "Daily Saving & EMI Collection / दैनिक बचत एवं EMI संग्रह",
    content: [
      "All collections must be recorded through the authorized finance system. / सभी संग्रह अधिकृत वित्तीय सिस्टम के माध्यम से दर्ज किए जाने चाहिए।",
      "An agent may collect only those payments that they are authorized to collect. / एजेंट केवल उन्हीं भुगतानों का संग्रह कर सकता है जिनके लिए उसे अधिकृत किया गया है।",
      "The actual collection amount, payment method, collection date, and payment-for date must be entered accurately. / वास्तविक संग्रह राशि, भुगतान का माध्यम, संग्रह की तारीख और भुगतान किस तारीख/किस्त के लिए है, यह सही-सही दर्ज किया जाना चाहिए।",
      "Agents must not create duplicate transactions or intentionally manipulate collection records. / एजेंट डुप्लिकेट लेनदेन नहीं बना सकते और न ही जानबूझकर संग्रह रिकॉर्ड में हेरफेर कर सकते हैं।",
      "A payment must not be marked as collected unless the money has actually been received. / जब तक धन वास्तव में प्राप्त न हो, किसी भुगतान को संग्रहित के रूप में चिह्नित नहीं किया जाना चाहिए।",
      "Pending EMIs must be collected according to the applicable account terms and configured collection rules. / लंबित EMI को संबंधित खाते की शर्तों और निर्धारित संग्रह नियमों के अनुसार एकत्र किया जाना चाहिए।",
    ],
  },
  {
    id: "receipts",
    number: "05",
    icon: ReceiptText,
    title: "Payments & Receipts / भुगतान एवं रसीदें",
    content: [
      "Every financial collection must have an appropriate system record or receipt as required by the organization. / प्रत्येक वित्तीय संग्रह का संगठन की आवश्यकता के अनुसार उचित सिस्टम रिकॉर्ड या रसीद होना आवश्यक है।",
      "Never create a false, duplicate, altered, or misleading receipt. / कभी भी झूठी, डुप्लिकेट, बदली हुई या भ्रामक रसीद न बनाएं।",
      "Never collect an amount that is different from the authorized amount unless the system and organization permit such collection. / अधिकृत राशि से अलग राशि कभी न लें, जब तक सिस्टम और संगठन इसकी अनुमति न दें।",
      "Collected funds must be handled and deposited according to the organization's prescribed procedure. / एकत्रित धनराशि को संगठन द्वारा निर्धारित प्रक्रिया के अनुसार संभालना और जमा करना चाहिए।",
      "Any discrepancy between collected cash and system records must be reported immediately. / एकत्रित नकदी और सिस्टम रिकॉर्ड के बीच किसी भी अंतर की सूचना तुरंत दी जानी चाहिए।",
    ],
  },
  {
    id: "interest",
    number: "06",
    icon: Scale,
    title: "Interest, Penalties & Charges / ब्याज, दंड एवं शुल्क",
    content: [
      "Interest, penalties, fees, and other charges must follow the applicable account configuration and organizational policy. / ब्याज, दंड, शुल्क और अन्य चार्ज संबंधित खाते की सेटिंग और संगठन की नीति के अनुसार होने चाहिए।",
      "Agents must not independently change interest rates, penalty rates, loan amounts, EMI amounts, or repayment schedules. / एजेंट अपनी ओर से ब्याज दर, दंड दर, ऋण राशि, EMI राशि या भुगतान अनुसूची में बदलाव नहीं कर सकते।",
      "No unauthorized fee or additional charge may be demanded from a member. / सदस्य से कोई अनधिकृत शुल्क या अतिरिक्त राशि नहीं मांगी जा सकती।",
      "If a member disputes an interest or penalty calculation, the issue must be referred to the authorized administrator. / यदि कोई सदस्य ब्याज या दंड की गणना पर आपत्ति करता है, तो मामला अधिकृत प्रशासक को भेजा जाना चाहिए।",
    ],
  },
  {
    id: "recovery",
    number: "07",
    icon: UserCheck,
    title: "Fair & Respectful Collection / निष्पक्ष एवं सम्मानजनक संग्रह",
    content: [
      "Members must be treated respectfully and professionally during every interaction. / प्रत्येक बातचीत में सदस्यों के साथ सम्मानजनक और पेशेवर व्यवहार किया जाना चाहिए।",
      "Threatening, abusive, intimidating, humiliating, or harassing a member is strictly prohibited. / किसी सदस्य को धमकाना, गाली देना, डराना, अपमानित करना या परेशान करना सख्त रूप से प्रतिबंधित है।",
      "Agents must not use physical force, threats, public humiliation, or inappropriate pressure to recover money. / धन की वसूली के लिए एजेंट शारीरिक बल, धमकी, सार्वजनिक अपमान या अनुचित दबाव का उपयोग नहीं कर सकते।",
      "Collection discussions should remain professional and limited to legitimate account-related matters. / संग्रह से संबंधित बातचीत पेशेवर और केवल वैध खाता-संबंधी विषयों तक सीमित रहनी चाहिए।",
      "Any difficult or disputed recovery matter should be escalated to the appropriate administrator. / किसी भी कठिन या विवादित वसूली मामले को संबंधित प्रशासक तक पहुंचाया जाना चाहिए।",
    ],
  },
  {
    id: "fraud",
    number: "08",
    icon: Ban,
    title: "Fraud, Misuse & Unauthorized Activity / धोखाधड़ी, दुरुपयोग एवं अनधिकृत गतिविधि",
    warning: true,
    content: [
      "Fraudulent transactions, fake receipts, false collection entries, manipulation of payment dates, unauthorized discounts, or misappropriation of collected money are prohibited. / धोखाधड़ी वाले लेनदेन, नकली रसीदें, गलत संग्रह प्रविष्टियां, भुगतान तिथियों में हेरफेर, अनधिकृत छूट या एकत्रित धन का दुरुपयोग प्रतिबंधित है।",
      "Agents must not use another agent's account or credentials. / एजेंट किसी अन्य एजेंट के खाते या क्रेडेंशियल का उपयोग नहीं कर सकते।",
      "Agents must not alter, delete, or manipulate financial records without proper authorization. / उचित अनुमति के बिना एजेंट वित्तीय रिकॉर्ड को बदल, हटा या उनमें हेरफेर नहीं कर सकते।",
      "Using member information for personal business, marketing, lending, solicitation, or any unrelated purpose is prohibited. / सदस्य की जानकारी का व्यक्तिगत व्यवसाय, मार्केटिंग, ऋण देने, संपर्क/प्रचार या किसी असंबंधित उद्देश्य के लिए उपयोग प्रतिबंधित है।",
      "Suspected fraud or financial misconduct must be reported immediately. / संदिग्ध धोखाधड़ी या वित्तीय कदाचार की सूचना तुरंत दी जानी चाहिए।",
    ],
  },
  {
    id: "records",
    number: "09",
    icon: FileText,
    title: "Accuracy of Financial Records / वित्तीय रिकॉर्ड की शुद्धता",
    content: [
      "All information entered into the system must be accurate and complete. / सिस्टम में दर्ज की गई सभी जानकारी सही और पूर्ण होनी चाहिए।",
      "Collection dates and payment-for dates must represent the actual transaction accurately. / संग्रह की तारीख और भुगतान किस तारीख/किस्त के लिए है, यह वास्तविक लेनदेन को सही रूप से दर्शाना चाहिए।",
      "Agents are responsible for reviewing transaction details before confirming a collection. / संग्रह की पुष्टि करने से पहले लेनदेन विवरण की समीक्षा करना एजेंट की जिम्मेदारी है।",
      "Errors must not be intentionally concealed or modified to avoid detection. / गलतियों को छिपाने या पकड़े जाने से बचने के लिए जानबूझकर बदला नहीं जाना चाहिए।",
      "Any incorrect transaction should be reported through the organization's correction procedure. / किसी भी गलत लेनदेन की सूचना संगठन की सुधार प्रक्रिया के माध्यम से दी जानी चाहिए।",
    ],
  },
  {
    id: "security",
    number: "10",
    icon: ShieldCheck,
    title: "Data & Device Security / डेटा एवं डिवाइस सुरक्षा",
    content: [
      "Use only authorized devices and systems whenever possible. / जहां संभव हो, केवल अधिकृत डिवाइस और सिस्टम का उपयोग करें।",
      "Do not store member financial information in personal notes, unsecured files, messaging applications, or personal cloud storage. / सदस्य की वित्तीय जानकारी को व्यक्तिगत नोट्स, असुरक्षित फाइलों, मैसेजिंग ऐप या व्यक्तिगत क्लाउड स्टोरेज में न रखें।",
      "Do not take unnecessary screenshots or photographs of member records. / सदस्य रिकॉर्ड के अनावश्यक स्क्रीनशॉट या फोटो न लें।",
      "Keep devices protected with an appropriate password or screen lock. / डिवाइस को उचित पासवर्ड या स्क्रीन लॉक से सुरक्षित रखें।",
      "Report lost devices or suspected data leakage immediately. / खोए हुए डिवाइस या संदिग्ध डेटा लीक की सूचना तुरंत दें।",
    ],
  },
  {
    id: "complaints",
    number: "11",
    icon: AlertTriangle,
    title: "Complaints & Disputes / शिकायतें एवं विवाद",
    content: [
      "Members have the right to raise questions or disputes regarding collections, penalties, loan balances, or account records. / सदस्यों को संग्रह, दंड, ऋण शेष या खाता रिकॉर्ड के संबंध में प्रश्न या विवाद उठाने का अधिकार है।",
      "Agents should listen professionally and avoid making unauthorized commitments. / एजेंट को पेशेवर तरीके से बात सुननी चाहिए और अनधिकृत वादे करने से बचना चाहिए।",
      "Financial disputes should be escalated to the designated administrator or grievance channel. / वित्तीय विवादों को नामित प्रशासक या शिकायत निवारण चैनल तक पहुंचाया जाना चाहिए।",
      "Do not alter records merely because a member disputes a transaction. / केवल इसलिए रिकॉर्ड में बदलाव न करें क्योंकि कोई सदस्य लेनदेन पर विवाद कर रहा है।",
    ],
  },
  {
    id: "suspension",
    number: "12",
    icon: Ban,
    title: "Suspension & Termination / निलंबन एवं समाप्ति",
    content: [
      "Access to the Agent Dashboard may be suspended or terminated for misuse, unauthorized activity, security violations, financial misconduct, or breach of these terms. / दुरुपयोग, अनधिकृत गतिविधि, सुरक्षा उल्लंघन, वित्तीय कदाचार या इन शर्तों के उल्लंघन के कारण एजेंट डैशबोर्ड की पहुंच निलंबित या समाप्त की जा सकती है।",
      "Termination or suspension of access does not remove responsibility for transactions or actions performed before the account was disabled. / पहुंच समाप्त या निलंबित होने से खाते को बंद किए जाने से पहले किए गए लेनदेन या कार्यों की जिम्मेदारी समाप्त नहीं होती।",
      "The organization may investigate suspected violations and take appropriate action according to applicable policies and law. / संगठन संदिग्ध उल्लंघनों की जांच कर सकता है और लागू नीतियों तथा कानून के अनुसार उचित कार्रवाई कर सकता है।",
    ],
  },
  {
    id: "changes",
    number: "13",
    icon: RefreshCcw,
    title: "Changes to These Terms / इन शर्तों में परिवर्तन",
    content: [
      "These Terms & Conditions may be updated when business processes, system functionality, internal policies, or applicable requirements change. / व्यावसायिक प्रक्रियाओं, सिस्टम की कार्यक्षमता, आंतरिक नीतियों या लागू आवश्यकताओं में बदलाव होने पर इन नियम एवं शर्तों को अपडेट किया जा सकता है।",
      "Agents are responsible for reviewing updated terms when notified. / सूचना मिलने पर अपडेट की गई शर्तों की समीक्षा करना एजेंट की जिम्मेदारी है।",
      "Continued use of the Agent Dashboard after an applicable update may be subject to the revised terms. / लागू अपडेट के बाद एजेंट डैशबोर्ड का निरंतर उपयोग संशोधित शर्तों के अधीन हो सकता है।",
    ],
  },
];

function AgentTerms() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

          <div className="flex items-start gap-4">

            <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
              <ShieldCheck
                size={25}
                className="text-green-600"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-green-600">
                  Agent Portal
                </span>

                <ChevronRight
                  size={13}
                  className="text-slate-300"
                />

                <span className="text-xs font-medium text-slate-400">
                  Policy
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Terms & Conditions
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Financial collection, privacy, security and professional conduct policy
              </p>
            </div>

          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Important Notice */}
        <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-sm">

          <div className="flex flex-col lg:flex-row lg:items-center gap-6">

            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <LockKeyhole size={27} />
            </div>

            <div className="flex-1">

              <p className="text-xs uppercase tracking-[0.2em] text-green-300 font-bold mb-2">
                Important Notice
              </p>

              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                Member information is strictly confidential.
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-7 max-w-4xl">
                Customer and member information must never be misused,
                copied, disclosed, sold, transferred or used for any
                unauthorized personal or commercial purpose.
              </p>

            </div>

          </div>

        </section>

        {/* Quick Navigation */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-8">

          <div className="flex items-center gap-2 mb-4">
            <FileText size={17} className="text-green-600" />

            <h2 className="font-bold">
              Policy Overview
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">

            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-green-50 hover:text-green-700 border border-slate-100 text-xs sm:text-sm font-medium transition"
              >
                {section.number}. {section.title}
              </a>
            ))}

          </div>

        </section>

        {/* Sections */}
        <div className="space-y-5">

          {sections.map((section) => {

            const Icon = section.icon;

            return (
              <section
                id={section.id}
                key={section.id}
                className={`bg-white rounded-3xl border p-5 sm:p-7 scroll-mt-6 ${
                  section.highlight
                    ? "border-green-200 ring-1 ring-green-100"
                    : section.warning
                    ? "border-red-200"
                    : "border-slate-200"
                }`}
              >

                {/* Section heading */}
                <div className="flex items-start gap-4 mb-5">

                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      section.warning
                        ? "bg-red-50 text-red-600"
                        : section.highlight
                        ? "bg-green-50 text-green-600"
                        : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    <Icon size={21} />
                  </div>

                  <div className="min-w-0">

                    <div className="flex items-center gap-2 mb-1">

                      <span className="text-[11px] font-black tracking-widest text-slate-400">
                        SECTION {section.number}
                      </span>

                      {section.warning && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 px-2 py-1 rounded-full">
                          Zero Tolerance
                        </span>
                      )}

                    </div>

                    <h2 className="text-lg sm:text-xl font-bold">
                      {section.title}
                    </h2>

                  </div>

                </div>

                {/* Content */}
                <div className="pl-0 sm:pl-15">

                  <ul className="space-y-3">

                    {section.content.map((text, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-sm text-slate-600 leading-7"
                      >

                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />

                        <span>{text}</span>

                      </li>
                    ))}

                  </ul>

                </div>

              </section>
            );
          })}

        </div>

        {/* Zero Tolerance Box */}
        <section className="mt-8 bg-red-50 border border-red-200 rounded-3xl p-6 sm:p-8">

          <div className="flex gap-4">

            <div className="w-11 h-11 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={22} />
            </div>

            <div>

              <h2 className="font-bold text-red-800 text-lg">
                Zero-Tolerance Financial Misconduct Policy
              </h2>

              <p className="mt-3 text-sm text-red-700 leading-7">
                Unauthorized use of member information, fraudulent
                collection, fake receipts, manipulation of financial
                records, misappropriation of collected money, unauthorized
                disclosure of confidential information, harassment, or
                other financial misconduct may result in immediate
                suspension or termination of system access and may be
                reported to the appropriate authority where required.
              </p>

            </div>

          </div>

        </section>

        {/* Acknowledgement */}
        <section className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8">

          <div className="flex flex-col sm:flex-row gap-5 sm:items-center">

            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle2 size={25} />
            </div>

            <div className="flex-1">

              <h2 className="font-bold text-lg">
                Agent Acknowledgement
              </h2>

              <p className="text-sm text-slate-500 leading-6 mt-1">
                By using the Agent Dashboard, you acknowledge that you
                have read and understood these Terms & Conditions and
                agree to follow the organization's applicable policies
                and procedures.
              </p>

            </div>

          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">

            <div className="flex items-start gap-3">

              <input
                type="checkbox"
                id="termsAcknowledgement"
                className="mt-1 w-4 h-4 accent-green-600"
              />

              <label
                htmlFor="termsAcknowledgement"
                className="text-sm text-slate-600 cursor-pointer"
              >
                I have read and understood the Terms & Conditions and
                agree to comply with the rules governing the use of the
                Agent Dashboard.
              </label>

            </div>

          </div>

        </section>

        {/* Footer */}
        <footer className="text-center py-8">

          <p className="text-xs text-slate-400">
            This page contains the organization's general Agent Dashboard
            terms and operational policies.
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Last Updated: September 2026
          </p>

        </footer>

      </main>

    </div>
  );
}

export default AgentTerms;