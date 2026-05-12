<script lang="ts">
	import { root, token } from '$lib';
	let roles: any[] = $state([]);

	let { roleId = $bindable() }: { roleId: string | null } = $props();

	token.subscribe(async (val) => {
		if (val) {
			const res = await fetch(`${root}/api/roles`, { headers: { Authorization: $token! } });
			roles = await res.json();
		}
	});
</script>

<div>
	<select bind:value={roleId}>
		<option value="">Please select a role</option>
		{#each roles as role}
			<option value={role.id} id="opt">
				<span>@</span>
				<p>{role.name}</p>
			</option>
		{/each}
	</select>
</div>

<style lang="scss">
	select {
		border: none;
		outline: none;
		background-color: rgb(32, 59, 90);
		width: 280px;
		height: 40px;
		padding: 10px;
		padding-left: 40px;
		border-radius: 15px;
		color: white;
		font-family: sans-serif;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	select::picker-icon {
		color: #999999;
		transition: 0.4s rotate;
	}

	select,
	::picker(select) {
		appearance: base-select;
		border-radius: 15px;
	}

	option:first-of-type {
		border-radius: 8px 8px 0 0;
	}

	option:last-of-type {
		border-radius: 0 0 8px 8px;
	}

	::picker(select) {
		border-radius: 8px;
	}

	option:not(option:last-of-type) {
		border-bottom: none;
	}

	option:hover,
	option:focus {
		background-color: rgba(32, 59, 90, 0.3);
	}
</style>
