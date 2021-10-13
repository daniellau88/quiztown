import {
    Box,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
    makeStyles,
} from '@material-ui/core';
import { fabric } from 'fabric';
import React, { useEffect, useState } from 'react';

import QTTextbox from '../../../components/fabric/QTTextbox';
import QTButton from '../../../components/QTButton';
import { AnswerData } from '../../../types/collections';
import colours from '../../../utilities/colours';
import { useWindowDimensions } from '../../../utilities/customHooks';
import {
    FONT_SIZE,
    initAnswerBoxes,
    initAnswerOptions,
    initCorrectAnswersIndicator,
    resetToOriginalPosition,
    revealAnswer,
    updateCorrectAnswersIndicator,
    validateAnswer,
} from '../utils';

import CollectionsImageCardEditControls from './CollectionsImageCardEditControls';


const MAX_CANVAS_WIDTH = 1280;
const SCREEN_PADDING = 40;
const HEADER_HEIGHT = 80;

const useStyles = makeStyles(() => ({
    root: {
        display: 'flex',
        paddingTop: '80px',
        paddingBottom: '80px',
    },
    canvas: {
    },
}));

interface CardImageProps {
    isEditing: boolean
    id: number,
    imageUrl: string,
    result: AnswerData[],
    imageMetadata: { width:number, height:number }
    onCardCompleted?: (nextBoxNumber:number, nextDate:Date) => void
}

const CardImage: React.FC<CardImageProps> = ({
    isEditing,
    id,
    imageUrl,
    result,
    imageMetadata,
    onCardCompleted,
}) => {
    const classes = useStyles();
    const CANVAS_ID = 'quiztown-canvas-' + id;

    const [canvas, setCanvas] = useState<fabric.Canvas>();
    const [hasAnsweredAll, setHasAnsweredAll] = useState(false);
    const [currentBox, setCurrentBox] = useState(0);

    const { windowHeight, windowWidth } = useWindowDimensions();

    const canvasMaxWidth = windowWidth - SCREEN_PADDING > MAX_CANVAS_WIDTH ? MAX_CANVAS_WIDTH : windowWidth;
    const canvasMaxHeight = windowHeight - HEADER_HEIGHT - SCREEN_PADDING;
    const imageXTranslation = Math.max(canvasMaxWidth - imageMetadata.width, 0) / 2;

    const initCanvasWithBg = () => {
        const canvas = new fabric.Canvas(CANVAS_ID, {
            hoverCursor: 'pointer',
            targetFindTolerance: 2,
        });
        canvas.setBackgroundImage(imageUrl, canvas.renderAll.bind(canvas), {
            scaleX: 1,
            scaleY: 1,
            left: canvas.getCenter().left,
            originX: 'center',
        });
        return canvas;
    };

    const initEditingCanvas = () => {
        const canvas = initCanvasWithBg();
        initAnswerBoxes(canvas, isEditing, result, imageXTranslation);

        canvas.on('object:modified', (e) => {
            if (e.target?.type != 'textbox') return;

            if (e.target) {
                // TODO: Implement answer options edit
            }
        });
        return canvas;
    };

    const initQuizingCanvas = () => {
        const canvas = initCanvasWithBg();
        const answersCoordsMap = initAnswerBoxes(canvas, isEditing, result, imageXTranslation);
        const optionsCoordsMap = initAnswerOptions(canvas, result);
        const answersIndicator = initCorrectAnswersIndicator(canvas, result);
        canvas.on('object:moving', (e) => {
            if (e.target) {
                e.target.opacity = 0.5;
            }
        });
        canvas.on('object:modified', (e) => {
            if (e.target?.type != 'QTText') {
                return;
            }

            const text = e.target as fabric.Text;
            const isAnswerCorrect = validateAnswer(text, answersCoordsMap);
            if (isAnswerCorrect) {
                canvas.remove(e.target);
                revealAnswer(answersCoordsMap, text, canvas);
                setHasAnsweredAll(updateCorrectAnswersIndicator(answersIndicator));
            } else {
                e.target.opacity = 1;
                resetToOriginalPosition(optionsCoordsMap, text);
            }
        });
        return canvas;
    };

    useEffect(() => {
        const canvas = isEditing ? initEditingCanvas() : initQuizingCanvas();
        setCanvas(canvas);
    }, []);

    useEffect(() => {
        if (canvas) {
            const scale = canvasMaxWidth / canvas.getWidth();
            canvas.setDimensions({ width: canvasMaxWidth, height: canvasMaxHeight });
            canvas.setViewportTransform([canvas.getZoom() * scale, 0, 0, canvas.getZoom() * scale, 0, 0]);
        }
    }, [windowHeight, windowWidth]);

    const onClose = () => {
        console.log('Close dialog');
    };

    const selectConfidence = (index: number) => {
        // const nextBoxNumber = getNextBoxNumber(currentBox, index + 1);
        // const nextDate = getNextIntervalEndDate(nextBoxNumber);
        // onCardCompleted(nextBoxNumber, nextDate);
    };

    const undo = () => {
        console.log('undo');
    };

    const redo = () => {
        console.log('redo');
    };

    const addAnswerOption = () => {
        if (!canvas) return;
        canvas.add(new QTTextbox('Answer Option', {
            hasBorders: false,
            borderColor: colours.BLACK,
            backgroundColor: colours.WHITE,
            stroke: colours.BLACK,
            fontSize: FONT_SIZE,
        }));
    };

    const deleteAnswerOption = () => {
        if (!canvas) return;
        const activeObjects = canvas.getActiveObjects();
        activeObjects.forEach(object => canvas.remove(object));
        canvas.discardActiveObject();
    };

    return (
        <>
            <CssBaseline />
            <Box className={classes.root}>
                <Grid container direction='column'>
                    <CollectionsImageCardEditControls
                        undo={undo}
                        redo={redo}
                        addOption={addAnswerOption}
                        deleteOption={deleteAnswerOption}
                    />
                    <Box display="flex" justifyContent='center' width='100%'>
                        <canvas
                            id={CANVAS_ID}
                            width={canvasMaxWidth}
                            height={canvasMaxHeight}
                            className={classes.canvas}
                        />
                    </Box>
                </Grid>

                <Dialog
                    open={hasAnsweredAll}
                    onClose={onClose}
                >
                    <DialogTitle>
                        Card completed!
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            You have answered all the questions in the cards, how confident did you feel?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        {/* {getIntervals(currentBox).map((interval, index) => (
                                <QTButton
                                    key={index}
                                    onClick={() => selectConfidence(index)}
                                >
                                    Confidence: {index + 1}, Interval: {interval}
                                </QTButton>
                            ))} */}
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};

export default CardImage;
