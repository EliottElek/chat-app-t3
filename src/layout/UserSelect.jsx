import React from "react";
import Select from "../components/Select";
import { trpc } from "../utils/trpc";
const UserSelect = ({ selected, setSelected }) => {
  const { data } = trpc.useQuery(["user.get-all-users"]);
  // Get the list of all users
  return <Select people={data} selected={selected} setSelected={setSelected} />;
};

export default UserSelect;
