import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import { IoStar } from "react-icons/io5";
import { jwtDecode } from "jwt-decode";

const ReviewForm = ({ product, setReviews, reviews }) => {
  const [rating, setRating] = useState(0);
  const [reviewId, setReviewId] = useState(null); // State to hold review ID for editing
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false); // State to control form visibility

  useEffect(() => {
    const userId = jwtDecode(localStorage.getItem("AccessToken")).user_id;
    const userReview = reviews.find((review) => review.user === userId);

    if (userReview) {
      // If user has already submitted a review, set initial values for editing
      setReviewId(userReview.id);
      setRating(userReview.rating);
      setReviewTitle(userReview.review_title);
      setReviewBody(userReview.review_body);
    }
  }, [reviews]);

  const handleStarClick = (star) => {
    setRating(star);
  };

  const submitReview = (e) => {
    e.preventDefault();
    if (!rating) {
      alert("Please select a rating");
      return;
    }
    const accessToken = JSON.parse(localStorage.getItem("AccessToken"));

    setIsSubmitting(true);

    const apiUrl = "http://127.0.0.1:8000/api/reviews/";

    const method = reviewId ? "PATCH" : "POST";

    fetch(apiUrl, {
      method: method,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        id: reviewId || null,
        review_body: reviewBody,
        review_title: reviewTitle,
        rating: rating,
        product: product.id,
        points: 0,
        vote_users: [],
      }),
    })
      .then((response) => {
        setIsSubmitting(false);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (reviewId) {
          // If editing existing review, update the reviews list
          const updatedReviews = reviews.map((review) =>
            review.id === reviewId ? data.data : review
          );
          setReviews(updatedReviews);
        } else {
          // If new review, add it to the reviews list
          setReviews([...reviews, data.data]);
        }
        resetForm();
        setIsFormVisible(false); // Hide the form after submission
        console.log("Review submitted successfully:", data);
      })
      .catch((error) => {
        setIsSubmitting(false);
        alert(
          "An error occurred while submitting your review. Please try again."
        );
        console.error("Error submitting review:", error);
      });
  };

  const resetForm = () => {
    setReviewId(null);
    setRating(0);
    setReviewTitle("");
    setReviewBody("");
  };

  return (
    <div className="d-flex flex-column align-items-center ReviewForm p-3 rounded">
      {reviewId ? <h2>Edit Review</h2> : <h2>Add Review</h2>}
      <button
        onClick={() => setIsFormVisible(!isFormVisible)}
        className="btn btn-secondary my-2"
      >
        {isFormVisible ? "Cancel" : reviewId ? "Edit Review" : "Add Review"}
      </button>
      {isFormVisible && (
        <>
          <div className="star-rating">
            <h4>{reviewId ? "Change Rating:" : "Select Rating:"}</h4>
            {[1, 2, 3, 4, 5].map((star) => (
              <IoStar
                key={star}
                className={star <= rating ? "selected" : "notselected"}
                onClick={() => handleStarClick(star)}
              />
            ))}
          </div>
          <Form onSubmit={submitReview}>
            <Form.Group controlId="reviewTitleInput" className="textInput">
              <Form.Control
                type="text"
                placeholder="Enter Title"
                name="Title"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="reviewTextarea" className="textArea">
              <Form.Control
                as="textarea"
                rows={4}
                maxLength={10000}
                className="row"
                name="Review"
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
              />
            </Form.Group>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? reviewId
                  ? "Editing..."
                  : "Submitting..."
                : reviewId
                ? "Edit Review"
                : "Submit Review"}
            </button>
          </Form>
        </>
      )}
    </div>
  );
};

export default ReviewForm;
