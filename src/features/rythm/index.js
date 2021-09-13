import React, { useState, useRef, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import Track from './Track';
import Canvas from './Canvas';
import { notes, CalcNotePositions } from 'config/notes';
import { cleanPreview } from './action';
import './style.css';

function Rythmboard({ previewKeys, dispatch }) {
	const trackList = useRef(null);
	const canvasRef = useRef(null);
	const [size, setSize] = useState({width: 0, height: 0});

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
	}, [handleResize]);

	useEffect(() => {
		if (previewKeys.length > 0) {
			previewKeys.forEach(keyInfo => {
				let index = notes.findIndex(note => note.ansi === keyInfo.name);
				trackList.current[index].addDrop(keyInfo.duration);
			});
			dispatch(cleanPreview());
		}
	}, [previewKeys, dispatch])

	const draw = useCallback((ctx, deltaTime) => {
		if (trackList.current) {
			trackList.current.forEach(track => track.draw(ctx, deltaTime));
		}
	}, []);

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
    previewKeys: state.rythm.previewKeys,
  })
)(Rythmboard);