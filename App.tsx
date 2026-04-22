import React from "react";
import { StatusBar } from "expo-status-bar";
import { PikuApp } from "./src/navigation/PikuApp";

export default function App(): React.JSX.Element {
  return (
    <>
      <StatusBar style="dark" />
      <PikuApp />
    </>
  );
}
