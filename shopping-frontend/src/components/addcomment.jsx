import React, { useState } from "react";

export const AddComment = ({ id, comments, setComments }) => {
  const [comment, setComment] = useState("");
  const handleInputChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your logic to handle the comment submission here
    console.log("Comment submitted:", comment);
    const accessToken = JSON.parse(localStorage.getItem("AccessToken"));
    fetch("http://127.0.0.1:8000/api/comments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        comment: e.target.elements.comment.value,
        review: id,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setComments([...comments, data.data]);
        console.log("Review submitted successfully:", data);
      });
    setComment("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={comment}
        onChange={handleInputChange}
        placeholder="Enter your comment..."
        name="comment"
      ></textarea>
      <button type="submit">Add Comment</button>
    </form>
  );
};
