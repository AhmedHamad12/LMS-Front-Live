import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../Components/admin/SideBar'

const Admin = () => {
  return (
    <div className='flex h-screen'>
        <Sidebar/>
        <Outlet />
    </div>
  )
}

export default Admin