import React from "react";
import StackUp from "../assets/StackUp1.svg";
import StackDown from "../assets/StackDown.svg";
import { MainLogo } from "../assets/mainLogo.jsx";
import { Container } from "../components/Container";
import Logo from "../assets/logo.jsx";
export default function Home() {
  return (
    <Container>
      <div className="w-full h-[80vh] flex justify-center items-center overflow-hidden">
        <Logo className="w-[500px] h-[500px]" color={"#FFED03"} />
      </div>
    </Container>
  );
}
