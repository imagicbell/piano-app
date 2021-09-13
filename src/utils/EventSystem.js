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

	const dispatch = useCallback(
		(eventName, ...args) => {
			if (eventRef.current[eventName]) {
				eventRef.current[eventName].forEach(cb => cb.call(null, ...args));
			}
		}, []
	)

	return <EventSystem.Provider value={{ register, dispatch }}>{children}</EventSystem.Provider>
}