import React from "react";
import Card from "../card/Card";
import "./list.scss";

const List = ({
  posts,
  compareMode = false,
  selectedIds = [],
  toggleCompare,
}) => {
  return (
    <div className="list">
      {posts.map((post) => (
        <Card
          key={post.id}
          item={post}
          compareMode={compareMode}
          isSelected={selectedIds.includes(String(post.id))}
          toggleCompare={toggleCompare}
        />
      ))}
    </div>
  );
};

export default List;
