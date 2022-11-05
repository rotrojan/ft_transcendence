import React from "react";

interface CanvasProps {
    ballX: number;
    ballY: number;
    paddleLeftY: number;
    paddleRightY: number;
    paddleSize: number;
    playerLeftName: string;
    playerRightName: string;
    scoreLeft: number;
    scoreRight: number;
}

function paddle(context: CanvasRenderingContext2D, paddleX: number, paddleY: number, paddleSize: number) {
    context.fillStyle = '#fef45b';

    context.fillRect(paddleX, paddleY, 5, paddleSize);
}

function ball(context: CanvasRenderingContext2D, ballX: number, ballY: number, ballColor: string) {
    const BALL_RADIUS = 3;

    context.fillStyle = ballColor;
    context.beginPath();
    context.arc(ballX, ballY, BALL_RADIUS, 0, 2 * Math.PI);
    context.fill();
}

const Canvas = ({
                ballX,
                ballY,
                paddleLeftY,
                paddleRightY,
                paddleSize,
                playerLeftName,
                playerRightName,
                scoreLeft,
                scoreRight }: CanvasProps) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const context = canvasRef.current?.getContext("2d");
    if (context) {
        // find ballX min and ballX max
        context.clearRect(0, 0, 1000, 1000);
        ball(context, ballX, ballY, "#FA0197");
        paddle(context, 10, paddleLeftY, paddleSize);
        paddle(context, 285, paddleRightY, paddleSize);
    }

    return (<canvas id="canvas" ref={canvasRef}/>);
}

export default Canvas;