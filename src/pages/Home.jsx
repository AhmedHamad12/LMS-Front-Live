import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Star,
  Eye,
  BarChart3,
  TrendingUp,
  Monitor,
  ChevronDown,
  Plus,
} from "lucide-react";
// import { Link } from "react-router";
import CardSlider from "../Components/CardSlider";
import { Cookies } from "react-cookie";
import { Link } from "react-router-dom";
import { IoCall } from "react-icons/io5";

export default function Home() {
  const [activeFaq, setActiveFaq] = useState(null);
  const canvasRef = useRef(null);

  const cookies = new Cookies();
  const token = cookies.get("token");

  // FAQ data
  const faqs = [
    {
      q: "لمن هذه المنصة؟",
      a: "منصة المجرّة مصممة خصيصًا لطلاب المرحلة الثانوية بجميع صفوفها، وتهدف إلى تقديم المواد العلمية والأدبية بطريقة مبتكرة وتفاعلية.",
    },
    {
      q: "كيف يساعدني الذكاء الاصطناعي؟",
      a: "مساعدك الذكي يقدم لك خطط مذاكرة مخصصة، ويجيب على أسئلتك على مدار الساعة، كما ينشئ لك اختبارات مخصصة لتقييم مستواك.",
    },
    {
      q: "هل يمكنني تجربة المنصة قبل الاشتراك؟",
      a: "بالتأكيد! يمكنك التسجيل مجانًا وتصفح بعض الدروس التجريبية المتاحة لترى بنفسك جودة المحتوى وتجربة التعلم الفريدة التي نقدمها.",
    },
    {
      q: "ما هي طرق الدفع المتاحة للاشتراك؟",
      a: "نحن ندعم جميع طرق الدفع الإلكترونية الشائعة، بما في ذلك البطاقات الائتمانية (فيزا وماستركارد) والمحافظ الإلكترونية.",
    },
  ];

  // Animated background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 191, 255, 0.7)";
        ctx.fill();

        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen  text-white" style={{ direction: "rtl" }}>
      {/* Animated Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 -z-10 h-full w-full"
        style={{ pointerEvents: "none" }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border border-white/5 bg-gradient-to-tr from-[rgba(20,20,40,0.4)] to-[rgba(10,10,20,0.5)] p-4 backdrop-blur-[12px]">
        <div className="text-3xl font-black [text-shadow:0_0_10px_rgba(0,191,255,0.6),_0_0_20px_rgba(0,191,255,0.4)]">
          <Link to="/">المجرّة.</Link>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          {!token && (
            <Link
              to="/login"
              className="rounded-md px-5 py-2 text-sm font-bold text-white transition-all duration-300 hover:text-cyan-300"
            >
              تسجيل الدخول
            </Link>
          )}
          <a
            href="/students/allcourses"
            className="hover:shadow-[0 0 25px rgba(0, 191, 255, 0.7)] hidden animate-[pulse-primary] rounded-lg bg-[#00BFFF] px-[30px] py-3 text-sm font-bold text-black shadow-[0_0_15px_rgba(0,191,255,0.4)] transition-all duration-300 ease-in-out hover:-translate-y-[3px] hover:animate-none sm:block"
          >
            ابدأ الآن
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="-mt-16 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1
          className="mb-6 text-5xl leading-tight font-black text-white md:text-8xl"
          style={{ textShadow: "0 0 20px rgba(0, 191, 255, 0.6)" }}
        >
          أعد تعريف تجربة التفوق
        </h1>
        <p className="mb-10 max-w-3xl text-lg leading-relaxed text-gray-300">
          منصة المجرّة هي النظام البيئي المتكامل الذي يجمع أفضل المدرسين مع طلاب
          المرحلة الثانوية الطموحين، باستخدام تكنولوجيا تفاعلية، أدوات ذكاء
          اصطناعي، وأساليب تعليمية من المستقبل.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            to="/student-signup"
            className="flex items-center rounded-lg bg-cyan-500 px-8 py-4 text-lg font-bold text-black transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/30"
          >
            <Monitor className="ml-2 h-6 w-6" />
            تصفح الكورسات كطالب
          </Link>
          <Link
            to="/teacher-signup"
            className="flex items-center rounded-lg border-2 border-cyan-500 bg-transparent px-8 py-4 text-lg font-bold text-cyan-500 transition-all duration-300 hover:bg-cyan-500 hover:text-black"
          >
            <Star className="ml-2 h-6 w-6" />
            انضم إلينا كمدرس
          </Link>
        </div>
      </main>

      {/* AI Features Section */}
      <section id="ai-features" className="px-4 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <h2
            className="mb-4 text-5xl font-black text-white"
            style={{ textShadow: "0 0 12px rgba(0, 191, 255, 0.5)" }}
          >
            لأول مرة في منصة تعليمية...
          </h2>
          <p className="mb-12 text-3xl font-bold text-cyan-400">
            الذكاء الاصطناعي.. مساعدك الشخصي نحو القمة
          </p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="transform rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 p-8 backdrop-blur-md transition-transform duration-300 hover:-translate-y-2">
              <div className="mb-4 flex h-24 items-center justify-center">
                <Monitor
                  className="h-20 w-20 text-cyan-400"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(0, 191, 255, 0.7))",
                  }}
                />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white">
                شرح أي سؤال بالـ AI
              </h3>
              <p className="text-gray-300">
                واجهت سؤال صعب؟ صوره وأرسله لمساعدنا الذكي واحصل على شرح تفصيلي
                وخطوات الحل فورًا.
              </p>
            </div>
            <div className="transform rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 p-8 backdrop-blur-md transition-transform duration-300 hover:-translate-y-2">
              <div className="mb-4 flex h-24 items-center justify-center">
                <BarChart3
                  className="h-20 w-20 text-cyan-400"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(0, 191, 255, 0.7))",
                  }}
                />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white">
                خطة مذاكرة ذكية
              </h3>
              <p className="text-gray-300">
                يقوم الـ AI بتحليل مستواك ونقاط ضعفك، ثم يقترح عليك جدول مذاكرة
                ذكي لتحقيق أفضل النتائج.
              </p>
            </div>
            <div className="transform rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 p-8 backdrop-blur-md transition-transform duration-300 hover:-translate-y-2">
              <div className="mb-4 flex h-24 items-center justify-center">
                <BookOpen
                  className="h-20 w-20 text-cyan-400"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(0, 191, 255, 0.7))",
                  }}
                />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white">
                امتحانات تحاكي الواقع
              </h3>
              <p className="text-gray-300">
                أنشئ امتحانات مخصصة من أي جزء في المنهج، واحصل على تقييم فوري
                لأدائك كأنك في امتحان حقيقي.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="bg-black/30 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <h2
            className="mb-16 text-center text-5xl font-black text-white"
            style={{ textShadow: "0 0 12px rgba(0, 191, 255, 0.5)" }}
          >
            منهجيتنا نحو التفوق.. في 3 خطوات
          </h2>
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full border-2 border-cyan-400/50 bg-gradient-to-br from-slate-900/40 to-slate-800/50 backdrop-blur-md">
                <Eye className="h-16 w-16 text-cyan-400" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-white">
                1. استكشف وافهم
              </h3>
              <p className="text-gray-400">
                شاهد شرح تفاعلي يتجاوز حدود المألوف، ويربط المنهج بأمثلة من عالم
                الفضاء والتكنولوجيا.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full border-2 border-cyan-400/50 bg-gradient-to-br from-slate-900/40 to-slate-800/50 backdrop-blur-md">
                <BarChart3 className="h-16 w-16 text-cyan-400" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-white">
                2. تدرب وتحدى
              </h3>
              <p className="text-gray-400">
                حل آلاف الأسئلة المتدرجة الصعوبة واختبر فهمك بتحديات يضعها لك
                مساعدك الذكي.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full border-2 border-cyan-400/50 bg-gradient-to-br from-slate-900/40 to-slate-800/50 backdrop-blur-md">
                <TrendingUp className="h-16 w-16 text-cyan-400" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-white">
                3. أتقن وانطلق
              </h3>
              <p className="text-gray-400">
                عزز معرفتك بامتحانات شاملة، تابع ترتيبك على لوحة الشرف، وانطلق
                نحو أعلى الدرجات.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <h2
            className="mb-4 text-center text-5xl font-black text-white"
            style={{ textShadow: "0 0 12px rgba(0, 191, 255, 0.5)" }}
          >
            اكتشف كواكب المعرفة
          </h2>
          <p className="mb-16 text-center text-lg text-gray-400">
            كورسات مصممة بعناية فائقة لتأخذك في رحلة من الأساسيات إلى الإتقان في
            موادك الدراسية.
          </p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="group overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 backdrop-blur-md">
              <img
                src="https://placehold.co/600x400/003366/00BFFF?text=الفيزياء+الكونية"
                alt="صورة كورس الفيزياء"
                className="h-56 w-full transform object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-6">
                <h3 className="mb-2 text-2xl font-bold text-white">
                  الفيزياء الكونية للمرحلة الثانوية
                </h3>
                <p className="mb-4 h-16 text-gray-400">
                  من قوانين نيوتن إلى الجاذبية، استكشف القوى التي تحكم حركة
                  الكواكب والأقمار الصناعية.
                </p>
                <a
                  href="#"
                  className="block w-full rounded-lg bg-cyan-500 px-6 py-3 text-center font-bold text-black transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/30"
                >
                  استكشف الكورس
                </a>
              </div>
            </div>
            <div className="group overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 backdrop-blur-md">
              <img
                src="https://placehold.co/600x400/004c4c/00BFFF?text=الكيمياء+الفلكية"
                alt="صورة كورس الكيمياء"
                className="h-56 w-full transform object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-6">
                <h3 className="mb-2 text-2xl font-bold text-white">
                  الكيمياء الفلكية وتفاعلات الطاقة
                </h3>
                <p className="mb-4 h-16 text-gray-400">
                  حلل العناصر المكونة للنجوم واكتشف كيمياء الوقود الصاروخي
                  وتفاعلات الاندماج النووي.
                </p>
                <a
                  href="#"
                  className="block w-full rounded-lg bg-cyan-500 px-6 py-3 text-center font-bold text-black transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/30"
                >
                  استكشف الكورس
                </a>
              </div>
            </div>
            <div className="group overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 backdrop-blur-md">
              <img
                src="https://placehold.co/600x400/2F004F/00BFFF?text=رياضيات+الفضاء"
                alt="صورة كورس الرياضيات"
                className="h-56 w-full transform object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-6">
                <h3 className="mb-2 text-2xl font-bold text-white">
                  رياضيات الفضاء المتقدمة
                </h3>
                <p className="mb-4 h-16 text-gray-400">
                  تطبيقات التفاضل والتكامل وحساب المثلثات في حساب مدارات الكواكب
                  وسرعة المقذوفات.
                </p>
                <a
                  href="#"
                  className="block w-full rounded-lg bg-cyan-500 px-6 py-3 text-center font-bold text-black transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/30"
                >
                  استكشف الكورس
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section id="teachers" className="bg-black/30 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <h2
            className="text-center text-5xl font-black text-white"
            style={{ textShadow: "0 0 12px rgba(0, 191, 255, 0.5)" }}
          >
            انضم إلى كوكبة من أفضل المدرسين
          </h2>
          <CardSlider />
          <div className="text-center">
            <a
              href="#"
              className="rounded-lg border-2 border-cyan-500 bg-transparent px-8 py-4 text-lg font-bold text-cyan-500 transition-all duration-300 hover:bg-cyan-500 hover:text-black"
            >
              أنا مدرس وأريد الانضمام
            </a>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section id="leaderboard" className="px-4 py-24">
        <h2
          className="mb-12 text-center text-5xl font-black text-white"
          style={{ textShadow: "0 0 12px rgba(0, 191, 255, 0.5)" }}
        >
          لوحة شرف روّاد الفضاء
        </h2>
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 p-8 backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between rounded-lg bg-cyan-900/40 p-4 transition-all duration-300 hover:scale-105 hover:bg-cyan-900/60">
            <div className="flex items-center">
              <span className="mr-4 text-3xl font-bold text-yellow-400">
                🥇
              </span>
              <span className="text-xl font-bold text-white">
                عبدالله المنصوري
              </span>
            </div>
            <span className="text-xl font-bold text-cyan-400">15,700 نقطة</span>
          </div>
          <div className="mb-3 flex items-center justify-between rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:bg-cyan-900/50">
            <div className="flex items-center">
              <span className="mr-4 text-3xl font-bold text-gray-300">🥈</span>
              <span className="text-xl font-bold text-white">
                فاطمة الزهراء
              </span>
            </div>
            <span className="text-xl font-bold text-cyan-400">14,250 نقطة</span>
          </div>
          <div className="mb-3 flex items-center justify-between rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:bg-cyan-900/50">
            <div className="flex items-center">
              <span className="mr-4 text-3xl font-bold text-yellow-600">
                🥉
              </span>
              <span className="text-xl font-bold text-white">خالد الأحمدي</span>
            </div>
            <span className="text-xl font-bold text-cyan-400">12,900 نقطة</span>
          </div>
          <div className="flex items-center justify-between rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:bg-cyan-900/50">
            <div className="flex items-center">
              <span className="mr-6 ml-1 text-xl font-bold text-gray-500">
                4
              </span>
              <span className="text-xl font-bold text-white">
                سارة القحطاني
              </span>
            </div>
            <span className="text-xl font-bold text-cyan-400">11,500 نقطة</span>
          </div>
        </div>
      </section>

      <section id="testimonials" className="bg-black/30 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <h2
            className="mb-16 text-center text-5xl font-black text-white"
            style={{ textShadow: "0 0 12px rgba(0, 191, 255, 0.5)" }}
          >
            ماذا يقول روادنا عن رحلتهم؟
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 p-8 backdrop-blur-md">
              <div className="mb-4 flex items-center">
                <img
                  src="https://placehold.co/60x60/ffffff/000000?text=ع"
                  alt="صورة الطالب"
                  className="h-16 w-16 rounded-full border-2 border-cyan-400"
                />
                <div className="mr-4">
                  <h4 className="text-lg font-bold text-white">عمر الشريف</h4>
                  <p className="text-sm text-gray-400">
                    طالب - الصف الثالث الثانوي
                  </p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "لم أتخيل يومًا أن دراسة الفيزياء يمكن أن تكون بهذه المتعة.
                الشرح وطريقة ربط المنهج بالفضاء جعلت كل شيء أسهل وأكثر إثارة."
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 p-8 backdrop-blur-md">
              <div className="mb-4 flex items-center">
                <img
                  src="https://placehold.co/60x60/ffffff/000000?text=ن"
                  alt="صورة ولي الأمر"
                  className="h-16 w-16 rounded-full border-2 border-cyan-400"
                />
                <div className="mr-4">
                  <h4 className="text-lg font-bold text-white">نورة عبدالله</h4>
                  <p className="text-sm text-gray-400">ولية أمر</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "كنت قلقة بشأن مستوى ابني في الرياضيات، ولكن مع أدوات الذكاء
                الاصطناعي والمتابعة المستمرة، رأيت تحسنًا مذهلاً في درجاته وثقته
                بنفسه."
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-800/50 p-8 backdrop-blur-md">
              <div className="mb-4 flex items-center">
                <img
                  src="https://placehold.co/60x60/ffffff/000000?text=ي"
                  alt="صورة الطالب"
                  className="h-16 w-16 rounded-full border-2 border-cyan-400"
                />
                <div className="mr-4">
                  <h4 className="text-lg font-bold text-white">يوسف محمود</h4>
                  <p className="text-sm text-gray-400">
                    طالب - الصف الأول الثانوي
                  </p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "نظام النقاط والمنافسة على لوحة الشرف حمسني أذاكر وأحل واجباتي
                أول بأول. المنصة حولت المذاكرة للعبة ممتعة!"
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-16 text-center text-[2.75rem] font-black text-white text-shadow-[0_0_12px_rgba(0,191,255,0.5)]">
            أسئلة شائعة
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="glass-effect overflow-hidden rounded-lg"
              >
                <button
                  onClick={() =>
                    setActiveFaq(activeFaq === index ? null : index)
                  }
                  className={`faq-question flex w-full cursor-pointer items-center justify-between p-6 text-right ${
                    activeFaq === index ? "open" : ""
                  }`}
                >
                  <span className="text-lg font-bold text-white">{faq.q}</span>
                  <span className="faq-icon text-2xl font-light text-cyan-400">
                    {activeFaq === index ? "−" : "+"}
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    activeFaq === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-6 pt-0 text-gray-300">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-16 border-t border-gray-900 p-8 text-center flex justify-between">
        <div className="flex items-center gap-2">
          <p className="text-md">01094879104</p>
          <IoCall className="text-cyan-400" size={20}/>
        </div>
        <p className="text-md">
          &copy; 2025 منصة المجرّة. كل الأفكار محمية بقوانين المجرات الكونية.
        </p>
      </footer>
    </div>
  );
}