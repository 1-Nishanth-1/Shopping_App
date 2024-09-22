import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export const Bill = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = JSON.parse(localStorage.getItem("AccessToken"));
    console.log(accessToken);
    if (!accessToken) {
      navigate("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/bill/", {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setBills(data.results);
      })
      .catch((error) => {
        console.error("Error fetching bills:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <h1>Bills:</h1>
      <div className="container-fluid p-md-5 p-0">
        {bills.map((item) => (
          <div key={item.id} className="w-100 p-3 border border-rounded row">
            <h5 className="col-5">{item.id}</h5>
            <h5 className="col-3">{item.date_created.split("T")[0]}</h5>
            <h5 className="col-2">${item.total}</h5>
            <Button
              variant="danger"
              className="col-2 download-button"
              as="a"
              href={`http://127.0.0.1:8000/${item.bill}`}
            >
              Download
            </Button>
          </div>
        ))}
        {bills.next && (
          <Button variant="primary" onClick={loadMoreBills}>
            Load More
          </Button>
        )}
      </div>
    </>
  );
};
