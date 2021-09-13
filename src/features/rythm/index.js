import React, { useState, useRef, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import Track from './Track';
import Canvas from './Canvas';
import { notes, CalcNotePositions } from 'config/notes';
import { useEventSystem } from 'utils/EventSystem';
import './style.css';


function Rythmboard({ playState, speed }) {
	const trackList = useRef(null);
	const canvasRef = useRef(null);
	const [size, setSize] = useState({width: 0, height: 0});
	const eventSystem = useEventSystem();

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

		const onPreview = (ansi, duration) => {
			let index = notes.findIndex(note => note.ansi === ansi);
			trackList.current[index].addDrop(duration, speed);
		};

		eventSystem.register('preview_key', onPreview);
		return () => eventSystem.unregister('preview_key', onPreview);
	}, [handleResize, eventSystem, speed]);

	useEffect(() => {
		if (playState === 'stopped') {
			if (trackList.current) {
				trackList.current.forEach(track => track.clean());
			}
		}
	}, [playState])

	const draw = useCallback((ctx, deltaTime) => {
		if (trackList.current) {
			trackList.current.forEach(track => track.draw(ctx, playState === 'paused' ? 0 : deltaTime));
		}
	}, [playState]);

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

export default connect(
	state => ({
		playState: state.player.playState,
		speed: state.player.speed
	})
)(Rythmboard)