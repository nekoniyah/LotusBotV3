<script lang="ts">
	import { root, token } from '$lib';
	let { channelId = $bindable() }: { channelId: string | null } = $props();

	let channels: any[] = $state([]);

	token.subscribe(async (val) => {
		if (val) {
			const res = await fetch(`${root}/api/channels`, { headers: { Authorization: $token! } });
			channels = await res.json();
		}
	});
</script>

<select bind:value={channelId} id="channel" name="channel">
	<option value="">Please select a channel</option>
	{#each channels as channel}
		{#if channel.type === 0}
			<option value={channel.id} id="opt">
				<span>#</span>
				<p>{channel.name}</p>
			</option>
		{/if}
	{/each}
</select>

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
