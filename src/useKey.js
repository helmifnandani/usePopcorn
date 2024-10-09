import { useEffect } from "react";

export function useKey(key, action) {
	useEffect(
		function () {
			function callback(e) {
				if (e.code.toLowerCase() === key.toLowerCase()) {
					action();
				}
			}

			document.addEventListener("keydown", callback);

			// ini gunanya kalo componentnya unmounted, eventnnya di remove biar nggak kejadian terus terusan
			return function () {
				document.removeEventListener("keydown", callback);
			};
		},
		[action, key]
	);
}
