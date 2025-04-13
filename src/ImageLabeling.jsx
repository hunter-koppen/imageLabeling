import { createElement } from "react";

import { ImageAnnotate } from "./components/ImageAnnotate";
import "./ui/ImageLabeling.css";

export function ImageLabeling( props ) {
    return (
        <ImageAnnotate 
            image={props.image} 
            labelList={props.labelList}
            labelTitle={props.labelTitle}
            labelColor={props.labelColor}
            onChange={props.onChange} 
            width={props.width?.value ? props.width.value : '100%'}
            height={props.height?.value ? props.height.value : '100%'}
            classNames={props.class}
        />
    );
}
