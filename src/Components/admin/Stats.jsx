import React from 'react'

const Stats = () => {
    //TODO:API call for real data , and loading state with a spinner
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12'>
        <div className="glass-effect rounded-2xl p-6">
                    <p className="text-sm text-gray-400">إجمالي الإيرادات</p>
                    <p className="text-3xl font-black text-green-400">125,400 <span className="text-base">جنيه</span></p>
                </div>
                <div className="glass-effect rounded-2xl p-6">
                    <p className="text-sm text-gray-400">إجمالي المستخدمين</p>
                    <p className="text-3xl font-black text-white">5,820 <span className="text-base">مستخدم</span></p>
                </div>
                 <div className="glass-effect rounded-2xl p-6">
                    <p className="text-sm text-gray-400">الكورسات النشطة</p>
                    <p className="text-3xl font-black text-white">45 <span className="text-base">كورس</span></p>
                </div>
                 <div className=" rounded-2xl p-6 border-2 border-yellow-500/50">
                     <p className="text-sm text-yellow-300">طلبات في الانتظار</p>
                    <p className="text-3xl font-black text-yellow-300">8 <span className="text-base">طلبات</span></p>
                </div>
    </div>
  )
}

export default Stats