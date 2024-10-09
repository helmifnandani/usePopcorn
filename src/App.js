import { useEffect, useRef, useState } from "react";
import axios from "axios";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

// const tempMovieData = [
// 	{
// 		imdbID: "tt1375666",
// 		Title: "Inception",
// 		Year: "2010",
// 		Poster:
// 			"https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
// 	},
// 	{
// 		imdbID: "tt0133093",
// 		Title: "The Matrix",
// 		Year: "1999",
// 		Poster:
// 			"https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
// 	},
// 	{
// 		imdbID: "tt6751668",
// 		Title: "Parasite",
// 		Year: "2019",
// 		Poster:
// 			"https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
// 	},
// ];

// const tempWatchedData = [
// 	{
// 		imdbID: "tt1375666",
// 		Title: "Inception",
// 		Year: "2010",
// 		Poster:
// 			"https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
// 		runtime: 148,
// 		imdbRating: 8.8,
// 		userRating: 10,
// 	},
// 	{
// 		imdbID: "tt0088763",
// 		Title: "Back to the Future",
// 		Year: "1985",
// 		Poster:
// 			"https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
// 		runtime: 116,
// 		imdbRating: 8.5,
// 		userRating: 9,
// 	},
// ];

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = `dde66ea2`;

export default function App() {
	const [query, setQuery] = useState("");
	const [selectedId, setSelectedId] = useState(null);

	// Custom Hooks
	const { movies, error, isLoading } = useMovies(query, handleCloseMovie);
	const [watched, setWatched] = useLocalStorageState([], "watched");

	// const [watched, setWatched] = useState([]);
	// bisa lempar callback function, jadi initial statenya ya tergantung yang di return dari callback functionnya apa. Functionnya harus pure, artinya nggak boleh dan nggak bisa lempar argument. function ini juga nggak akan di re run setelah re render, harusnya cuma sekali aja pas awal initial render
	// const [watched, setWatched] = useState(function () {
	// 	const storedValue = localStorage.getItem("watched");
	// 	return JSON.parse(storedValue);
	// });

	function handleSelectMovie(id) {
		setSelectedId((sId) => (id === sId ? null : id));
	}

	function handleCloseMovie() {
		setSelectedId(null);
	}

	function handleAddWatched(movie) {
		setWatched((watched) => [...watched, movie]);

		// nggak bisa langsung gini karena set State itu async, jadi watched nya masih kosong sesuai initial state
		// localStorage.setItem("watched", watched);

		// localstorage key dan valuenya harus string
		// localStorage.setItem("watched", JSON.stringify([...watched, movie]));
	}

	function handleDeleteWatched(id) {
		setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
	}

	// useEffect(
	// 	function () {
	// 		// bisa langsung di set karena effect ini ke trigger ketika ada changes di watched, jadi udah pasti dalam keadaan updated
	// 		localStorage.setItem("watched", JSON.stringify(watched));
	// 	},
	// 	[watched]
	// );

	return (
		<>
			<NavBar>
				<Search query={query} setQuery={setQuery} />
				<NumResults movies={movies} />
			</NavBar>
			<Main>
				<Box>
					{/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
					{isLoading && <Loader />}
					{!isLoading && !error && (
						<MovieList movies={movies} onSelectMovie={handleSelectMovie} />
					)}
					{error && <ErrorMessage message={error} />}
				</Box>
				<Box>
					{selectedId ? (
						<MovieDetails
							selectedId={selectedId}
							onCloseMovie={handleCloseMovie}
							onAddWatched={handleAddWatched}
							watched={watched}
						/>
					) : (
						<>
							<WathcedSummary watched={watched} />
							<WatchedMovieList
								watched={watched}
								onDeleteWatched={handleDeleteWatched}
							/>
						</>
					)}
				</Box>
			</Main>
		</>
	);
}

function Loader() {
	return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
	return (
		<p className="error">
			<span>⛔</span>
			<span>{message}</span>
		</p>
	);
}

function NavBar({ children }) {
	return (
		<nav className="nav-bar">
			<Logo />
			{children}
		</nav>
	);
}

function Logo() {
	return (
		<div className="logo">
			<span role="img">🍿</span>
			<h1>usePopcorn</h1>
		</div>
	);
}

function NumResults({ movies }) {
	return (
		<p className="num-results">
			Found <strong>{movies.length}</strong> results
		</p>
	);
}

function Search({ query, setQuery }) {
	// useEffect(function () {
	// di react nggak oke kalo select dom gini atau addeventlistener
	// const el = document.querySelector(".search");
	// el.focus();
	// }, []);

	// kalau mau mutate DOM better pake useRef
	// argumen yang dilempar ke useRef adalah initial value, tapi kalo berhubungan sama DOM biasanya initialnya null
	const inputEl = useRef(null);

	useKey("Enter", function () {
		if (document.activeElement === inputEl.current) return;
		inputEl.current.focus();
		setQuery("");
	});

	// Kalo udah bikin variablenya (dengan nama apapun) di taruh di elementnya dengan panggil ref={<nama variable>}. Jadi udah nggak perlu pake querySelector lagi, ref dan DOMnya sudah terhubung
	// useEffect(
	// 	function () {
	// 		function callback(e) {
	// 			if (document.activeElement === inputEl.current) return;
	// 			if (e.code === "Enter") {
	// 				inputEl.current.focus();
	// 				setQuery("");
	// 			}
	// 		}

	// 		document.addEventListener("keydown", callback);
	// 		return () => document.removeEventListener("keydown", callback);
	// 	},
	// 	[setQuery]
	// );

	return (
		<input
			className="search"
			type="text"
			placeholder="Search movies..."
			value={query}
			onChange={(e) => setQuery(e.target.value)}
			ref={inputEl}
		/>
	);
}

function Main({ children }) {
	return <main className="main">{children}</main>;
}

function Box({ children }) {
	const [isOpen, setIsOpen] = useState(true);
	return (
		<div className="box">
			<button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
				{isOpen ? "–" : "+"}
			</button>
			{isOpen && children}
		</div>
	);
}

function MovieList({ movies, onSelectMovie }) {
	return (
		<ul className="list list-movies">
			{movies?.map((movie) => (
				<Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
			))}
		</ul>
	);
}

function Movie({ movie, onSelectMovie }) {
	return (
		<li onClick={() => onSelectMovie(movie.imdbID)}>
			<img src={movie.Poster} alt={`${movie.Title} poster`} />
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>🗓</span>
					<span>{movie.Year}</span>
				</p>
			</div>
		</li>
	);
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
	const [movie, setMovie] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [userRating, setUserRating] = useState("");

	// kalau pakai variableb biasa gini, ketika re-render variablenya di declare ulang lagi, jadi balik ke 0 lagi
	let count = 0;
	// tapi kalau pakai ref, sekali di declare, variable dan valunya di simpan
	const countRef = useRef(0);

	useEffect(
		function () {
			if (userRating) countRef.current++;
		},
		[userRating]
	);

	const {
		Title: title,
		Year: year,
		Poster: poster,
		Runtime: runtime,
		imdbRating,
		Plot: plot,
		Released: released,
		Actors: actors,
		Director: director,
		Genre: genre,
	} = movie;

	// if (imdbRating > 8) return <p>Great Film</p>;
	// ini nggak bisa karena di peraturan hooks, hooks nggak boleh ada didalam atau dihalangi atau dilewati conditional
	// if (imdbRating > 8) [isTop, setIsTop] = useState(true)

	// const [isTop, setIsTop] = useState(imdbRating > 8);
	// useEffect(
	// 	function () {
	// 		setIsTop(imdbRating > 8);
	// 	},
	// 	[imdbRating]
	// );

	// atau lebih simple bisa pakai derived state
	const isTop = imdbRating > 8;

	// Cara udemy
	const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
	const watchedUserRating = watched.find(
		(movie) => movie.imdbID === selectedId
	)?.userRating;

	function handleAdd() {
		const newWatchedMovie = {
			imdbID: selectedId,
			title,
			year,
			poster,
			imdbRating: Number(imdbRating),
			runtime: Number(runtime.split(" ")[0]),
			userRating,
			countRatingDescisions: countRef.current,
		};

		// Cara helmi
		const isMovieAdded = watched.findIndex(
			(movie) => movie.imdbID === selectedId
		);

		// if (isMovieAdded >= 0) {
		// 	alert("Movie is already added, try other movie");
		// 	return;
		// }
		onAddWatched(newWatchedMovie);
		onCloseMovie();

		// waktu ini dipanggil AvgRatingnya nggak langsung berubah karena useState itu asynchronous function
		// setAvgRating(Number(imdbRating));

		// kalau mau ambil sesuai current value
		// setAvgRating((avgRating) => (avgRating + userRating) / 2)
	}

	useKey("Escape", onCloseMovie);

	// useEffect(
	// 	function () {
	// 		function callback(e) {
	// 			if (e.code === "Escape") {
	// 				onCloseMovie();
	// 			}
	// 		}

	// 		document.addEventListener("keydown", callback);

	// 		// ini gunanya kalo componentnya unmounted, eventnnya di remove biar nggak kejadian terus terusan
	// 		return function () {
	// 			document.removeEventListener("keydown", callback);
	// 		};
	// 	},
	// 	[onCloseMovie]
	// );

	useEffect(
		function () {
			async function getMovieDetails() {
				setIsLoading(true);
				const res = await axios.get(
					`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
				);
				let { data } = res;
				setMovie(data);
				setIsLoading(false);
			}
			getMovieDetails();
		},
		[selectedId]
	);

	useEffect(
		function () {
			if (!title) return;
			document.title = `Movie | ${title}`;

			// Cleanup function / function yang di return dari useEffect
			return function () {
				document.title = "usePopcorn";
				// console.log(`clean up effect for movie ${title}`);
			};
		},
		[title]
	);

	return (
		<div className="details">
			{isLoading ? (
				<Loader />
			) : (
				<>
					<header>
						<button className="btn-back" onClick={onCloseMovie}>
							&larr;
						</button>
						<img src={poster} alt={`Poster of ${movie} movie`} />
						<div className="details-overview">
							<h2>{title}</h2>
							<p>
								{released} &bull; {runtime}
							</p>
							<p>{genre}</p>
							<p>
								<span>⭐</span> {imdbRating} IMDb rating
							</p>
						</div>
					</header>

					<section>
						<div className="rating">
							{!isWatched ? (
								<>
									<StarRating
										maxRating={10}
										size={24}
										onSetRating={setUserRating}
									/>

									{userRating > 0 && (
										<button className="btn-add" onClick={handleAdd}>
											+ Add to List
										</button>
									)}
								</>
							) : (
								<p>
									You rated this movie {watchedUserRating} <span>⭐</span>
								</p>
							)}
						</div>
						<p>
							<em>{plot}</em>
						</p>
						<p>Starring {actors}</p>
						<p>Directed by {director}</p>
					</section>
				</>
			)}
		</div>
	);
}

function WathcedSummary({ watched }) {
	const avgImdbRating = average(
		watched.map((movie) => movie.imdbRating)
	).toFixed(2);
	const avgUserRating = average(
		watched.map((movie) => movie.userRating)
	).toFixed(2);
	const avgRuntime = average(watched.map((movie) => movie.runtime)).toFixed(2);
	return (
		<div className="summary">
			<h2>Movies you watched</h2>
			<div>
				<p>
					<span>#️⃣</span>
					<span>{watched.length} movies</span>
				</p>
				<p>
					<span>⭐️</span>
					<span>{avgImdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{avgUserRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{avgRuntime} min</span>
				</p>
			</div>
		</div>
	);
}

function WatchedMovieList({ watched, onDeleteWatched }) {
	return (
		<ul className="list">
			{watched.map((movie) => (
				<WatchedMovie
					movie={movie}
					key={movie.imdbID}
					onDeleteWatched={onDeleteWatched}
				/>
			))}
		</ul>
	);
}

function WatchedMovie({ movie, onDeleteWatched }) {
	return (
		<li>
			<img src={movie.poster} alt={`${movie.title} poster`} />
			<h3>{movie.title}</h3>
			<div>
				<p>
					<span>⭐️</span>
					<span>{movie.imdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{movie.userRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{movie.runtime} min</span>
				</p>

				<button
					className="btn-delete"
					onClick={() => onDeleteWatched(movie.imdbID)}>
					X
				</button>
			</div>
		</li>
	);
}
