import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // 1. استيراد Link
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import axios from "../api/axios";

const CardSlider = () => {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get('/api/Teacher/getAllTeacher');
        setTeachers(response.data);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl [&_.swiper-button-next]:text-cyan-400 [&_.swiper-button-next:after]:text-3xl [&_.swiper-button-next:hover]:text-cyan-300 [&_.swiper-button-prev]:text-cyan-400 [&_.swiper-button-prev:after]:text-3xl [&_.swiper-button-prev:hover]:text-cyan-300 [&_.swiper-pagination]:!bottom-4 [&_.swiper-pagination-bullet]:h-2.5 [&_.swiper-pagination-bullet]:w-2.5 [&_.swiper-pagination-bullet]:bg-gray-600 [&_.swiper-pagination-bullet-active]:bg-cyan-400">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={30}
        loop={teachers.length > 3} // Loop only if there are enough slides
        navigation={true}
        pagination={{ clickable: true }}
        className="swiper-container pb-12"
        initialSlide={1}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {teachers.map((teacher) => (
          <SwiperSlide key={teacher.id}>
            {/* --- 2. إضافة Link ليغلف الكارت بالكامل --- */}
            {/* ملاحظة: هذا الكود يفترض أن الـ API يرجع "id" لكل مدرس */}
            <Link to={`/teacherprofile/${teacher.id}`} className="block group">
              <div className="flex h-full flex-col items-center rounded-2xl bg-[#1a1a2e]/50 p-4 text-center shadow-lg sm:p-6 md:p-8 transition-all duration-300 transform group-hover:-translate-y-2 group-hover:bg-[#2a2a4e]/50">
                <img
                  src={teacher.path}
                  alt={`${teacher.firstName} ${teacher.lastName}`}
                  className="mb-6 h-36 w-36 rounded-full border-4 border-slate-700 object-cover transition-all duration-300 group-hover:border-cyan-400"
                />
                <h3 className="text-xl font-bold text-white">{teacher.firstName} {teacher.lastName}</h3>
                <p className="mt-2 text-lg text-cyan-400">{teacher.subject}</p>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CardSlider;