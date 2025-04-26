import { createElement, useState, useEffect, useRef } from "react";
import { Annotorious, ImageAnnotator, useAnnotator } from "@annotorious/react";

import "@annotorious/react/annotorious-react.css";

export function ImageAnnotate({
    image,
    labelTitle,
    labelColor = "#FF0000",
    onChange,
    width,
    height,
    classNames,
    actionUndo,
    actionRedo,
    actionDeleteSelected,
    actionClear
}) {
    const [state, setState] = useState({
        anno: null,
        selectedAnnotation: null
    });

    useEffect(() => {
        if (state.anno) {
            state.anno.setStyle({
                stroke: labelColor,
                fill: labelColor + "33"
            });
        }
    }, [state.anno, labelColor]);

    useEffect(() => {
        if (state.anno) {
            const handleCreateAnnotation = annotation => {
                annotation.body = [
                    {
                        type: "TextualBody",
                        purpose: "labeling",
                        value: labelTitle,
                        color: labelColor
                    }
                ];
                state.anno.updateAnnotation(annotation);
            };

            state.anno.on("createAnnotation", handleCreateAnnotation);
            return () => state.anno.off("createAnnotation", handleCreateAnnotation);
        }
    }, [state.anno, labelTitle, labelColor]);

    useEffect(() => {
        if (state.anno && state.selectedAnnotation) {
            const annotation = state.selectedAnnotation;
            if (!annotation.body?.some(body => body.purpose === "labeling")) {
                annotation.body = [
                    ...(annotation.body || []),
                    {
                        type: "TextualBody",
                        purpose: "labeling",
                        value: labelTitle,
                        color: labelColor
                    }
                ];
                state.anno.updateAnnotation(annotation);
            }
        }
    }, [state.anno, labelTitle, labelColor, state.selectedAnnotation]);

    useEffect(() => {
        if (actionUndo?.value === true && state.anno) {
            actionUndo.setValue(false);
            state.anno.undo();
        }
    }, [actionUndo, state.anno]);

    useEffect(() => {
        if (actionRedo?.value === true && state.anno) {
            actionRedo.setValue(false);
            state.anno.redo();
        }
    }, [actionRedo, state.anno]);

    useEffect(() => {
        if (actionDeleteSelected?.value === true && state.anno) {
            actionDeleteSelected.setValue(false);
            if (state.anno && state.selectedAnnotation) {
                state.anno.removeAnnotation(state.selectedAnnotation);
                setState(prev => ({ ...prev, selectedAnnotation: null }));
            }
        }
    }, [actionDeleteSelected, state.anno]);

    useEffect(() => {
        if (actionClear?.value === true && state.anno) {
            actionClear.setValue(false);
            state.anno.clearAnnotations();
        }
    }, [actionClear, state.anno]);

    function AnnoLoader() {
        const anno = useAnnotator();
        useEffect(() => {
            if (anno && !state.anno) {
                const selectionHandler = annotations => {
                    setState(prev => ({ ...prev, selectedAnnotation: annotations[0] || null }));
                };
                anno.on("selectionChanged", selectionHandler);
                setState(prev => ({ ...prev, anno }));

                return () => {
                    anno.off("selectionChanged", selectionHandler);
                };
            }
        }, [anno]);
        return null;
    }

    return (
        <div className={"image-labeling " + classNames} style={{ width, height }}>
            <div className="image-labeling-container">
                {image?.value?.uri && (
                    <Annotorious>
                        <AnnoLoader />
                        <ImageAnnotator>
                            <img src={image.value.uri} alt="Annotatable" />
                        </ImageAnnotator>
                    </Annotorious>
                )}
            </div>
        </div>
    );
}
