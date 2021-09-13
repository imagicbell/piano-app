import React, { useState, useRef, useEffect, useCallback } from 'react';
import Track from './Track';
import Canvas from './Canvas';
import { notes, CalcNotePositions } from 'config/notes';
import { useEventSystem } from 'utils/EventSystem';
import './style.css';


export default function Rythmboard({ previewKeys, dispatch }) {
	const trackList = useRef(null);
	const canvasRef = useRef(null);
	const [size, setSize] = useState({width: 0, height: 0});
	const eventSystem = useEventSystem();
	const [paused, setPaused] = useState(false);

	const handleResize = useCallback(() => {
		if (!canvasRef.current) {
			return;
		}

		console.log(`canvas width: ${canvasRef.current.offsetWidth}, height: ${canvasRef.current.offsetWidth}`);

		const canvasSize = {
			width: canvasRef.current.offsetWidth,
			height: canvasRef.current.offsetHeight
		}

		setSize(canvasSize);

		const notePositions = CalcNotePositions();
		if (trackList.current) {
			trackList.current.forEach(track => track.clean());
		}
		if (canvasSize.width > 0) {
			trackList.current = notePositions.leftPositions.map((lp, index) => {
				const w = (notes[index].type === 'white' ? notePositions.whiteWidth : notePositions.blackWidth) / 100*canvasSize.width;
				let pos = lp.left / 100*canvasSize.width + w * 0.5;
				return new Track({
					ansi: lp.ansi, 
					type: notes[index].type, 
					leftOffset: pos, 
					size: w * 0.4
				})
			});
		}
	}, []);
	
	useEffect(() => {
		window.addEventListener('resize', handleResize);	
		handleResize();

		eventSystem.register('preview_key', (ansi, duration) => {
			let index = notes.findIndex(note => note.ansi === ansi);
			trackList.current[index].addDrop(duration);
		})

		eventSystem.register('pause', () => setPaused(true));
		eventSystem.register('resume', () => setPaused(false));
		eventSystem.register('stop', () => {
			if (trackList.current) {
				trackList.current.forEach(track => track.clean());
			}
		});
		
	}, [handleResize, eventSystem]);

	const draw = useCallback((ctx, deltaTime) => {
		if (trackList.current) {
			trackList.current.forEach(track => track.draw(ctx, paused ? 0 : deltaTime));
		}
	}, [paused]);

	return (
		<div className="rythmboard" ref={canvasRef}>
			<Canvas 
				id="playCanvas" 
				width={size.width}
				height={size.height}
				draw={draw}
			/>
		</div>
	)
}
