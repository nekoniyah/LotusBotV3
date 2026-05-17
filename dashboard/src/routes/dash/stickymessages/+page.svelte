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

	async function onDelete(id: number) {
		const r = await fetch(`${root}/api/stickymessages/${id}`, {
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
			(ev.target as HTMLFormElement).reset();
			selectedChannelId = '';
		} catch (e) {
			console.error(e);
		}
	}
</script>

<div class="page-container">
	{#if $token}
		<div class="create-section">
			<div class="section-header">
				<i class="fa-solid fa-thumbtack"></i>
				<h1>Create Sticky Message</h1>
			</div>
			<p class="section-description">Create a message that stays pinned to the bottom of a channel</p>
			
			<form class="sticky-form" onsubmit={onSubmit}>
				<div class="form-group">
					<label for="channel">
						<i class="fa-solid fa-hashtag"></i>
						Channel
					</label>
					<ChannelSelect bind:channelId={selectedChannelId}></ChannelSelect>
				</div>
				
				<div class="form-group">
					<label for="content">
						<i class="fa-solid fa-message"></i>
						Message Content
					</label>
					<textarea 
						name="content" 
						id="content" 
						placeholder="Enter your sticky message here..."
						rows="4"
					></textarea>
				</div>
				
				<button type="submit" class="submit-btn">
					<i class="fa-solid fa-plus"></i>
					Create Sticky Message
				</button>
			</form>
		</div>
	{/if}

	<div class="list-section">
		<div class="section-header">
			<i class="fa-solid fa-list"></i>
			<h2>Active Sticky Messages</h2>
		</div>
		
		{#if $token && stickyMessages.length}
			<div class="sticky-list">
				{#each stickyMessages as sticky}
					{#await fetchChannel(sticky.channelId) then json}
						<div class="sticky-card">
							<div class="sticky-header">
								<a href={`https://discord.com/channels/${json.guildId}/${json.id}`} class="channel-link">
									<i class="fa-solid fa-hashtag"></i>
									{json.name}
								</a>
								<button class="delete-btn danger" onclick={() => onDelete(sticky.id)}>
									<i class="fa-solid fa-trash"></i>
								</button>
							</div>
							<div class="sticky-content">
								<p>{sticky.content}</p>
							</div>
						</div>
					{/await}
				{/each}
			</div>
		{:else if $token}
			<div class="empty-state">
				<i class="fa-solid fa-inbox"></i>
				<p>No sticky messages yet</p>
				<span>Create your first sticky message above</span>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.page-container {
		max-width: 900px;
		margin: 0 auto;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;

		i {
			color: #667eea;
			font-size: 1.5rem;
		}

		h1, h2 {
			margin: 0;
			color: #ffffff;
		}
	}

	.section-description {
		color: #8b949e;
		margin-bottom: 1.5rem;
		margin-left: 36px;
	}

	.create-section {
		background: linear-gradient(145deg, #1e1e32 0%, #16213e 100%);
		border-radius: 16px;
		padding: 2rem;
		margin-bottom: 2rem;
		border: 1px solid #2d2d44;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.sticky-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;

		label {
			display: flex;
			align-items: center;
			gap: 8px;
			font-weight: 600;
			color: #c9d1d9;
			font-size: 0.95rem;

			i {
				color: #667eea;
				width: 16px;
			}
		}
	}

	.submit-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		margin-top: 0.5rem;
		padding: 14px 28px;
		font-size: 1rem;
	}

	.list-section {
		background: linear-gradient(145deg, #1e1e32 0%, #16213e 100%);
		border-radius: 16px;
		padding: 2rem;
		border: 1px solid #2d2d44;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.sticky-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.sticky-card {
		background: rgba(22, 33, 62, 0.8);
		border: 1px solid #2d2d44;
		border-radius: 12px;
		overflow: hidden;
		transition: all 0.3s ease;

		&:hover {
			border-color: #667eea;
			box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
		}
	}

	.sticky-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		background: rgba(102, 126, 234, 0.1);
		border-bottom: 1px solid #2d2d44;
	}

	.channel-link {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #667eea;
		font-weight: 600;
		font-size: 1rem;
		text-decoration: none;
		transition: color 0.3s ease;

		i {
			font-size: 0.9rem;
		}

		&:hover {
			color: #8b9df5;
		}
	}

	.delete-btn {
		padding: 8px 12px;
		font-size: 0.85rem;
		
		i {
			margin: 0;
		}
	}

	.sticky-content {
		padding: 1.25rem;

		p {
			margin: 0;
			color: #c9d1d9;
			line-height: 1.6;
			white-space: pre-wrap;
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		color: #6b7280;
		text-align: center;

		i {
			font-size: 3rem;
			margin-bottom: 1rem;
			color: #4a5568;
		}

		p {
			font-size: 1.1rem;
			font-weight: 600;
			margin: 0 0 0.5rem 0;
			color: #8b949e;
		}

		span {
			font-size: 0.9rem;
		}
	}

	@media (max-width: 640px) {
		.create-section,
		.list-section {
			padding: 1.25rem;
		}

		.section-description {
			margin-left: 0;
		}
	}
</style>
