import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import axios from "../api/axios";

// const teachers = [
//   {
//     name: "أ. خالد صقر",
//     subject: "خبير الفيزياء الفلكية",
//     img: "https://placehold.co/400x400/000000/ffffff?text=أ.+خالد",
//   },
//   {
//     name: "أ. أحمد السيد",
//     subject: "متخصص الكيمياء النووية",
//     img: "https://placehold.co/400x400/111111/ffffff?text=أ.+أحمد",
//   },
//   {
//     name: "أ. منى علي",
//     subject: "خبيرة رياضيات الفضاء",
//     img: "https://placehold.co/400x400/000000/ffffff?text=أ.+منى",
//   },
//   {
//     name: "أ. حسن محمود",
//     subject: "متخصص الأحياء الفضائية",
//     img: "https://placehold.co/400x400/111111/ffffff?text=أ.+حسن",
//   },
//   {
//     name: "أ. سارة إبراهيم",
//     subject: "خبيرة اللغات والترجمة",
//     img: "https://placehold.co/400x400/000000/ffffff?text=أ.+سارة",
//   },
// ];


const CardSlider = () => {

  const [teachers, setTeachers] = useState([])

  useEffect(()=>{
    const fetchTeachers = async ()=>{
      try {
        const response = await axios.get('/api/Teacher/getAllTeacher')
        setTeachers(response.data);
        
        
      } catch (error) {
        
      }
    }
    fetchTeachers();
   },[])

  return (
    <div className="flex items-center justify-center bg-black text-white py-14">
      <div className="mx-auto w-full max-w-6xl [&_.swiper-button-next]:text-cyan-400 [&_.swiper-button-next:after]:text-3xl [&_.swiper-button-next:hover]:text-cyan-300 [&_.swiper-button-prev]:text-cyan-400 [&_.swiper-button-prev:after]:text-3xl [&_.swiper-button-prev:hover]:text-cyan-300 [&_.swiper-pagination]:!bottom-4 [&_.swiper-pagination-bullet]:h-2.5 [&_.swiper-pagination-bullet]:w-2.5 [&_.swiper-pagination-bullet]:bg-gray-600 [&_.swiper-pagination-bullet-active]:bg-cyan-400">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={30}
          loop={true}
          navigation={true}
          pagination={{ clickable: true }}
          className="swiper-container pb-12"
          initialSlide={1}
          breakpoints={{
            320: {
              slidesPerView: 1,
            },
            640: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
        >
          {teachers.map((teacher, index) => (
            <SwiperSlide key={index}>
              <div className="mb-10 flex flex-col items-center rounded-2xl bg-[#1a1a2e]/50 p-4 text-center shadow-lg sm:p-6 md:p-8">
                <img
                  src={teacher.path}
                  alt={teacher.firstName}
                  className="mb-6 bg-cover h-36 w-36 rounded-full border-2 border-cyan-400 object-cover"
                />
                <h3 className="text-xl font-bold text-white">{teacher.firstName} {teacher.lastName}</h3>
                <p className="mt-2 text-lg text-cyan-400">{teacher.subject}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};


export default CardSlider;
//test