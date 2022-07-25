import React from "react";

const Avatar = ({ user, size }) => {
  // Sizes like 7, 8, 9...
  if (!user)
    return (
      <div>
        <div
          className={`h-${size} w-${size} uppercase rounded-full bg-slate-200 flex items-center gap-2 justify-center`}
        >
          ?
        </div>
      </div>
    );
  return (
    <div>
      {user.image ? (
        <img
          className={`h-${size} w-${size} rounded-full`}
          src={user.image}
          alt=""
        />
      ) : (
        <div>
          <div
            className={`h-9 w-9 uppercase rounded-full bg-slate-200 flex items-center gap-2 justify-center`}
          >
            {user.name ? user.name[0] : "?"}
          </div>
        </div>
      )}
    </div>
  );
};

export default Avatar;
