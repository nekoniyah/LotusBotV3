<script lang="ts">
	import { authorized, root } from '$lib';
	import { onMount } from 'svelte';

	onMount(() => {
		if (localStorage.getItem('token')) {
			document.location.assign('/dash');
		}
	});
</script>

<div>
	<h1>You are not allowed to manage Lotus</h1>
	<a href={`${root}/auth/discord`}> <h2>Click here to try logging again.</h2></a>
</div>

<style lang="scss">
	:global(body, html) {
		background-color: black;
	}

	div {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		* {
			font-family: sans-serif;
			color: white;
		}

		a {
			text-decoration: none;
		}

		a :hover {
			text-decoration-line: underline;
		}
	}
</style>
