import React, { useContext, createContext, useRef, useCallback } from "react";

export const EventSystem = createContext();
EventSystem.displayName = "Event System";

export const useEventSystem = () => useContext(EventSystem);

export default function EventSystemProvider({children}) {
	const eventRef = useRef({});
	
	const register = useCallback(
		(eventName, cb) => {
			if (!eventRef.current[eventName]) {
				eventRef.current[eventName] = [];
			}
			eventRef.current[eventName].push(cb);
		}, []
	)

	const unregister = useCallback(
		(eventName, cb) => {
			if (eventRef.current[eventName]) {
				eventRef.current[eventName] = eventRef.current[eventName].filter(e => e !== cb);
			}
		}, []
	)

	const unregisterAll = useCallback(
		(eventName) => {
			if (eventRef.current[eventName]) {
				eventRef.current[eventName] = [];
			}
		}, []
	)

	const dispatch = useCallback(
		(eventName, ...args) => {
			if (eventRef.current[eventName]) {
				eventRef.current[eventName].forEach(cb => cb.call(null, ...args));
			}
		}, []
	)

	return <EventSystem.Provider value={{ register, unregister, unregisterAll, dispatch }}>{children}</EventSystem.Provider>
}