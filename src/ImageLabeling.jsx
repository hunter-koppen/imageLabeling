import { createElement } from "react";

import { ImageKonva } from "./components/ImageKonva";
import "./ui/ImageLabeling.css";

export function ImageLabeling({ sampleText }) {
    return <ImageKonva sampleText={sampleText} />;
}
