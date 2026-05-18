<script lang="ts">
	import { root, token } from '$lib';

	let config: { baseThreshold: number; thresholdIncrement: number } | null = $state(null);
	let saving = $state(false);
	let saveError = $state('');
	let saveSuccess = $state(false);

	// Form fields
	let baseThreshold = $state(100);
	let thresholdIncrement = $state(5);

	async function fetchConfig(tk: string) {
		const res = await fetch(`${root}/api/boss`, { headers: { authorization: tk } });
		if (res.ok) {
			config = await res.json();
			baseThreshold = config!.baseThreshold;
			thresholdIncrement = config!.thresholdIncrement;
		}
	}

	token.subscribe(async (tk) => {
		if (!tk) return;
		await fetchConfig(tk);
	});

	async function onSubmit(ev: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
		ev.preventDefault();
		saving = true;
		saveError = '';
		saveSuccess = false;

		try {
			const res = await fetch(`${root}/api/boss`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					authorization: $token!
				},
				body: JSON.stringify({ baseThreshold, thresholdIncrement })
			});

			if (!res.ok) {
				const data = await res.json();
				saveError = data.error ?? 'Failed to save configuration.';
			} else {
				const data = await res.json();
				config = data.config;
				saveSuccess = true;
				setTimeout(() => (saveSuccess = false), 3000);
			}
		} catch (e) {
			saveError = 'An unexpected error occurred.';
		} finally {
			saving = false;
		}
	}
</script>

<div class="page-container">
	<div class="page-header">
		<div class="header-icon">
			<i class="fa-solid fa-skull-crossbones"></i>
		</div>
		<div>
			<h1>Boss Fight Config</h1>
			<p class="header-desc">Configure the boss fight spawn thresholds for the RPG system</p>
		</div>
	</div>

	{#if $token && config !== null}
		<div class="config-section">
			<div class="section-header">
				<i class="fa-solid fa-sliders"></i>
				<h2>Spawn Settings</h2>
			</div>
			<p class="section-description">
				A boss spawns when the message counter reaches the current threshold. After each boss fight,
				the threshold increases by the increment value.
			</p>

			<form class="config-form" onsubmit={onSubmit}>
				<div class="form-grid">
					<div class="form-group">
						<label for="baseThreshold">
							<i class="fa-solid fa-flag-checkered"></i>
							Base Threshold
						</label>
						<p class="field-desc">
							The initial number of messages required to trigger the first boss spawn.
						</p>
						<input
							type="number"
							id="baseThreshold"
							min="1"
							step="1"
							bind:value={baseThreshold}
						/>
					</div>

					<div class="form-group">
						<label for="thresholdIncrement">
							<i class="fa-solid fa-arrow-trend-up"></i>
							Threshold Increment
						</label>
						<p class="field-desc">
							How much the threshold increases after each boss fight is completed.
						</p>
						<input
							type="number"
							id="thresholdIncrement"
							min="1"
							step="1"
							bind:value={thresholdIncrement}
						/>
					</div>
				</div>

				{#if saveError}
					<div class="alert error">
						<i class="fa-solid fa-circle-exclamation"></i>
						{saveError}
					</div>
				{/if}

				{#if saveSuccess}
					<div class="alert success">
						<i class="fa-solid fa-circle-check"></i>
						Configuration saved successfully.
					</div>
				{/if}

				<button type="submit" class="submit-btn" disabled={saving}>
					{#if saving}
						<i class="fa-solid fa-spinner fa-spin"></i>
						Saving...
					{:else}
						<i class="fa-solid fa-floppy-disk"></i>
						Save Configuration
					{/if}
				</button>
			</form>
		</div>

		<div class="info-section">
			<div class="section-header">
				<i class="fa-solid fa-circle-info"></i>
				<h2>Current Values</h2>
			</div>
			<div class="info-grid">
				<div class="info-card">
					<div class="info-icon">
						<i class="fa-solid fa-flag-checkered"></i>
					</div>
					<div class="info-content">
						<span class="info-label">Base Threshold</span>
						<span class="info-value">{config.baseThreshold} messages</span>
					</div>
				</div>
				<div class="info-card">
					<div class="info-icon">
						<i class="fa-solid fa-arrow-trend-up"></i>
					</div>
					<div class="info-content">
						<span class="info-label">Threshold Increment</span>
						<span class="info-value">+{config.thresholdIncrement} per fight</span>
					</div>
				</div>
			</div>
		</div>
	{:else if $token}
		<div class="loading-state">
			<i class="fa-solid fa-spinner fa-spin"></i>
			<p>Loading configuration...</p>
		</div>
	{/if}
</div>

<style lang="scss">
	.page-container {
		max-width: 900px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		margin-bottom: 2rem;

		.header-icon {
			width: 64px;
			height: 64px;
			background: linear-gradient(135deg, #f5af19 0%, #f12711 100%);
			border-radius: 16px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			box-shadow: 0 8px 24px rgba(245, 175, 25, 0.3);

			i {
				font-size: 1.75rem;
				color: white;
			}
		}

		h1 {
			margin: 0 0 0.25rem 0;
			color: #ffffff;
			font-size: 1.8rem;
			font-weight: 700;
		}

		.header-desc {
			margin: 0;
			color: #8b949e;
			font-size: 0.95rem;
		}
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;

		i {
			color: #667eea;
			font-size: 1.3rem;
		}

		h2 {
			margin: 0;
			color: #ffffff;
		}
	}

	.section-description {
		color: #8b949e;
		margin-bottom: 1.75rem;
		margin-left: 36px;
		line-height: 1.6;
	}

	.config-section {
		background: linear-gradient(145deg, #1e1e32 0%, #16213e 100%);
		border-radius: 16px;
		padding: 2rem;
		margin-bottom: 2rem;
		border: 1px solid #2d2d44;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.config-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;

		@media (max-width: 640px) {
			grid-template-columns: 1fr;
		}
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;

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

		.field-desc {
			color: #6b7280;
			font-size: 0.85rem;
			margin: 0 0 4px 0;
			line-height: 1.5;
		}

		input[type='number'] {
			padding: 12px 16px;
			font-size: 1rem;
			font-weight: 600;
		}
	}

	.submit-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 14px 28px;
		font-size: 1rem;
		align-self: flex-start;

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.alert {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		border-radius: 10px;
		font-size: 0.95rem;
		font-weight: 500;

		i {
			font-size: 1rem;
		}

		&.error {
			background: rgba(239, 68, 68, 0.15);
			border: 1px solid rgba(239, 68, 68, 0.4);
			color: #fca5a5;

			i {
				color: #ef4444;
			}
		}

		&.success {
			background: rgba(16, 185, 129, 0.15);
			border: 1px solid rgba(16, 185, 129, 0.4);
			color: #6ee7b7;

			i {
				color: #10b981;
			}
		}
	}

	.info-section {
		background: linear-gradient(145deg, #1e1e32 0%, #16213e 100%);
		border-radius: 16px;
		padding: 2rem;
		border: 1px solid #2d2d44;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-top: 1.5rem;

		@media (max-width: 640px) {
			grid-template-columns: 1fr;
		}
	}

	.info-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: rgba(22, 33, 62, 0.8);
		border: 1px solid #2d2d44;
		border-radius: 12px;
		padding: 1.25rem;
		transition: border-color 0.3s ease;

		&:hover {
			border-color: #667eea;
		}

		.info-icon {
			width: 48px;
			height: 48px;
			background: linear-gradient(135deg, rgba(245, 175, 25, 0.2) 0%, rgba(241, 39, 17, 0.2) 100%);
			border-radius: 10px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			i {
				font-size: 1.2rem;
				color: #f5af19;
			}
		}

		.info-content {
			display: flex;
			flex-direction: column;
			gap: 4px;

			.info-label {
				color: #6b7280;
				font-size: 0.8rem;
				font-weight: 600;
				text-transform: uppercase;
				letter-spacing: 0.5px;
			}

			.info-value {
				color: #ffffff;
				font-size: 1.1rem;
				font-weight: 700;
			}
		}
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem;
		color: #6b7280;
		gap: 1rem;

		i {
			font-size: 2rem;
			color: #667eea;
		}

		p {
			margin: 0;
			font-size: 1rem;
		}
	}

	@media (max-width: 640px) {
		.config-section,
		.info-section {
			padding: 1.25rem;
		}

		.section-description {
			margin-left: 0;
		}

		.page-header {
			flex-direction: row;
			align-items: flex-start;

			.header-icon {
				width: 52px;
				height: 52px;

				i {
					font-size: 1.4rem;
				}
			}

			h1 {
				font-size: 1.4rem;
			}
		}
	}
</style>
