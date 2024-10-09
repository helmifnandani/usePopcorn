import { useState, useEffect } from "react";
import axios from "axios";

const KEY = `dde66ea2`;

export function useMovies(query, callback) {
	const [movies, setMovies] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(
		function () {
			// optional chain: kalo callbacknya nggak null, baru di run functionnya
			callback?.();

			const controller = new AbortController();
			// fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=spiderman`)
			// 	.then((res) => res.json())
			// 	.then((data) => setMovies(data.Search));
			async function fetchMovies() {
				try {
					setError("");
					setIsLoading(true);
					const res = await axios.get(
						`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
						{ signal: controller.signal }
					);

					if (res.status !== 200) {
						throw new Error("Something went wrong");
					}
					let { data } = res;
					if (data.Response === "True") {
						setMovies(data.Search);
					} else {
						throw new Error(data.Error);
					}
					setError("");
				} catch (err) {
					if (err.name !== "CanceledError" || err.name !== "AbortError") {
						setError(err.message);
					}
				} finally {
					setIsLoading(false);
				}
			}

			if (query.length < 3) {
				setMovies([]);
				setError("");
				return;
			}

			fetchMovies();

			// tiap ngetik search keyword kan effect ini di execute, jadi component ini di re - render. setiap sebelum re-render clean up functionnya dijalanin, which is abort fetch
			return function () {
				controller.abort();
			};
		},
		// artinya useEffect ini listening ke statenya query, kalo ada changes, effect ini akan di trigger lagi
		[query]
	);

	return { movies, error, isLoading };
}
