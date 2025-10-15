import React from "react";

export default function Al_landing({ handleProfile }) {
  return (
    
    <div>
      {handleProfile && handleProfile(false)}
      {console.log("handleProfile")}
    </div>
  );
}
    