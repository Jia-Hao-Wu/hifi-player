import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "favorites";

export interface Favorite {
	id: string;
	type: "album" | "playlist";
	title: string;
	image?: string;
	subtitle?: string;
	addedAt: number;
}

interface FavoritesContextType {
	favorites: Favorite[];
	isFavorite: (id: string) => boolean;
	toggleFavorite: (item: Omit<Favorite, "addedAt">) => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
	const [favorites, setFavorites] = useState<Favorite[]>([]);
	const ref = useRef<Favorite[]>([]);

	useEffect(() => {
		AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
			if (raw) {
				const parsed = JSON.parse(raw);
				ref.current = parsed;
				setFavorites(parsed);
			}
		});
	}, []);

	const persist = useCallback((next: Favorite[]) => {
		ref.current = next;
		setFavorites(next);
		AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	}, []);

	const isFavorite = useCallback((id: string) => {
		return ref.current.some((f) => f.id === id);
	}, []);

	const toggleFavorite = useCallback((item: Omit<Favorite, "addedAt">) => {
		if (ref.current.some((f) => f.id === item.id)) {
			persist(ref.current.filter((f) => f.id !== item.id));
		} else {
			persist([...ref.current, { ...item, addedAt: Date.now() }]);
		}
	}, [persist]);

	return (
		<FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
			{children}
		</FavoritesContext.Provider>
	);
}

export function useFavorites() {
	const ctx = useContext(FavoritesContext);
	if (!ctx) throw new Error("useFavorites must be used within <FavoritesProvider>");
	return ctx;
}
