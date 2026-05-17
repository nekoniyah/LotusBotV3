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

<div class="channel-select-wrapper">
	<i class="fa-solid fa-hashtag channel-icon"></i>
	<select bind:value={channelId} id="channel" name="channel">
		<option value="">Select a channel...</option>
		{#each channels as channel}
			{#if channel.type === 0}
				<option value={channel.id}>
					{channel.name}
				</option>
			{/if}
		{/each}
	</select>
</div>

<style lang="scss">
	.channel-select-wrapper {
		position: relative;
		width: 100%;
	}

	.channel-icon {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		color: #667eea;
		font-size: 1rem;
		pointer-events: none;
		z-index: 1;
	}

	select {
		width: 100%;
		padding: 14px 18px 14px 44px;
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

	select:focus {
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
	}

	select:hover {
		border-color: #4a5568;
	}

	select option {
		background-color: #16213e;
		color: #eaeaea;
		padding: 12px;
	}
</style>
