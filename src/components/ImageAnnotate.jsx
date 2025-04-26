import { createElement, useState, useEffect, useRef } from "react";
import { Annotorious, ImageAnnotator, useAnnotator } from "@annotorious/react";

import "@annotorious/react/annotorious-react.css";

export function ImageAnnotate({
    image,
    labelTitle,
    labelColor = "#FF0000",
    width,
    height,
    classNames,
    actionUndo,
    actionRedo,
    actionDeleteSelected,
    actionClear,
    exportAnnotations,
    XMLString,
    onExport
}) {
    const [state, setState] = useState({
        anno: null,
        selectedAnnotation: null
    });
    const imgRef = useRef(null);

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
            };

            state.anno.on("createAnnotation", handleCreateAnnotation);
            return () => state.anno.off("createAnnotation", handleCreateAnnotation);
        }
        return undefined;
    }, [state.anno, labelTitle, labelColor]);

    useEffect(() => {
        if (actionUndo?.value === true) {
            if (state.anno?.canUndo()) {
                state.anno.undo();
            }
            actionUndo.setValue(false);
        }
    }, [actionUndo, state.anno]);

    useEffect(() => {
        if (actionRedo?.value === true) {
            if (state.anno?.canRedo()) {
                state.anno.redo();
            }
            actionRedo.setValue(false);
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

    useEffect(() => {
        if (exportAnnotations?.value === true) {
            if (
                state.anno &&
                XMLString &&
                imgRef.current &&
                imgRef.current.naturalWidth > 0 &&
                imgRef.current.naturalHeight > 0
            ) {
                const annotations = state.anno.getAnnotations();
                const currentWidth = imgRef.current.naturalWidth;
                const currentHeight = imgRef.current.naturalHeight;
                const xmlString = formatAnnotationsToPascalVOC(
                    annotations,
                    image.value?.name,
                    currentWidth,
                    currentHeight
                );
                XMLString.setValue(xmlString);
                if (onExport && onExport.canExecute) {
                    onExport.execute();
                }
            } else {
                console.warn(
                    "Cannot export annotations: Annotator not ready, XML string missing, or image dimensions not available."
                );
            }
            // Reset the export trigger regardless of success/failure
            exportAnnotations.setValue(false);
        }
    }, [exportAnnotations, XMLString, state.anno, image, onExport]);

    useEffect(() => {
        if (state.anno) {
            state.anno.clearAnnotations();
            setState(prev => ({ ...prev, selectedAnnotation: null }));
        }
    }, [image?.value?.uri, state.anno]);

    function AnnoLoader() {
        const anno = useAnnotator();
        useEffect(() => {
            if (anno && !state.anno) {
                const selectionHandler = annotations => {
                    setState(prev => ({ ...prev, selectedAnnotation: annotations[0] || null }));
                };
                anno.on("selectionChanged", selectionHandler);
                setState(prev => ({ ...prev, anno }));
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
                            <img ref={imgRef} src={image.value.uri} alt="Annotatable" />
                        </ImageAnnotator>
                    </Annotorious>
                )}
            </div>
        </div>
    );
}

// Helper function to format annotations to PASCAL VOC XML
function formatAnnotationsToPascalVOC(annotations, imageName, imageWidth, imageHeight) {
    let xml = "<annotation>\n";
    xml += `  <filename>${imageName ? imageName : "image.jpg"}</filename>\n`;
    xml += `  <size>
    <width>${imageWidth}</width>
    <height>${imageHeight}</height>
    <depth>3</depth>
  </size>
`;

    annotations.forEach(annotation => {
        const label = annotation.body && annotation.body[0] ? annotation.body[0].value : "unknown";
        const selector = annotation.target.selector;

        if (selector && selector.type === "RECTANGLE" && selector.geometry) {
            const geom = selector.geometry;

            const x = parseInt(geom.x, 10);
            const y = parseInt(geom.y, 10);
            const w = parseInt(geom.w, 10);
            const h = parseInt(geom.h, 10);

            // Calculate bounding box coordinates
            const xmin = x;
            const ymin = y;
            const xmax = x + w;
            const ymax = y + h;

            xml += "  <object>\n";
            xml += `    <name>${label}</name>\n`;
            xml += `    <pose>Unspecified</pose>\n`;
            xml += `    <truncated>0</truncated>\n`;
            xml += `    <difficult>0</difficult>\n`;
            xml += "    <bndbox>\n";
            xml += `      <xmin>${xmin}</xmin>\n`;
            xml += `      <ymin>${ymin}</ymin>\n`;
            xml += `      <xmax>${xmax}</xmax>\n`;
            xml += `      <ymax>${ymax}</ymax>\n`;
            xml += "    </bndbox>\n";
            xml += "  </object>\n";
        } else {
            console.warn("Skipping annotation with unexpected selector:", annotation.id, selector?.type);
        }
    });

    xml += "</annotation>";
    return xml;
}
