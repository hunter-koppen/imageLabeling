import { createElement } from "react";

import { ImageAnnotate } from "./components/ImageAnnotate";
import "./ui/ImageLabeling.css";

export function ImageLabeling(props) {
    return (
        <ImageAnnotate
            image={props.image}
            labelTitle={props.labelTitle?.value}
            labelColor={props.labelColor?.value}
            onChange={props.onChange}
            width={props.width?.value ? props.width.value : "100%"}
            height={props.height?.value ? props.height.value : "100%"}
            classNames={props.class}
            actionUndo={props.actionUndo}
            actionRedo={props.actionRedo}
            actionDeleteSelected={props.actionDeleteSelected}
            actionClear={props.actionClear}
        />
    );
}
