import React from "react";
import "./card.scss";
import { Link } from "react-router-dom";

function Card({
  item,
  compareMode = false,
  isSelected = false,
  toggleCompare,
}) {
  return (
    <div className={`card ${isSelected ? "selected" : ""}`}>
      {compareMode && (
        <div className="checkboxWrapper">
          <input
            type="checkbox"
            className="compareCheckbox"
            checked={isSelected}
            onChange={() => toggleCompare(item.id)}
          />
          <span className="tooltip">Compare this</span>
        </div>
      )}

      <Link to={`/${item.id}`} className="imageContainer">
        <img src={item.images[0]} alt={item.title} />
      </Link>
      <div className="textContainer">
        <h2 className="title">
          <Link to={`/${item.id}`}>{item.title}</Link>
        </h2>
        <p className="address">
          <img src="/pin.png" alt="" />
          <span>{item.address}</span>
        </p>
        <p className="price">${item.price}</p>
        <div className="bottom">
          <div className="features">
            <div className="feature">
              <img src="/bed.png" alt="" />
              <span>{item.bedroom} bedroom</span>
            </div>
            <div className="feature">
              <img src="/bath.png" alt="" />
              <span>{item.bathroom} bathroom</span>
            </div>
          </div>
          {/* <div className="icons">
            <div className="icon">
              <img src="/save.png" alt="" />
            </div>
            <div className="icon">
              <img src="/chat.png" alt="" />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default Card;
