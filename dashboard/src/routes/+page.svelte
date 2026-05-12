<script lang="ts">
	import { authorized, root, token } from '$lib';
	import { onMount } from 'svelte';

	onMount(async () => {
		const t = localStorage.getItem('token');

		const params = new URLSearchParams(window.location.search);
		if (!t && params.get('code')) {
			const res = await fetch(`${root}/auth/discord/exchange`, {
				method: 'POST',
				body: JSON.stringify({ code: params.get('code') }),
				mode: 'cors',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const json = await res.json();
			localStorage.setItem('token', `${json.token_type} ${json.access_token}`);
		}

		if (!t && !params.get('code')) {
			document.location.assign('/login');
			return;
		}

		if (t) token.set(t);
	});

	token.subscribe(async (v) => {
		if (v) {
			try {
				const res = await fetch(`${root}/api/channels`, { headers: { Authorization: v } });
				document.location.assign('/dash');
			} catch {
				localStorage.removeItem('token');
				document.location.reload();
			}
		}
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
