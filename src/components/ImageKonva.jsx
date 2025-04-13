import { createElement, useState, useRef, useEffect } from "react";
import { Stage, Layer, Image, Rect, Text } from "react-konva";
import Konva from "konva";

export function ImageKonva({ image, labelList, labelTitle, labelColor, onChange }) {
    const [annotations, setAnnotations] = useState([]);
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [newAnnotation, setNewAnnotation] = useState(null);
    const stageRef = useRef(null);
    const imageRef = useRef(null);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [imageObject, setImageObject] = useState(null);

    // Load the image
    useEffect(() => {
        if (image && image.uri) {
            const img = new window.Image();
            img.src = image.uri;
            img.onload = () => {
                setImageSize({
                    width: img.width,
                    height: img.height
                });
                setImageObject(img);
            };
        }
    }, [image]);

    const handleMouseDown = (e) => {
        if (!selectedLabel) return;
        
        setIsDrawing(true);
        const pos = e.target.getStage().getPointerPosition();
        setNewAnnotation({
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            label: selectedLabel
        });
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;
        
        const pos = e.target.getStage().getPointerPosition();
        setNewAnnotation({
            ...newAnnotation,
            width: pos.x - newAnnotation.x,
            height: pos.y - newAnnotation.y
        });
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        
        setIsDrawing(false);
        if (newAnnotation.width !== 0 && newAnnotation.height !== 0) {
            setAnnotations([...annotations, newAnnotation]);
            if (onChange) {
                onChange(annotations);
            }
        }
        setNewAnnotation(null);
    };

    const exportToBase64 = () => {
        if (!stageRef.current) return null;
        
        const dataURL = stageRef.current.toDataURL({
            mimeType: 'image/png',
            quality: 1
        });
        return dataURL;
    };

    // Process labelList to create label objects using expressions
    const processedLabels = labelList?.items?.map((item) => ({
        id: item.id,
        title: labelTitle.get(item).value,
        color: labelColor.get(item).value
    })) || [];

    return (
        <div className="image-annotator">
            <div className="label-selector">
                {processedLabels.map((label) => (
                    <button
                        key={label.id}
                        style={{ backgroundColor: label.color }}
                        onClick={() => setSelectedLabel(label)}
                        className={selectedLabel?.id === label.id ? 'selected' : ''}
                    >
                        {label.title}
                    </button>
                ))}
            </div>
            
            <Stage
                ref={stageRef}
                width={imageSize.width}
                height={imageSize.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                <Layer>
                    {imageObject && (
                        <Image
                            ref={imageRef}
                            image={imageObject}
                            width={imageSize.width}
                            height={imageSize.height}
                        />
                    )}
                    {annotations.map((annotation, index) => (
                        <Rect
                            key={index}
                            x={annotation.x}
                            y={annotation.y}
                            width={annotation.width}
                            height={annotation.height}
                            stroke={annotation.label.color}
                            strokeWidth={2}
                        />
                    ))}
                    {newAnnotation && (
                        <Rect
                            x={newAnnotation.x}
                            y={newAnnotation.y}
                            width={newAnnotation.width}
                            height={newAnnotation.height}
                            stroke={newAnnotation.label.color}
                            strokeWidth={2}
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
}
