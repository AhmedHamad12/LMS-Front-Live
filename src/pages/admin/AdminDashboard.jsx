import React from 'react'
import Stats from '../../Components/admin/Stats'
import ApprovalCenter from '../../Components/admin/ApprovalCenter'
import RecentUsers from '../../Components/admin/RecentUsers'

const AdminDashboard = () => {
  return (
    <div className='flex-1 p-8 overflow-y-auto custom-scrollbar'>
            <p class="text-4xl font-black text-white mb-2 title-glow">برج مراقبة المجرّة</p>
            <p class="text-gray-400 text-lg mb-8">نظرة شاملة على كل عمليات المنصة.</p>

            <Stats/>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <ApprovalCenter/>
                <RecentUsers/>
            </div>
    </div>
  )
}

export default AdminDashboard