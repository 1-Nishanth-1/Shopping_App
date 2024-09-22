import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import { AddComment } from "./addcomment";

export const Comments = ({ id }) => {
  const [comments, setComments] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);

  useEffect(() => {
    if (showComments && !comments.length) {
      fetchComments(`http://127.0.0.1:8000/api/comments/?review=${id}`);
    }
  }, [showComments]);

  const fetchComments = (url) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          console.log(data);
          setComments((prevComments) => [...prevComments, ...data.results]);
          setNextPage(data.next);
        }
      })
      .catch((error) => {
        console.error(error);
        // Handle the error here, e.g. show an error message to the user
      });
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleToggleAddComment = () => {
    if (!comments.length) {
      fetchComments(`http://127.0.0.1:8000/api/comments/?review=${id}`);
    }
    setShowAddComment(!showAddComment);
  };

  const handleLoadMore = () => {
    if (nextPage) {
      fetchComments(nextPage);
    }
  };

  return (
    <>
      <Button
        onClick={handleToggleComments}
        aria-controls="comments-collapse-text"
        aria-expanded={showComments}
        variant="outline-info"
      >
        {showComments ? "Hide Comments" : "Show Comments"}
      </Button>
      <Collapse in={showComments}>
        <div id="comments-collapse-text">
          {comments.length > 0 ? (
            comments.map((item) => (
              <div
                key={item.id}
                className="m-2 p-3 border border-rounded commentBox"
              >
                <p className="comment">{item.comment}</p>
              </div>
            ))
          ) : (
            <p>No comments available.</p>
          )}
          {nextPage && (
            <Button onClick={handleLoadMore} variant="outline-info">
              Load more
            </Button>
          )}
        </div>
      </Collapse>
      <Button
        onClick={handleToggleAddComment}
        aria-controls="add-comment-collapse-text"
        aria-expanded={showAddComment}
        variant="outline-warning"
      >
        {showAddComment ? "Cancel" : "Add Comment"}
      </Button>
      <Collapse in={showAddComment}>
        <div id="add-comment-collapse-text">
          <AddComment id={id} comments={comments} setComments={setComments} />
        </div>
      </Collapse>
    </>
  );
};
