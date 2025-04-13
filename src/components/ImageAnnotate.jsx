import { createElement, useState, useEffect, useRef } from "react";
import { Annotorious, ImageAnnotator, useAnnotator } from "@annotorious/react";

import "@annotorious/react/annotorious-react.css";

export function ImageAnnotate({ image, labelList, labelTitle, labelColor, onChange, width, height, classNames }) {
    const [state, setState] = useState({
        anno: null,
        selectedAnnotation: null
    });
    const [selectedLabel, setSelectedLabel] = useState(null);

    const processedLabels =
        labelList?.items?.map(item => ({
            id: item.id,
            title: labelTitle.get(item).value,
            color: labelColor.get(item).value
        })) || [];

    // Set up the annotation style based on selected label
    useEffect(() => {
        if (state.anno) {
            state.anno.setStyle({
                stroke: selectedLabel?.color || "#FF0000",
                fill: selectedLabel?.color + "33" || "#FF000033" // Add transparency
            });
        }
    }, [state.anno, selectedLabel]);

    // Handle new annotation creation
    useEffect(() => {
        if (state.anno && selectedLabel) {
            const handleCreateAnnotation = annotation => {
                if (selectedLabel) {
                    annotation.body = [
                        {
                            type: "TextualBody",
                            purpose: "labeling",
                            value: selectedLabel.title,
                            color: selectedLabel.color
                        }
                    ];
                    state.anno.updateAnnotation(annotation);
                }
            };

            state.anno.on("createAnnotation", handleCreateAnnotation);
            return () => state.anno.off("createAnnotation", handleCreateAnnotation);
        }
    }, [state.anno, selectedLabel]);

    // Handle selection changes
    useEffect(() => {
        if (state.anno && selectedLabel && state.selectedAnnotation) {
            const annotation = state.selectedAnnotation;
            if (!annotation.body?.some(body => body.purpose === "labeling")) {
                annotation.body = [
                    {
                        type: "TextualBody",
                        purpose: "labeling",
                        value: selectedLabel.title,
                        color: selectedLabel.color
                    }
                ];
                state.anno.updateAnnotation(annotation);
            }
        }
    }, [state.anno, selectedLabel, state.selectedAnnotation]);

    const handleUndo = () => {
        if (state.anno) {
            state.anno.undo();
        }
    };

    const handleRedo = () => {
        if (state.anno) {
            state.anno.redo();
        }
    };

    const handleClear = () => {
        if (state.anno) {
            state.anno.clearAnnotations();
        }
    };

    const handleDeleteSelected = () => {
        if (state.anno && state.selectedAnnotation) {
            state.anno.removeAnnotation(state.selectedAnnotation);
            setState(prev => ({ ...prev, selectedAnnotation: null }));
        }
    };

    function AnnoLoader() {
        const anno = useAnnotator();
        if (anno && !state.anno) {
            anno.on("selectionChanged", annotations => {
                // According to docs, annotations is an array but currently only contains one annotation
                setState(prev => ({ ...prev, selectedAnnotation: annotations[0] || null }));
            });
            setState(prev => ({ ...prev, anno }));
        }
        return null;
    }

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
                    <Annotorious>
                        <AnnoLoader />
                        <ImageAnnotator>
                            <img src={image.value.uri} />
                        </ImageAnnotator>
                    </Annotorious>
                )}
            </div>
            <div className="annotation-controls">
                <button onClick={handleUndo} title="Undo">
                    ↩️
                </button>
                <button onClick={handleRedo} title="Redo">
                    ↪️
                </button>
                <button
                    onClick={handleDeleteSelected}
                    title="Delete Selected"
                    disabled={!state.selectedAnnotation}
                    className={!state.selectedAnnotation ? "disabled" : ""}
                >
                    🗑️
                </button>
                <button onClick={handleClear} title="Clear All">
                    🗑️🗑️
                </button>
            </div>
        </div>
    );
}
