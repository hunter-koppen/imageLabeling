import { createElement, useState, useEffect, useRef } from "react";
import { Annotorious, ImageAnnotator } from "@annotorious/react";

import "@annotorious/react/annotorious-react.css";

export function ImageAnnotate({ image, labelList, labelTitle, labelColor, onChange, width, height, classNames }) {
    const [selectedLabel, setSelectedLabel] = useState(null);
    const annotatorRef = useRef(null);
    const [annotations, setAnnotations] = useState([]);

    const processedLabels =
        labelList?.items?.map(item => ({
            id: item.id,
            title: labelTitle.get(item).value,
            color: labelColor.get(item).value
        })) || [];

    useEffect(() => {
        if (annotatorRef.current) {
            const annotator = annotatorRef.current;

            // Set up the annotation style based on selected label
            annotator.setStyle({
                stroke: selectedLabel?.color || "#FF0000",
                fill: selectedLabel?.color + "33" || "#FF000033" // Add transparency
            });

            // Handle annotation creation
            annotator.on("createAnnotation", annotation => {
                if (selectedLabel) {
                    annotation.body = [
                        {
                            type: "TextualBody",
                            purpose: "tagging",
                            value: selectedLabel.title
                        }
                    ];

                    setAnnotations(prev => [...prev, annotation]);
                    if (onChange) {
                        onChange(annotation);
                    }
                }
            });

            // Handle annotation update
            annotator.on("updateAnnotation", annotation => {
                if (selectedLabel) {
                    annotation.body = [
                        {
                            type: "TextualBody",
                            purpose: "tagging",
                            value: selectedLabel.title
                        }
                    ];

                    setAnnotations(prev => prev.map(ann => (ann.id === annotation.id ? annotation : ann)));
                    if (onChange) {
                        onChange(annotation);
                    }
                }
            });

            // Handle annotation deletion
            annotator.on("deleteAnnotation", annotation => {
                setAnnotations(prev => prev.filter(ann => ann.id !== annotation.id));
                if (onChange) {
                    onChange(annotation, "delete");
                }
            });

            // Handle annotation selection
            annotator.on("selectAnnotation", annotation => {
                const currentLabel = processedLabels.find(label => label.title === annotation.body?.[0]?.value);
                if (currentLabel) {
                    setSelectedLabel(currentLabel);
                }
            });
        }
    }, [selectedLabel, onChange, processedLabels]);

    return (
        <div className={"image-labeling " + classNames} style={{ width, height }}>
            <div className="label-selector">
                {processedLabels.map(label => (
                    <button
                        key={label.id}
                        className={selectedLabel?.id === label.id ? "selected" : ""}
                        onClick={() => setSelectedLabel(label)}
                        style={{ backgroundColor: label.color }}
                    >
                        {label.title}
                    </button>
                ))}
            </div>
            <div className="image-labeling-container">
                {image?.value?.uri && (
                    <Annotorious ref={annotatorRef}>
                        <ImageAnnotator>
                            <img src={image.value.uri} />
                        </ImageAnnotator>
                    </Annotorious>
                )}
            </div>
        </div>
    );
}
