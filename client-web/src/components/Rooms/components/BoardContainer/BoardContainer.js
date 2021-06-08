import React, {useEffect, useRef, useState} from 'react';
import './BoardContainer.css';

const BoardContainer = ({socket, room, nickname}) => {

    const [showBoard, setShowBoard] = useState(true);
    const [curImage, setCurImage] = useState(null);
    const WIDTH = 480;
    const HEIGHT = 320;
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);

    let cleanBoard = () => {
        const canvas = document.getElementsByClassName('board-canvas')[0];
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.rect(0,0,WIDTH,HEIGHT)
        ctx.fill();
        const base64ImageData = canvas.toDataURL('image/png');
        console.log('image send')
        socket.emit('send draw', {
            roomid: room.roomid,
            drawing: {value: base64ImageData, nickname: nickname}
        })
    }

    const unwrapBoard = () => {
        if(showBoard) {
            setShowBoard(false);
        } else {
            setShowBoard(true);
        }
    }

    return <div className='board-container'>
        <p onClick={unwrapBoard}>Board: {showBoard ? 'hide' : 'show'}</p>
        {showBoard && <div className='tools-container'>
            <div className='color-picker-container'>
                <p>Color select:</p>
                <input type='color' value={color} onChange={(e) => {
                    setColor(e.target.value)
                }}/>
            </div>
            <div className='brush-picker-container'>
                <p>Brush size:</p>
                <select onChange={(e) => {
                    setBrushSize(e.target.value)
                }}>
                    <option>5</option>
                    <option>10</option>
                    <option>15</option>
                    <option>20</option>
                    <option>25</option>
                    <option>30</option>
                </select>
            </div>
            <div>
                <button onClick={cleanBoard}>Clean Board</button>
            </div>
        </div>}
        {showBoard && <Board socket={socket}
                             room={room}
                             nickname={nickname}
                             brushSize={brushSize}
                             color={color}
                             curImage={curImage} setCurImage={setCurImage}
                             isShown={showBoard}
        />}
    </div>
}

const Board = ({socket, room, nickname, color, brushSize, curImage, setCurImage, isShown}) => {

    const SEND_DELAY = 500;
    const drawTimeout = useRef(null);

    useEffect(()=>{
        const canvas = document.getElementsByClassName('board-canvas')[0];
        const ctx = canvas.getContext('2d');

        // set offsets, not resizing because of other containers
        const board = document.getElementsByClassName('board')[0];
        const sketch_style = getComputedStyle(board);
        canvas.width = parseInt(sketch_style.getPropertyValue('width'));
        canvas.height = parseInt(sketch_style.getPropertyValue('height'));

        let mouse = {x: 0, y: 0};
        let last_mouse = {x: 0, y: 0};

        // Mouse Capturing Work
        canvas.addEventListener('mousemove', function(e) {
            last_mouse.x = mouse.x;
            last_mouse.y = mouse.y;

            mouse.x = e.pageX - this.offsetLeft;
            mouse.y = e.pageY - this.offsetTop;
        }, false);


        // Drawing on Paint App
        ctx.lineWidth = brushSize;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;

        canvas.addEventListener('mousedown', function(e) {
            canvas.addEventListener('mousemove', onPaint, false);
        }, false);

        canvas.addEventListener('mouseup', function() {
            canvas.removeEventListener('mousemove', onPaint, false);
        }, false);

        const onPaint = () => {
            ctx.beginPath();
            ctx.moveTo(last_mouse.x, last_mouse.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.closePath();
            ctx.stroke();

            if(drawTimeout.current) {
                clearTimeout(drawTimeout.current);
            }
            drawTimeout.current = setTimeout(() => {
                const base64ImageData = canvas.toDataURL('image/png');
                console.log('image send')
                socket.emit('send draw', {
                    roomid: room.roomid,
                    drawing: {value: base64ImageData, nickname: nickname}
                })
                setCurImage(base64ImageData);
            }, SEND_DELAY);
        };

        // receive drawing
        socket.on('add draw', ({drawing}) => {
            const image = new Image();
            image.onload = () => {
                ctx.drawImage(image, 0, 0);
            };
            image.src = drawing.value;
        })

    },[])

    useEffect(()=>{
        const canvas = document.getElementsByClassName('board-canvas')[0];
        if(canvas){
            const ctx = canvas.getContext('2d');

            ctx.lineWidth = brushSize;
            ctx.strokeStyle = color;
        }
    },[color, brushSize])

    useEffect(()=>{
        const canvas = document.getElementsByClassName('board-canvas')[0];
        const ctx = canvas.getContext('2d');
        if(ctx && curImage) {
            const image = new Image();
            image.onload = () => {
                ctx.drawImage(image, 0, 0);
            };
            image.src = curImage;
        }
    }, [isShown])

    /*const mainDrawFunc = () => {


    }*/

    return <div className='board'>
        <canvas className='board-canvas'/>
    </div>
}

export default BoardContainer;