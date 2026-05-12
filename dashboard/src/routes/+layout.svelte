<script lang="ts">
	import { token } from '$lib';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	let { children } = $props();

	onMount(async () => {
		if (localStorage.getItem('token')) token.set(localStorage.getItem('token'));
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style lang="scss">
	:global(*) {
		font-family: sans-serif;
	}

	:global(button) {
		background-color: pink;
		color: black;
		outline: none;
		border: none;
		padding: 10px;
		border-radius: 15px;
	}
</style>
