import { createElement } from "react";

import { ImageKonva } from "./components/ImageKonva";
import "./ui/ImageLabeling.css";

export function ImageLabeling({ image, labelList, labelTitle, labelColor, onChange }) {
    return (
        <ImageKonva 
            image={image} 
            labelList={labelList}
            labelTitle={labelTitle}
            labelColor={labelColor}
            onChange={onChange} 
        />
    );
}
