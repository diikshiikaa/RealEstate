import React from "react";
import "./list.scss";
import { listData } from "../../lib/dummyData";
import Card from "../card/Card";

const List = ({ posts }) => {
  return (
    <div className="list">
      {posts.map((item) => (
        <Card key={item.id} item={item} />
      ))}
    </div>
  );
};

export default List;
