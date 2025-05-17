import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function InsertProduct() {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productBarcode, setProductBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const getProduct = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/products/${id}`);
        const data = await res.json();

        if (res.status === 201) {
          setProductName(data.ProductName);
          setProductPrice(data.ProductPrice);
          setProductBarcode(data.ProductBarcode);
        } else {
          console.log("Something went wrong. Please try again.");
        }
      } catch (err) {
        console.log(err);
      }
    };

    getProduct();
  }, [id]);

  const updateProduct = async (e) => {
    e.preventDefault();

    if (!productName || !productPrice || !productBarcode) {
      setError("*Please fill in all the required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/updateproduct/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ProductName: productName,
          ProductPrice: productPrice,
          ProductBarcode: productBarcode,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        alert("Data Updated");
        navigate("/products");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-5">
      <h1>Enter Product Information</h1>
      <form className="mt-5 col-lg-6 col-md-6 col-12" onSubmit={updateProduct}>
        <label htmlFor="product_name" className="form-label fs-4 fw-bold">
          Product Name
        </label>
        <input
          type="text"
          onChange={(e) => setProductName(e.target.value)}
          value={productName}
          className="form-control fs-5"
          id="product_name"
          placeholder="Enter Product Name"
          required
        />

        <label htmlFor="product_price" className="form-label fs-4 fw-bold mt-3">
          Product Price
        </label>
        <input
          type="number"
          onChange={(e) => setProductPrice(e.target.value)}
          value={productPrice}
          className="form-control fs-5"
          id="product_price"
          placeholder="Enter Product Price"
          required
        />

        <label htmlFor="product_barcode" className="form-label fs-4 fw-bold mt-3">
          Product Barcode
        </label>
        <input
          type="text"
          onChange={(e) => {
            const value = e.target.value.slice(0, 12);
            if (/^\d*$/.test(value)) {
              setProductBarcode(value);
            }
          }}
          value={productBarcode}
          className="form-control fs-5"
          id="product_barcode"
          placeholder="Enter Product Barcode"
          required
        />

        {error && <p className="text-danger mt-3">{error}</p>}

        <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
          {loading ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
}
