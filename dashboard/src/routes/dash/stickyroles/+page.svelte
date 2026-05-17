<script lang="ts">
	import { goto } from '$app/navigation';
	import { root, token } from '$lib';
	import RoleSelect from '$lib/components/RoleSelect.svelte';

	interface StickyRole {
		roleId: string;
	}

	interface Role {
		id: string;
		name: string;
		color: number;
		position: number;
	}

	let stickyRoles: StickyRole[] = $state([]);
	let roles: Role[] = $state([]);
	let isSubmitting = $state(false);
	let selectedRoleId = $state('');

	async function loadStickyRoles() {
		const res = await fetch(`${root}/api/stickyroles`, {
			headers: { Authorization: $token! }
		});

		if (res.status === 401) {
			localStorage.removeItem('token');
			await goto('/login');
			return;
		}

		stickyRoles = await res.json();
	}

	async function loadRoles() {
		const res = await fetch(`${root}/api/roles`, {
			headers: { Authorization: $token! }
		});

		if (res.ok) {
			const allRoles = await res.json();
			roles = allRoles
				.filter((r: Role) => r.name !== '@everyone')
				.sort((a: Role, b: Role) => b.position - a.position);
		}
	}

	token.subscribe(async (t) => {
		if (t) {
			await Promise.all([loadStickyRoles(), loadRoles()]);
		}
	});

	function getRoleName(roleId: string): string {
		const role = roles.find(r => r.id === roleId);
		return role ? role.name : 'Unknown Role';
	}

	function getRoleColor(roleId: string): string {
		const role = roles.find(r => r.id === roleId);
		if (role && role.color) {
			return `#${role.color.toString(16).padStart(6, '0')}`;
		}
		return '#99aab5';
	}

	function getUsedRoleIds(): string[] {
		return stickyRoles.map(sr => sr.roleId);
	}

	async function onSubmit(ev: SubmitEvent) {
		ev.preventDefault();

		if (!selectedRoleId) return;

		isSubmitting = true;

		try {
			const res = await fetch(`${root}/api/stickyroles`, {
				method: 'POST',
				headers: {
					Authorization: $token!,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ roleId: selectedRoleId })
			});

			if (res.ok) {
				selectedRoleId = '';
				await loadStickyRoles();
			} else {
				const error = await res.json();
				alert(error.message || 'Failed to add sticky role');
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function onDelete(roleId: string) {
		const roleName = getRoleName(roleId);
		if (!confirm(`Are you sure you want to remove "${roleName}" from sticky roles?`)) {
			return;
		}

		const res = await fetch(`${root}/api/stickyroles/${roleId}`, {
			method: 'DELETE',
			headers: { Authorization: $token! }
		});

		if (res.ok) {
			await loadStickyRoles();
		}
	}
</script>

<div class="page-container">
	<!-- Info Section -->
	<div class="info-banner">
		<div class="info-icon">
			<i class="fa-solid fa-circle-info"></i>
		</div>
		<div class="info-content">
			<h3>What are Sticky Roles?</h3>
			<p>Sticky roles are automatically restored when a member rejoins the server. If a user had a sticky role before leaving, they'll get it back when they return.</p>
		</div>
	</div>

	<!-- Add Section -->
	<div class="create-section">
		<div class="section-header">
			<i class="fa-solid fa-magnet"></i>
			<h1>Sticky Roles</h1>
		</div>
		<p class="section-description">Configure which roles persist when members rejoin the server</p>

		<form class="sticky-role-form" onsubmit={onSubmit}>
			<div class="form-row">
				<div class="form-group">
					<label for="role">
						<i class="fa-solid fa-user-tag"></i>
						Select Role to Make Sticky
					</label>
					<RoleSelect bind:roleId={selectedRoleId} excludeRoles={getUsedRoleIds()} />
				</div>

				<button
					type="submit"
					class="submit-btn"
					disabled={!selectedRoleId || isSubmitting}
				>
					{#if isSubmitting}
						<i class="fa-solid fa-spinner fa-spin"></i>
						Adding...
					{:else}
						<i class="fa-solid fa-plus"></i>
						Add Sticky Role
					{/if}
				</button>
			</div>
		</form>
	</div>

	<!-- Existing Sticky Roles -->
	<div class="list-section">
		<div class="section-header">
			<i class="fa-solid fa-list"></i>
			<h2>Configured Sticky Roles</h2>
			{#if stickyRoles.length > 0}
				<span class="count-badge">{stickyRoles.length}</span>
			{/if}
		</div>

		{#if stickyRoles.length > 0}
			<div class="sticky-roles-grid">
				{#each stickyRoles as sr}
					<div class="sticky-role-card" style="--role-color: {getRoleColor(sr.roleId)}">
						<div class="role-info">
							<div class="role-color-indicator"></div>
							<span class="role-name">@{getRoleName(sr.roleId)}</span>
						</div>
						<button class="delete-btn" onclick={() => onDelete(sr.roleId)} title="Remove sticky role">
							<i class="fa-solid fa-trash"></i>
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<i class="fa-solid fa-magnet"></i>
				<p>No sticky roles configured</p>
				<span>Add roles above to make them persist when members rejoin</span>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.page-container {
		max-width: 900px;
		margin: 0 auto;
	}

	.info-banner {
		display: flex;
		gap: 1rem;
		background: linear-gradient(145deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
		border: 1px solid rgba(102, 126, 234, 0.3);
		border-radius: 12px;
		padding: 1.25rem;
		margin-bottom: 2rem;

		.info-icon {
			width: 44px;
			height: 44px;
			background: rgba(102, 126, 234, 0.2);
			border-radius: 10px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			i {
				color: #667eea;
				font-size: 1.2rem;
			}
		}

		.info-content {
			h3 {
				margin: 0 0 0.5rem 0;
				color: #c9d1d9;
				font-size: 1rem;
			}

			p {
				margin: 0;
				color: #8b949e;
				font-size: 0.9rem;
				line-height: 1.5;
			}
		}
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;

		> i {
			color: #667eea;
			font-size: 1.5rem;
		}

		h1, h2 {
			margin: 0;
			color: #ffffff;
		}

		.count-badge {
			background: rgba(102, 126, 234, 0.2);
			color: #667eea;
			padding: 4px 10px;
			border-radius: 12px;
			font-size: 0.85rem;
			font-weight: 600;
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

	.sticky-role-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-row {
		display: flex;
		gap: 1rem;
		align-items: flex-end;
	}

	.form-group {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;

		label {
			display: flex;
			align-items: center;
			gap: 8px;
			font-weight: 600;
			color: #c9d1d9;
			font-size: 0.9rem;

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
		padding: 14px 24px;
		font-size: 0.95rem;
		white-space: nowrap;
		height: fit-content;
	}

	/* List Section */
	.list-section {
		background: linear-gradient(145deg, #1e1e32 0%, #16213e 100%);
		border-radius: 16px;
		padding: 2rem;
		border: 1px solid #2d2d44;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.sticky-roles-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.sticky-role-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: rgba(22, 33, 62, 0.8);
		border: 1px solid #2d2d44;
		border-left: 4px solid var(--role-color, #667eea);
		border-radius: 0 10px 10px 0;
		padding: 1rem 1.25rem;
		transition: all 0.2s ease;

		&:hover {
			border-color: var(--role-color, #667eea);
			background: rgba(22, 33, 62, 1);
		}
	}

	.role-info {
		display: flex;
		align-items: center;
		gap: 12px;

		.role-color-indicator {
			width: 12px;
			height: 12px;
			background: var(--role-color, #667eea);
			border-radius: 50%;
			flex-shrink: 0;
		}

		.role-name {
			color: var(--role-color, #c9d1d9);
			font-weight: 600;
			font-size: 1rem;
		}
	}

	.delete-btn {
		width: 36px;
		height: 36px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(239, 68, 68, 0.15);
		color: #ef4444;
		border-radius: 8px;
		box-shadow: none;
		flex-shrink: 0;

		&:hover {
			background: rgba(239, 68, 68, 0.25);
			transform: none;
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
		.info-banner {
			flex-direction: column;
			text-align: center;

			.info-icon {
				align-self: center;
			}
		}

		.form-row {
			flex-direction: column;
			align-items: stretch;

			.submit-btn {
				justify-content: center;
			}
		}

		.create-section,
		.list-section {
			padding: 1.25rem;
		}

		.section-description {
			margin-left: 0;
		}

		.sticky-roles-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
