<script lang="ts">
	import { token } from '$lib';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import '@fortawesome/fontawesome-free/css/all.min.css';

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
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #1a1a2e;
		color: #eaeaea;
	}

	/* Button Styles */
	:global(button) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		outline: none;
		border: none;
		padding: 12px 24px;
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
	}

	:global(button:hover) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
	}

	:global(button:active) {
		transform: translateY(0);
		box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
	}

	:global(button:disabled) {
		background: #4a4a5a;
		cursor: not-allowed;
		box-shadow: none;
		transform: none;
	}

	:global(button.secondary) {
		background: transparent;
		border: 2px solid #667eea;
		color: #667eea;
		box-shadow: none;
	}

	:global(button.secondary:hover) {
		background: rgba(102, 126, 234, 0.1);
		box-shadow: none;
	}

	:global(button.danger) {
		background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
		box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
	}

	:global(button.danger:hover) {
		box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
	}

	/* Input Styles */
	:global(input[type="text"]),
	:global(input[type="email"]),
	:global(input[type="password"]),
	:global(input[type="number"]),
	:global(input[type="search"]) {
		width: 100%;
		padding: 14px 18px;
		border: 2px solid #2d2d44;
		border-radius: 8px;
		background-color: #16213e;
		color: #eaeaea;
		font-size: 1rem;
		transition: all 0.3s ease;
		outline: none;
	}

	:global(input[type="text"]:focus),
	:global(input[type="email"]:focus),
	:global(input[type="password"]:focus),
	:global(input[type="number"]:focus),
	:global(input[type="search"]:focus) {
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
	}

	:global(input[type="text"]::placeholder),
	:global(input[type="email"]::placeholder),
	:global(input[type="password"]::placeholder),
	:global(input[type="number"]::placeholder),
	:global(input[type="search"]::placeholder) {
		color: #6b7280;
	}

	/* Textarea Styles */
	:global(textarea) {
		width: 100%;
		padding: 14px 18px;
		border: 2px solid #2d2d44;
		border-radius: 8px;
		background-color: #16213e;
		color: #eaeaea;
		font-size: 1rem;
		font-family: inherit;
		resize: vertical;
		min-height: 100px;
		transition: all 0.3s ease;
		outline: none;
	}

	:global(textarea:focus) {
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
	}

	:global(textarea::placeholder) {
		color: #6b7280;
	}

	/* Select Styles */
	:global(select) {
		width: 100%;
		padding: 14px 18px;
		border: 2px solid #2d2d44;
		border-radius: 8px;
		background-color: #16213e;
		color: #eaeaea;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.3s ease;
		outline: none;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 16px center;
		padding-right: 40px;
	}

	:global(select:focus) {
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
	}

	:global(select option) {
		background-color: #16213e;
		color: #eaeaea;
		padding: 12px;
	}

	/* Label Styles */
	:global(label) {
		display: block;
		margin-bottom: 8px;
		font-weight: 600;
		color: #c9d1d9;
		font-size: 0.9rem;
	}

	/* Form Group */
	:global(.form-group) {
		margin-bottom: 1.5rem;
	}

	/* Card Styles */
	:global(.card) {
		background: linear-gradient(145deg, #1e1e32 0%, #16213e 100%);
		border-radius: 12px;
		padding: 1.5rem;
		border: 1px solid #2d2d44;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}

	/* Headings */
	:global(h1) {
		color: #ffffff;
		font-weight: 700;
		margin-bottom: 1rem;
	}

	:global(h2) {
		color: #e0e0e0;
		font-weight: 600;
	}

	:global(h3) {
		color: #c9d1d9;
		font-weight: 600;
	}

	/* Links */
	:global(a) {
		color: #667eea;
		text-decoration: none;
		transition: color 0.3s ease;
	}

	:global(a:hover) {
		color: #8b9df5;
		text-decoration: underline;
	}
</style>
