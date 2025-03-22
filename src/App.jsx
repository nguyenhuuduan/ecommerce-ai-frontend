import React, { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [products, setProducts] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imageClass, setImageClass] = useState("");
  const [review, setReview] = useState("");
  const [reviewSentiment, setReviewSentiment] = useState("");
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("http://localhost:5000/products");
      const data = await res.json();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const classifyImage = async () => {
    setImageClass("Clothing");
  };

  const submitReview = async () => {
    try {
      const response = await axios.post("http://localhost:5000/analyze-review", {
        review,
      });

      const sentiment = response.data[0].label;
      console.log("⭐ Kết quả từ Hugging Face:", sentiment);
      setReviewSentiment(sentiment);

      if (products.length > 0) {
        await axios.post("http://localhost:5000/reviews", {
          productId: products[0]._id,
          content: review,
          sentiment: sentiment,
        });
      }
    } catch (error) {
      console.error("❌ Lỗi phân tích (qua backend):", error.response?.data || error.message);
      alert("Phân tích thất bại.");
    }
  };

  const recommendProducts = () => {
    setRecommended(products.filter((p) => p.category === "clothing"));
  };

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center">🛒 AI E-Commerce App</h1>

      {/* Image Classification */}
      <div>
        <h2 className="text-xl font-semibold">1. Phân loại hình ảnh</h2>
        <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />
        <button onClick={classifyImage} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
          Phân loại
        </button>
        {imageClass && <p className="mt-2">Loại: {imageClass}</p>}
      </div>

      {/* Sentiment Analysis */}
      <div>
        <h2 className="text-xl font-semibold">2. Phân tích nhận xét khách hàng</h2>
        <textarea
          className="w-full border p-2"
          rows="3"
          placeholder="Nhập nhận xét"
          onChange={(e) => setReview(e.target.value)}
        ></textarea>
        <button onClick={submitReview} className="mt-2 px-4 py-2 bg-green-500 text-white rounded">
          Phân tích & Lưu
        </button>
        {reviewSentiment && (
          <p className="mt-2 font-medium text-white bg-gray-700 inline-block px-3 py-1 rounded">
            Kết quả: {reviewSentiment}
          </p>
        )}
      </div>

      {/* Product Recommendation */}
      <div>
        <h2 className="text-xl font-semibold">3. Gợi ý sản phẩm</h2>
        <button onClick={recommendProducts} className="px-4 py-2 bg-purple-500 text-white rounded">
          Xem gợi ý
        </button>
        <ul className="mt-2 space-y-1">
          {recommended.map((p) => (
            <li key={p._id} className="border p-2 rounded bg-gray-100">
              {p.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
