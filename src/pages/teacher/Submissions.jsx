import React from "react";
import { useParams } from "react-router-dom";

const Submissions = () => {
  const { quizId } = useParams();
  return (
    <div>
      <h1>Submissions</h1>
      <p>Quiz ID: {quizId}</p>
    </div>
  );
};

export default Submissions;
