import { createElement } from "react";

import { HelloWorldSample } from "./components/HelloWorldSample";
import "./ui/ImageAnnotate.css";

export function ImageAnnotate({ sampleText }) {
    return <HelloWorldSample sampleText={sampleText} />;
}
