import React, { useState, useEffect } from "react";
import { Comments } from "./comments";
import { IoStar } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const ProductReview = ({ product, reviews, setReviews }) => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const accessToken = JSON.parse(localStorage.getItem("AccessToken"));
    if (accessToken) {
      const decodedToken = jwtDecode(accessToken);
      setUserId(decodedToken.user_id);
    }

    if (product) {
      fetch(`http://127.0.0.1:8000/api/reviews/?product=${product.id}`, {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          if (response.msg === "success") {
            setReviews(response.data);
          }
        });
    }
  }, [product]);

  const handleLike = async (item) => {
    const accessToken = JSON.parse(localStorage.getItem("AccessToken"));
    if (!accessToken) return;

    const isLiked = item.vote_users.includes(userId);
    const newPoints = isLiked ? -1 : 1;
    // Optional: Optimistic UI update
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === item.id
          ? {
              ...review,
              points: review.points + newPoints,
              vote_users: isLiked
                ? review.vote_users.filter((user) => user !== userId)
                : [...review.vote_users, userId],
            }
          : review
      )
    );

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/reviews/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: item.id,
          points: newPoints,
          vote_users: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Review liked/unliked successfully:", data);
      // Update state with the actual data from the server
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === item.id ? { ...review, ...data.data } : review
        )
      );
    } catch (error) {
      console.error("Error liking/unliking review:", error);
    }
  };
  return (
    <div className="productReviewContainer">
      <h1>Product Review</h1>
      {reviews.map((item) => (
        <div key={item.id} className="reviewCard">
          <div>
            {[1, 2, 3, 4, 5].map((star) => (
              <IoStar
                key={star}
                className={star <= item.rating ? "rating" : "noRating"}
              />
            ))}
          </div>
          <h3 className="reviewTitle">{item.review_title}</h3>
          <p className="reviewBody">{item.review_body}</p>
          {userId && (
            <p>
              <FaHeart
                className={`likeIcon ${
                  item.vote_users.includes(userId) ? "liked" : "notLiked"
                } mx-2`}
                onClick={() => handleLike(item)}
              />
              {item.points}
            </p>
          )}
          <Comments id={item.id} />
        </div>
      ))}
    </div>
  );
};

export default ProductReview;
