import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Cookies } from 'react-cookie'

const Quizzes = () => {

  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(false)

  const cookies = new Cookies
  const token = cookies.get('token')
  const id = cookies.get("teacherId")
  
  useEffect(()=>{
    const fetchQuizzes = async ()=>{
     try {
      const response = await axios.get(`http://lms278.runasp.net/api/Quiz/getQuizForTeacher${id}`,{withCredentials:true , headers:{
        'Authorization': `Bearer ${token}`
      }})
      setQuizzes(response.data)
      console.log("quizzes",response.data);
      console.log("id",id);
      
     } catch (error) {
      console.log(error);
      
     }
      
    }

    fetchQuizzes()
  },[])
  return (
    <div>Quizzes</div>
  )
}

export default Quizzes