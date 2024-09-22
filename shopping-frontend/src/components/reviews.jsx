import React, { useEffect, useState } from "react";
import ReviewForm from "./reviewForm";
import ProductReview from "./productReview";

const Reviews = ({ product }) => {
  const [reviews, setReviews] = useState([]);
  const [editStatus, setEditStatus] = useState(false);
  useEffect(() => {
    console.log(product);
  }, []);
  return (
    <div>
      <ReviewForm
        product={product}
        setReviews={setReviews}
        reviews={reviews}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
      />
      <ProductReview
        product={product}
        setReviews={setReviews}
        reviews={reviews}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
      />
    </div>
  );
};

export default Reviews;
