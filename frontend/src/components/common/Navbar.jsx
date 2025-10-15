import { Button } from "@radix-ui/themes";
import { Barcode, FolderCode, LogIn, Search, UserRoundPlus } from "lucide-react";
import React from "react";

const Navbar = () => {
  return (
    <div className="w-1/2 h-1/15 bg-colorAccent shadow-xl flex items-center justify-around gap-2 rounded-md p-8">
      <h1 className="text-4xl font-bold">Talk2Shop</h1>
      {/* <div className="flex gap-2 bg-colorBg p-4 rounded-xl shadow-md">
        <Button
          variant="soft"
          size="3"
          radius="full"
          className=" !text-[var(--color-colorBg)] !bg-[var(--color-colorSecondary)] !cursor-pointer"
        >
          <Barcode />
          <p>Products</p>
        </Button>

        <Button
          variant="outlined"
          size="3"
          radius="full"
          className="!bg-[var(--color-colorBg)] !text-[var(--color-colorText)] !cursor-pointer"
        >
          
          <Search />
          <p>Search</p>
        </Button>

        <Button
          variant="outlined"
          size="3"
          radius="full"
          className="!bg-[var(--color-colorBg)] !text-[var(--color-colorText)] !cursor-pointer"
        >
          
          <FolderCode />
          <p>About Us</p>
        </Button>
      </div> */}

      <div className="flex gap-2">
        <Button
          variant="soft"
          size="3"
          radius="full"
          className="!bg-[var(--color-colorBg)] !text-[var(--color-colorText)] !cursor-pointer"
        >
          <LogIn />
          Login
        </Button>

        <Button
          variant="soft"
          size="3"
          radius="full"
          className="!bg-[var(--color-colorBg)] !text-[var(--color-colorText)] !cursor-pointer"
        >
          <UserRoundPlus />
          Sign Up
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
