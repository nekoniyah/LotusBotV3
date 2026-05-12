<script lang="ts">
	import { root, token } from '$lib';
	import ChannelSelect from '$lib/components/ChannelSelect.svelte';

	let stickyMessages: { channelId: string; content: string; id: number }[] = $state([]);

	async function fetchStickyMessages(token: string) {
		const res = await fetch(`${root}/api/stickymessages`, { headers: { authorization: token } });
		stickyMessages = await res.json();
	}

	token.subscribe(async (token) => {
		if (!token) return;
		await fetchStickyMessages(token);
	});

	async function fetchChannel(id: string) {
		const res = await fetch(`${root}/api/channels/${id}`, {
			headers: { authorization: $token! }
		});
		console.log(id);
		return await res.json();
	}

	async function onDelete(ev: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		const i = ev.currentTarget.classList[1].split('-')[1];

		const r = await fetch(`${root}/api/stickymessages/${i}`, {
			method: 'delete',
			headers: {
				authorization: $token!
			}
		});

		await fetchStickyMessages($token!);
	}

	let selectedChannelId = $state('');

	async function onSubmit(ev: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
		ev.preventDefault();

		const f = new FormData(ev.target as HTMLFormElement);

		const data = {
			content: f.get('content'),
			channelId: f.get('channel')
		};

		try {
			await fetch(`${root}/api/stickymessages`, {
				method: 'post',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json',
					authorization: $token!
				}
			});

			await fetchStickyMessages($token!);
		} catch (e) {
			console.error(e);
		}
	}
</script>

{#if $token}
	<h1>Creating a sticky message</h1>
	<form class="form" onsubmit={onSubmit}>
		<ChannelSelect bind:channelId={selectedChannelId}></ChannelSelect>
		<textarea name="content" id="content" placeholder="Your message..."></textarea>
		<button type="submit">Create</button>
	</form>
{/if}

<div class="list">
	{#if $token && stickyMessages.length}
		{#each stickyMessages as sticky}
			{#await fetchChannel(sticky.channelId) then json}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class={`stickymsg s-${sticky.id}`} ondblclick={onDelete}>
					<a href={`https://discord.com/channels/${json.guildId}/${json.id}`}
						><p><b>#{json.name}</b></p></a
					>
					<p>"{sticky.content}"</p>
				</div>
			{/await}
		{/each}
	{/if}
</div>

<style lang="scss">
	form {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 20%;

		* {
			width: 100%;
		}
	}

	.list {
		margin-top: 20px;
		display: flex;
		flex-wrap: wrap;
		gap: 10px;

		.stickymsg {
			background-color: gray;
			padding: 10px;
			border: 1px solid black;
			width: 50%;

			a {
				text-decoration: none;
				color: white;
				width: 5%;

				* {
					width: 100px;
				}

				&:hover {
					text-decoration-line: underline;
				}
			}
		}
	}
</style>
